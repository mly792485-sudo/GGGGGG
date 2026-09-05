/**
 * Safe localStorage wrapper with in-memory fallback
 * Prevents DOMException / SecurityError crashes in iframes and iOS Safari private browsing
 */

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Fallback to memory
      return memoryStore[key] || null;
    }
    return memoryStore[key] || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      memoryStore[key] = value;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Ignore or use memory
    }
  },

  removeItem: (key: string): void => {
    try {
      delete memoryStore[key];
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  },

  clear: (): void => {
    try {
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Ignore
    }
  }
};
