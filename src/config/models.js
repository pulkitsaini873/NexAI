/**
 * Model configuration for all supported providers.
 * Each model includes provider details, endpoint info, and format type.
 */

export const PROVIDERS = {
  GROQ: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyName: 'groq_api_key',
    format: 'openai',
  },
  GOOGLE: {
    name: 'Google AI Studio',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    keyName: 'google_api_key',
    format: 'google',
  },
  OPENROUTER: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyName: 'openrouter_api_key',
    format: 'openai',
  },
  NVIDIA: {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    keyName: 'nvidia_api_key',
    format: 'openai',
  },
  MISTRAL: {
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    keyName: 'mistral_api_key',
    format: 'openai',
  },
};

export const CHAT_MODELS = [
  // Groq
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'GROQ',
    badge: 'fast',
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
    provider: 'GROQ',
    badge: 'new',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: 'GROQ',
    badge: null,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'GROQ',
    badge: null,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    provider: 'GROQ',
    badge: null,
  },

  // Google AI Studio
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'GOOGLE',
    badge: 'pro',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'GOOGLE',
    badge: 'fast',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'GOOGLE',
    badge: 'fast',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'GOOGLE',
    badge: 'pro',
  },

  // OpenRouter (Free Tier Highlights)
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'OPENROUTER',
    badge: 'reasoning',
  },
  {
    id: 'google/gemini-2.5-flash-free',
    name: 'Gemini 2.5 Flash (OR)',
    provider: 'OPENROUTER',
    badge: 'free',
  },
  {
    id: 'liquid/lfm-40b:free',
    name: 'Liquid LFM 40B',
    provider: 'OPENROUTER',
    badge: 'free',
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B',
    provider: 'OPENROUTER',
    badge: 'free',
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Llama 4 Maverick',
    provider: 'OPENROUTER',
    badge: 'new',
  },

  // NVIDIA NIM (Explicit Identifiers required for OpenAI format)
  {
    id: 'meta/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    provider: 'NVIDIA',
    badge: 'huge',
  },
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'NVIDIA',
    badge: null,
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron 70B',
    provider: 'NVIDIA',
    badge: 'nvidia',
  },
  {
    id: 'mistralai/mixtral-8x22b-instruct-v0.1',
    name: 'Mixtral 8x22B',
    provider: 'NVIDIA',
    badge: null,
  },

  // Mistral
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'MISTRAL',
    badge: 'pro',
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    provider: 'MISTRAL',
    badge: 'fast',
  },
  {
    id: 'open-mixtral-8x22b',
    name: 'Mixtral 8x22B',
    provider: 'MISTRAL',
    badge: null,
  },
  {
    id: 'codestral-latest',
    name: 'Codestral',
    provider: 'MISTRAL',
    badge: 'code',
  },
];

export const IMAGE_MODELS = [
  {
    id: 'stabilityai/stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'NVIDIA',
  },
  {
    id: 'nvidia/consistory',
    name: 'Consistory',
    provider: 'NVIDIA',
  },
];

export const TTS_CONFIG = {
  standardEndpoint: 'https://integrate.api.nvidia.com/v1/audio/speech',
  model: 'nvidia/magpie-tts-multilingual',
  voices: ['English-US.Female-1', 'English-US.Male-1', 'English-US.Female-2', 'English-US.Male-2'],
  defaultVoice: 'English-US.Female-1',
};

export function getModelsByProvider() {
  const grouped = {};
  for (const model of CHAT_MODELS) {
    const providerKey = model.provider;
    if (!grouped[providerKey]) {
      grouped[providerKey] = {
        provider: PROVIDERS[providerKey],
        models: [],
      };
    }
    grouped[providerKey].models.push(model);
  }
  return grouped;
}

export function getModelById(modelId) {
  return CHAT_MODELS.find((m) => m.id === modelId);
}

export function getProviderForModel(modelId) {
  const model = getModelById(modelId);
  if (!model) return null;
  return PROVIDERS[model.provider];
}
