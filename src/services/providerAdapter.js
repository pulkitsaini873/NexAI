/**
 * Provider adapter layer.
 * Normalizes chat requests and streaming responses across all providers
 * into a single interface.
 */

import { PROVIDERS, getModelById } from '../config/models';

/**
 * Get the stored API key for a provider
 */
export function getApiKey(providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return null;
  return localStorage.getItem(provider.keyName) || null;
}

/**
 * Get all configured API keys
 */
export function getApiKeys() {
  const keys = {};
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    const val = localStorage.getItem(provider.keyName);
    if (val) keys[key] = val;
  }
  return keys;
}

/**
 * Check if an API key is configured for a provider
 */
export function hasApiKey(providerKey) {
  return !!getApiKey(providerKey);
}

/**
 * Save an API key for a provider
 */
export function saveApiKey(providerKey, key) {
  const provider = PROVIDERS[providerKey];
  if (provider) {
    localStorage.setItem(provider.keyName, key);
  }
}

/**
 * Build request headers for a provider
 */
function buildHeaders(providerKey) {
  const apiKey = getApiKey(providerKey);
  const provider = PROVIDERS[providerKey];

  if (provider.format === 'google') {
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

/**
 * Build a chat request body normalized across providers
 */
function buildRequestBody(modelId, messages, systemPrompt) {
  const model = getModelById(modelId);
  if (!model) throw new Error(`Model not found: ${modelId}`);

  const provider = PROVIDERS[model.provider];

  if (provider.format === 'google') {
    return buildGoogleBody(modelId, messages, systemPrompt);
  }

  // OpenAI-compatible format (Groq, OpenRouter, NVIDIA, Mistral)
  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
  );

  return {
    model: modelId,
    messages: formattedMessages,
    stream: true,
    max_tokens: 4096,
  };
}

/**
 * Build Google Gemini-specific request body
 */
function buildGoogleBody(modelId, messages, systemPrompt) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = { contents };
  
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  return body;
}

/**
 * Get the streaming endpoint URL for a model
 */
function getStreamUrl(modelId) {
  const model = getModelById(modelId);
  if (!model) throw new Error(`Model not found: ${modelId}`);

  const provider = PROVIDERS[model.provider];
  const apiKey = getApiKey(model.provider);

  if (provider.format === 'google') {
    return `${provider.baseUrl}/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
  }

  return `${provider.baseUrl}/chat/completions`;
}

/**
 * Stream a chat completion.
 * 
 * @param {string} modelId - The model ID
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} systemPrompt - Optional system prompt
 * @param {function} onToken - Callback for each token: (token: string) => void
 * @param {function} onDone - Callback when streaming is done
 * @param {function} onError - Callback on error
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<void>}
 */
export async function streamChat({ modelId, messages, systemPrompt, onToken, onDone, onError, signal }) {
  const model = getModelById(modelId);
  if (!model) {
    onError?.(new Error(`Model not found: ${modelId}`));
    return;
  }

  const provider = PROVIDERS[model.provider];
  const url = getStreamUrl(modelId);
  const headers = buildHeaders(model.provider);
  const body = buildRequestBody(modelId, messages, systemPrompt);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        errorMsg = errorText;
      }
      
      if (response.status === 429) {
        throw new Error(`Rate limit reached for ${provider.name}. Try switching to a different model.`);
      }
      throw new Error(`${provider.name} API error (${response.status}): ${errorMsg}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          onDone?.();
          return;
        }

        try {
          const parsed = JSON.parse(data);

          if (provider.format === 'google') {
            // Google Gemini format
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) onToken?.(text);
          } else {
            // OpenAI-compatible format
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onToken?.(delta);

            // Check for finish
            if (parsed.choices?.[0]?.finish_reason === 'stop') {
              onDone?.();
              return;
            }
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    onDone?.();
  } catch (err) {
    if (err.name === 'AbortError') return;
    onError?.(err);
  }
}

/**
 * Send a non-streaming chat request (used for web search refinement)
 */
export async function chatCompletion({ modelId, messages, systemPrompt }) {
  const model = getModelById(modelId);
  if (!model) throw new Error(`Model not found: ${modelId}`);

  const provider = PROVIDERS[model.provider];
  const headers = buildHeaders(model.provider);
  const apiKey = getApiKey(model.provider);

  if (provider.format === 'google') {
    const body = buildGoogleBody(modelId, messages, systemPrompt);
    const url = `${provider.baseUrl}/models/${modelId}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  const body = buildRequestBody(modelId, messages, systemPrompt);
  body.stream = false;

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`${provider.name} API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
