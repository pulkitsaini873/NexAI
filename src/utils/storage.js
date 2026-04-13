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
 * Save a chat session
 */
export function saveSession(id, title, messages) {
  try {
    const sessions = loadSessions();
    const index = sessions.findIndex(s => s.id === id);
    const updated = { id, title, messages, updatedAt: Date.now() };
    
    if (index >= 0) {
      sessions[index] = updated;
    } else {
      sessions.push(updated);
    }
    
    // Sort descending by time
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
}

/**
 * Load all chat sessions
 */
export function loadSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // Migration: If the old format was an array of messages directly instead of sessions
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
      const migrated = [{ id: 'legacy-session', title: 'Previous Chat', messages: parsed, updatedAt: Date.now() }];
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(migrated));
      return migrated;
    }
    
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Delete a specific chat session
 */
export function deleteSession(id) {
  try {
    const sessions = loadSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to delete session:', e);
  }
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
