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
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    provider: 'GROQ',
    badge: null,
  },

  // Google AI Studio
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

  // OpenRouter
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'OPENROUTER',
    badge: 'reasoning',
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Llama 4 Maverick',
    provider: 'OPENROUTER',
    badge: 'new',
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B',
    provider: 'OPENROUTER',
    badge: null,
  },

  // NVIDIA NIM
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron 70B',
    provider: 'NVIDIA',
    badge: null,
  },
  {
    id: 'qwen/qwen2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
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
