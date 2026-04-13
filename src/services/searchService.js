/**
 * Web Search service using DuckDuckGo.
 * Falls back to a simple fetch approach with CORS handling.
 */

const DDG_PROXY_URL = 'https://api.duckduckgo.com/';

/**
 * Search DuckDuckGo and return parsed results.
 * Uses the Instant Answer API (JSON) as a starting point.
 * For full web results, a Cloudflare Worker proxy would be needed.
 */
export async function searchWeb(query, maxResults = 5) {
  try {
    // Try DuckDuckGo Instant Answer API (no CORS issues)
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      no_html: '1',
      skip_disambig: '1',
    });

    const response = await fetch(`${DDG_PROXY_URL}?${params}`);
    if (!response.ok) throw new Error('DuckDuckGo API error');

    const data = await response.json();
    const results = [];

    // Extract from Abstract
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'DuckDuckGo',
        snippet: data.Abstract,
        url: data.AbstractURL || '',
      });
    }

    // Extract from RelatedTopics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0]?.slice(0, 80) || 'Related',
            snippet: topic.Text,
            url: topic.FirstURL,
          });
        }
      }
    }

    // Extract from Results
    if (data.Results) {
      for (const result of data.Results.slice(0, maxResults - results.length)) {
        results.push({
          title: result.Text?.slice(0, 80) || 'Result',
          snippet: result.Text || '',
          url: result.FirstURL || '',
        });
      }
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.warn('DuckDuckGo search failed:', error);
    return [];
  }
}

import { chatCompletion, getApiKeys } from './providerAdapter';

export function buildSearchContext(results) {
  if (!results || results.length === 0) {
    return 'No web results found. Respond from your training data and note this.';
  }

  let context = 'Web search results:\n\n';
  results.forEach((r, i) => {
    context += `[${i + 1}] ${r.title}\n`;
    context += `${r.summary || r.snippet}\n`;
    context += `Source: ${r.url}\n\n`;
  });

  context += '\nInstructions: Use the above curated facts to answer the user\'s question. ';
  context += 'Cite sources using [1], [2], etc. numbers referencing the results above. ';
  
  return context;
}

/**
 * Determine the fastest available model based on configured API keys.
 * Priorities: Groq -> Gemini -> Mistral -> OpenRouter -> NVIDIA
 */
function getFastModelId() {
  const keys = getApiKeys();
  if (keys['GROQ']) return 'llama-3.3-70b-versatile';
  if (keys['GOOGLE']) return 'gemini-1.5-flash';
  if (keys['MISTRAL']) return 'mistral-small-latest';
  if (keys['OPENROUTER']) return 'meta-llama/llama-3.1-8b-instruct:free';
  if (keys['NVIDIA']) return 'meta/llama-3.1-70b-instruct';
  return null;
}

/**
 * Agentic Pipeline:
 * Passes raw HTML/Search snippets to a fast reasoning LLM in the background.
 * The LLM compresses the information into structured JSON cards, dropping irrelevant tokens.
 */
export async function synthesizeSearchData(query, rawResults) {
  if (!rawResults || rawResults.length === 0) return [];
  
  const fastModel = getFastModelId();
  if (!fastModel) {
    // Fallback: If no keys exist for a sub-agent, just format the raw results.
    return rawResults.map(r => ({
      title: r.title,
      summary: r.snippet,
      url: r.url
    }));
  }

  const systemPrompt = `You are an expert web-research distillation agent.
Your job is to analyze the provided raw search results for the user's query and extract the MOST relevant information into clean, concise fact cards.
You absolutely must drop irrelevant information, ads, or garbage tokens.
You MUST output strictly in raw JSON array format matching this schema exactly:
[
  {
    "title": "Short descriptive title",
    "summary": "1-2 sentence distillation of the key facts from this source relevant to the query.",
    "url": "source URL"
  }
]
Do NOT wrap the JSON in markdown blocks like \`\`\`json. Output ONLY the raw JSON array.
Limit to the top 4 most useful sources.`;

  const userContent = `Query: "${query}"\n\nRaw Search Snippets:\n${JSON.stringify(rawResults)}`;

  try {
    const rawResponse = await chatCompletion({
      modelId: fastModel,
      messages: [{ role: 'user', content: userContent }],
      systemPrompt: systemPrompt
    });

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    const parsed = JSON.parse(cleaned.trim());
    
    // Ensure it's an array with at least one valid item
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed;
    }
    throw new Error("Invalid schema");

  } catch (error) {
    console.warn('Agentic search synthesis failed, falling back to raw maps:', error);
    return rawResults.slice(0, 4).map(r => ({
      title: r.title,
      summary: r.snippet,
      url: r.url
    }));
  }
}
