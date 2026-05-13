import { memo } from 'react';
import { TYPE_COLORS } from '../data/pokemon';
import type { Pokemon } from '../data/pokemon';

interface CandidateListProps {
  candidates: Pokemon[];
  query: string;
  onSelect: (p: Pokemon) => void;
}

export default memo(function CandidateList({ candidates, query, onSelect }: CandidateListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4
      }}>
        「{query}」の候補
      </div>
      {candidates.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px', color: 'var(--text)',
            fontFamily: "'Exo 2', sans-serif", fontSize: 17, fontWeight: 600,
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10, transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>
            {p.name}
            {p.form && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
                ({p.form})
              </span>
            )}
          </span>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {p.types.map(t => (
              <span key={t} style={{
                padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                background: TYPE_COLORS[t] || '#888'
              }}>
                {t}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
});
