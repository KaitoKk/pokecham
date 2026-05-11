import { useState, useCallback } from 'react';
import { searchPokemon } from '../utils/search';
import { toYomiKatakana } from '../utils/yomi';

export function usePokemonState() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const showPokemon = useCallback((poke) => {
    setCurrentPokemon(poke);
    setCandidates([]);
    setNotFound(false);
  }, []);

  const applyResults = useCallback((results) => {
    if (!results.length) {
      setCurrentPokemon(null); setCandidates([]); setNotFound(true);
      return;
    }
    // 一括更新: showPokemon → setCandidates の2段階セットを避ける
    setCurrentPokemon(results[0]);
    setNotFound(false);
    setCandidates(results.length > 1 ? results.slice(0, 6) : []);
  }, []);

  const handleQuery = useCallback(async (query) => {
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
