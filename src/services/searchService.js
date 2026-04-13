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

/**
 * Build a search context string to inject into the AI prompt
 */
export function buildSearchContext(results) {
  if (!results || results.length === 0) {
    return 'No web results found. Respond from your training data and note this.';
  }

  let context = 'Web search results:\n\n';
  results.forEach((r, i) => {
    context += `[${i + 1}] ${r.title}\n`;
    context += `${r.snippet}\n`;
    context += `Source: ${r.url}\n\n`;
  });

  context += '\nInstructions: Use the above search results to answer the user\'s question. ';
  context += 'Cite sources using [1], [2], etc. numbers referencing the results above. ';
  context += 'If the search results don\'t contain relevant information, say so and answer from your knowledge.';

  return context;
}
