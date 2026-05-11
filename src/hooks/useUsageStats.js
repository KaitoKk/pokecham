import { useState, useEffect } from 'react';
import { getPokemonSets } from '../services/smogon';

export function usePokemonSets(pokemon, format) {
  const [sets, setSets] = useState([]);
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
