import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from './useHistory';
import type { Pokemon } from '../data/pokemon';

const mockPokemon: Pokemon = {
  name: 'ガブリアス',
  no: '#0445',
  types: ['ドラゴン', 'じめん'],
  stats: [108, 130, 95, 80, 85, 102],
  abilities: [{ name: 'すながくれ', hidden: false }],
};

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初期状態では history は空配列', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('localStorage に保存された履歴を初期値として読み込む', () => {
    localStorage.setItem('pokecham_history', JSON.stringify([mockPokemon]));
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].name).toBe('ガブリアス');
  });

  it('壊れた JSON は空配列にフォールバックする', () => {
    localStorage.setItem('pokecham_history', '{invalid}');
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('clearHistory で履歴を空にし localStorage も更新する', () => {
    localStorage.setItem('pokecham_history', JSON.stringify([mockPokemon]));
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toHaveLength(1);

    act(() => { result.current.clearHistory(); });

    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem('pokecham_history')).toBe('[]');
  });
});
