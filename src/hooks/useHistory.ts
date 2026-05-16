import { useState, useCallback } from 'react';
import type { Pokemon } from '../data/pokemon';

const STORAGE_KEY = 'pokecham_history';

function loadHistory(): Pokemon[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Pokemon[];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<Pokemon[]>(loadHistory);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.setItem(STORAGE_KEY, '[]');
  }, []);

  return { history, clearHistory };
}
