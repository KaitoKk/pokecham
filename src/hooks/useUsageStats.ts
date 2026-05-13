import { useState, useEffect } from 'react';
import { getPokemonSets, type SmogonSet } from '../services/smogon';
import type { Pokemon } from '../data/pokemon';

export function usePokemonSets(pokemon: Pokemon | null, format: string) {
  const [sets, setSets] = useState<SmogonSet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemon?.enName) { setSets([]); return; }
    setLoading(true);
    setSets([]);
    getPokemonSets(pokemon.enName, format).then(result => {
      setSets(result);
      setLoading(false);
    });
  }, [pokemon?.enName, format]);

  return { sets, loading };
}
