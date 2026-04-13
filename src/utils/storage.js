/**
 * localStorage utilities for persistence.
 */

const STORAGE_KEYS = {
  CHAT_HISTORY: 'nexai_chat_history',
  PREFERENCES: 'nexai_preferences',
  IMAGE_PROMPTS: 'nexai_image_prompts',
  SYSTEM_PROMPT: 'nexai_system_prompt',
  ONBOARDED: 'nexai_onboarded',
};

/**
 * Save chat history
 */
export function saveChatHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
}

/**
 * Load chat history
 */
export function loadChatHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Clear chat history
 */
export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

/**
 * Save user preferences
 */
export function savePreferences(prefs) {
  try {
    const existing = loadPreferences();
    const merged = { ...existing, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

/**
 * Load user preferences
 */
export function loadPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : {
      selectedModel: 'llama-3.3-70b-versatile',
      ttsVoice: 'English-US.Female-1',
      liveTts: false,
      webSearchDefault: false,
    };
  } catch {
    return {
      selectedModel: 'llama-3.3-70b-versatile',
      ttsVoice: 'English-US.Female-1',
      liveTts: false,
      webSearchDefault: false,
    };
  }
}

/**
 * Save image prompt history (last 10)
 */
export function saveImagePrompt(prompt) {
  try {
    const prompts = loadImagePrompts();
    const updated = [prompt, ...prompts.filter((p) => p !== prompt)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.IMAGE_PROMPTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save image prompt:', e);
  }
}

/**
 * Load image prompt history
 */
export function loadImagePrompts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IMAGE_PROMPTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save system prompt
 */
export function saveSystemPrompt(prompt) {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, prompt);
}

/**
 * Load system prompt
 */
export function loadSystemPrompt() {
  return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || '';
}

/**
 * Onboarding status
 */
export function isOnboarded() {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
}

export function setOnboarded() {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
}
