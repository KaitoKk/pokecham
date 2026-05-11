import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pokecham_history';
const MAX_HISTORY = 20;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory);

  const addToHistory = useCallback((poke) => {
    setHistory(prev => {
      const next = [
        poke,
        ...prev.filter(h => !(h.name === poke.name && (h.form || '') === (poke.form || '')))
      ].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.setItem(STORAGE_KEY, '[]');
  }, []);

  return { history, addToHistory, clearHistory };
}
