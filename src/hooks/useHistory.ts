import { useState, useCallback } from 'react';
import type { Pokemon } from '../data/pokemon';

const STORAGE_KEY = 'pokecham_history';
const MAX_HISTORY = 20;

function loadHistory(): Pokemon[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Pokemon[];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<Pokemon[]>(loadHistory);

  const addToHistory = useCallback((poke: Pokemon) => {
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
