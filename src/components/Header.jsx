function IconButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: '1px solid var(--border)', borderRadius: 8,
        padding: '7px 10px', color: 'var(--text-muted)', cursor: 'pointer',
        fontSize: 18, lineHeight: 1, transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >{children}</button>
  );
}

export default function Header({ onHistoryToggle, theme, onThemeToggle }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      flexShrink: 0, background: 'var(--surface)',
    }}>
      <div style={{
        fontSize: 18, fontWeight: 900, letterSpacing: '0.04em', color: 'var(--accent)'
      }}>
        pokecham
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton onClick={onThemeToggle} title={theme === 'dark' ? 'ライトモードへ' : 'ダークモードへ'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </IconButton>
        <IconButton onClick={onHistoryToggle} title="履歴">☰</IconButton>
      </div>
    </header>
  );
}
