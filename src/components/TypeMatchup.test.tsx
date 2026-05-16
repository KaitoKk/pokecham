import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypeMatchup from './TypeMatchup';

describe('TypeMatchup', () => {
  it('みずタイプの弱点・耐性を表示する', () => {
    render(<TypeMatchup types={['みず']} />);
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText('×½')).toBeInTheDocument();
  });

  it('みず・じめんに対するでんき×0 を表示する', () => {
    render(<TypeMatchup types={['みず', 'じめん']} />);
    expect(screen.getByText('×0')).toBeInTheDocument();
  });

  it('みず・じめんに対するくさ×4 を表示する', () => {
    render(<TypeMatchup types={['みず', 'じめん']} />);
    expect(screen.getByText('×4')).toBeInTheDocument();
  });
});
