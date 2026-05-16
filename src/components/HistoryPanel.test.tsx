import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryPanel from './HistoryPanel';
import type { Pokemon } from '../data/pokemon';

const mockPokemon: Pokemon = {
  name: 'ガブリアス',
  no: '#0445',
  types: ['ドラゴン', 'じめん'],
  stats: [108, 130, 95, 80, 85, 102],
  abilities: [],
};

const mockPokemonWithForm: Pokemon = {
  ...mockPokemon,
  name: 'ロトム',
  form: 'ヒートロトム',
};

describe('HistoryPanel', () => {
  it('履歴が空のときプレースホルダを表示する', () => {
    render(
      <HistoryPanel
        history={[]}
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText('まだ履歴がありません')).toBeInTheDocument();
  });

  it('履歴アイテムを表示する', () => {
    render(
      <HistoryPanel
        history={[mockPokemon]}
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText('ガブリアス')).toBeInTheDocument();
  });

  it('フォルム名があれば併せて表示する', () => {
    render(
      <HistoryPanel
        history={[mockPokemonWithForm]}
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByText('ロトム')).toBeInTheDocument();
    expect(screen.getByText('ヒートロトム')).toBeInTheDocument();
  });

  it('アイテムクリックで onSelect と onClose が呼ばれる', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <HistoryPanel
        history={[mockPokemon]}
        isOpen={true}
        onClose={onClose}
        onSelect={onSelect}
        onClear={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('ガブリアス'));
    expect(onSelect).toHaveBeenCalledWith(mockPokemon);
    expect(onClose).toHaveBeenCalled();
  });

  it('クリアボタンで onClear が呼ばれる', () => {
    const onClear = vi.fn();
    render(
      <HistoryPanel
        history={[mockPokemon]}
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        onClear={onClear}
      />
    );
    fireEvent.click(screen.getByText('クリア'));
    expect(onClear).toHaveBeenCalled();
  });
});
