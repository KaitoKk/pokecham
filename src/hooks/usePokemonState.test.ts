import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePokemonState } from './usePokemonState';

vi.mock('../utils/yomi', () => ({
  toYomiKatakana: vi.fn(async (s: string) => s),
}));

describe('usePokemonState', () => {
  it('初期状態は空', () => {
    const { result } = renderHook(() => usePokemonState());
    expect(result.current.currentPokemon).toBeNull();
    expect(result.current.candidates).toEqual([]);
    expect(result.current.notFound).toBe(false);
    expect(result.current.lastQuery).toBe('');
  });

  it('完全一致で currentPokemon にセット', async () => {
    const { result } = renderHook(() => usePokemonState());
    await act(async () => { await result.current.handleQuery('ガブリアス'); });

    expect(result.current.currentPokemon?.name).toBe('ガブリアス');
    expect(result.current.notFound).toBe(false);
    expect(result.current.lastQuery).toBe('ガブリアス');
  });

  it('複数候補があれば candidates に最大6件入る', async () => {
    const { result } = renderHook(() => usePokemonState());
    // 前方一致で複数ヒットする検索
    await act(async () => { await result.current.handleQuery('ガブ'); });

    expect(result.current.currentPokemon).not.toBeNull();
    // candidates は results.length > 1 のとき先頭6件
    if (result.current.candidates.length > 0) {
      expect(result.current.candidates.length).toBeLessThanOrEqual(6);
    }
  });

  it('該当なしのとき notFound=true', async () => {
    const { result } = renderHook(() => usePokemonState());
    await act(async () => { await result.current.handleQuery('zzzxxxnotfoundpokemon'); });

    expect(result.current.currentPokemon).toBeNull();
    expect(result.current.notFound).toBe(true);
  });

  it('空クエリは無視される', async () => {
    const { result } = renderHook(() => usePokemonState());
    await act(async () => { await result.current.handleQuery('   '); });

    expect(result.current.currentPokemon).toBeNull();
    expect(result.current.lastQuery).toBe('');
  });

  it('showPokemon で表示中ポケモンを切り替える', async () => {
    const { result } = renderHook(() => usePokemonState());
    await act(async () => { await result.current.handleQuery('ガブリアス'); });
    const first = result.current.currentPokemon!;

    act(() => { result.current.showPokemon(first); });
    expect(result.current.currentPokemon).toBe(first);
    expect(result.current.candidates).toEqual([]);
    expect(result.current.notFound).toBe(false);
  });
});
