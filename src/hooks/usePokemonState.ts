import { useState, useCallback } from 'react';
import { searchPokemon } from '../utils/search';
import { toYomiKatakana } from '../utils/yomi';
import type { Pokemon } from '../data/pokemon';

export interface PokemonState {
  currentPokemon: Pokemon | null;
  candidates: Pokemon[];
  notFound: boolean;
  lastQuery: string;
  showPokemon: (poke: Pokemon) => void;
  handleQuery: (query: string) => Promise<void>;
}

export function usePokemonState(): PokemonState {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [candidates, setCandidates] = useState<Pokemon[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const showPokemon = useCallback((poke: Pokemon) => {
    setCurrentPokemon(poke);
    setCandidates([]);
    setNotFound(false);
  }, []);

  const applyResults = useCallback((results: Pokemon[]) => {
    if (!results.length) {
      setCurrentPokemon(null); setCandidates([]); setNotFound(true);
      return;
    }
    setCurrentPokemon(results[0]);
    setNotFound(false);
    setCandidates(results.length > 1 ? results.slice(0, 6) : []);
  }, []);

  const handleQuery = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setLastQuery(q);
    const results = searchPokemon(q);
    if (results.length) { applyResults(results); return; }
    const yomi = await toYomiKatakana(q);
    if (yomi !== q) {
      const yomiResults = searchPokemon(yomi);
      if (yomiResults.length) { applyResults(yomiResults); return; }
    }
    applyResults([]);
  }, [applyResults]);

  return { currentPokemon, candidates, notFound, lastQuery, showPokemon, handleQuery };
}
