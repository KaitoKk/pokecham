import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IdleState from './IdleState';

describe('IdleState', () => {
  it('notFound=false ではマイク誘導文を出す', () => {
    render(<IdleState notFound={false} query="" />);
    expect(screen.getByText(/マイクボタンを押して/)).toBeInTheDocument();
  });

  it('notFound=true ではクエリ込みの該当なしメッセージを出す', () => {
    render(<IdleState notFound={true} query="あいうえお" />);
    expect(screen.getByText(/「あいうえお」は見つかりませんでした/)).toBeInTheDocument();
  });
});
