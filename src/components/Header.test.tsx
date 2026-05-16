import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('タイトル "pokecham" を表示する', () => {
    render(<Header onHistoryToggle={vi.fn()} theme="dark" onThemeToggle={vi.fn()} />);
    expect(screen.getByText('pokecham')).toBeInTheDocument();
  });

  it('dark テーマでは太陽アイコン (☀️) を出す', () => {
    render(<Header onHistoryToggle={vi.fn()} theme="dark" onThemeToggle={vi.fn()} />);
    expect(screen.getByTitle('ライトモードへ')).toBeInTheDocument();
  });

  it('light テーマでは月アイコン (🌙) を出す', () => {
    render(<Header onHistoryToggle={vi.fn()} theme="light" onThemeToggle={vi.fn()} />);
    expect(screen.getByTitle('ダークモードへ')).toBeInTheDocument();
  });

  it('テーマアイコンクリックで onThemeToggle が呼ばれる', () => {
    const onToggle = vi.fn();
    render(<Header onHistoryToggle={vi.fn()} theme="dark" onThemeToggle={onToggle} />);
    fireEvent.click(screen.getByTitle('ライトモードへ'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('履歴アイコンクリックで onHistoryToggle が呼ばれる', () => {
    const onHistory = vi.fn();
    render(<Header onHistoryToggle={onHistory} theme="dark" onThemeToggle={vi.fn()} />);
    fireEvent.click(screen.getByTitle('履歴'));
    expect(onHistory).toHaveBeenCalledTimes(1);
  });
});
