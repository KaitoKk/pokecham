import { FORMATS } from '../hooks/useFormat';

interface FormatSelectorProps {
  format: string;
  onChange: (id: string) => void;
}

export default function FormatSelector({ format, onChange }: FormatSelectorProps) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '8px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', flexShrink: 0,
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {FORMATS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          style={{
            padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
            whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.15s',
            border: format === f.id ? 'none' : '1px solid var(--border)',
            background: format === f.id ? 'var(--accent)' : 'transparent',
            color: format === f.id ? 'white' : 'var(--text-muted)',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
