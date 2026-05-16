import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateList from './CandidateList';
import type { Pokemon } from '../data/pokemon';

const mockCandidates: Pokemon[] = [
  { name: 'ガブリアス', no: '#0445', types: ['ドラゴン', 'じめん'], stats: [108, 130, 95, 80, 85, 102], abilities: [] },
  { name: 'ガブリアス', no: '#0445', form: 'メガシンカ', types: ['ドラゴン', 'じめん'], stats: [108, 170, 115, 120, 95, 92], abilities: [] },
];

describe('CandidateList', () => {
  it('候補を全件レンダリングする', () => {
    render(<CandidateList candidates={mockCandidates} query="ガブ" onSelect={vi.fn()} />);
    expect(screen.getAllByText('ガブリアス')).toHaveLength(2);
  });

  it('検索クエリをヘッダーに表示する', () => {
    render(<CandidateList candidates={mockCandidates} query="ガブ" onSelect={vi.fn()} />);
    expect(screen.getByText(/「ガブ」の候補/)).toBeInTheDocument();
  });

  it('フォルム名があれば併記する', () => {
    render(<CandidateList candidates={mockCandidates} query="ガブ" onSelect={vi.fn()} />);
    expect(screen.getByText('(メガシンカ)')).toBeInTheDocument();
  });

  it('候補クリックで onSelect が該当ポケモンとともに呼ばれる', () => {
    const onSelect = vi.fn();
    render(<CandidateList candidates={mockCandidates} query="ガブ" onSelect={onSelect} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(onSelect).toHaveBeenCalledWith(mockCandidates[1]);
  });
});
