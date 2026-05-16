import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DualCardView from './DualCardView';
import type { PokemonState } from '../hooks/usePokemonState';
import type { Pokemon } from '../data/pokemon';

const garchomp: Pokemon = {
  name: 'ガブリアス',
  no: '#0445',
  types: ['ドラゴン', 'じめん'],
  stats: [108, 130, 95, 80, 85, 102],
  abilities: [{ name: 'すながくれ', hidden: false }],
};

const pikachu: Pokemon = {
  name: 'ピカチュウ',
  no: '#0025',
  types: ['でんき'],
  stats: [35, 55, 40, 50, 50, 90],
  abilities: [{ name: 'せいでんき', hidden: false }],
};

function makeState(overrides: Partial<PokemonState> = {}): PokemonState {
  return {
    currentPokemon: null,
    candidates: [],
    notFound: false,
    lastQuery: '',
    showPokemon: vi.fn(),
    handleQuery: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('DualCardView', () => {
  it('両側が空のとき両方にマイク誘導文が出る', () => {
    render(<DualCardView left={makeState()} right={makeState()} />);
    expect(screen.getAllByText(/マイクボタンを押して/)).toHaveLength(2);
  });

  it('左にポケモンを表示するとセクションが出る', () => {
    render(
      <DualCardView
        left={makeState({ currentPokemon: garchomp })}
        right={makeState()}
      />
    );
    expect(screen.getByText('ガブリアス')).toBeInTheDocument();
    expect(screen.getByText('種族値')).toBeInTheDocument();
    expect(screen.getByText('特性')).toBeInTheDocument();
    expect(screen.getByText('すながくれ')).toBeInTheDocument();
  });

  it('左右両方にポケモンを表示できる', () => {
    render(
      <DualCardView
        left={makeState({ currentPokemon: garchomp })}
        right={makeState({ currentPokemon: pikachu })}
      />
    );
    expect(screen.getByText('ガブリアス')).toBeInTheDocument();
    expect(screen.getByText('ピカチュウ')).toBeInTheDocument();
  });

  it('該当なしのとき該当クエリのメッセージが出る', () => {
    render(
      <DualCardView
        left={makeState({ notFound: true, lastQuery: 'なんとか' })}
        right={makeState()}
      />
    );
    expect(screen.getByText(/「なんとか」は見つかりませんでした/)).toBeInTheDocument();
  });

  it('現在のポケモン + 候補が複数あるとき候補リストも表示する', () => {
    // 実運用では currentPokemon = results[0] + candidates = results.slice(0,6)
    render(
      <DualCardView
        left={makeState({
          currentPokemon: garchomp,
          candidates: [garchomp, pikachu],
          lastQuery: 'ガブ',
        })}
        right={makeState()}
      />
    );
    expect(screen.getByText(/「ガブ」の候補/)).toBeInTheDocument();
  });
});
