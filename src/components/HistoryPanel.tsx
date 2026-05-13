import { TYPE_COLORS } from '../data/pokemon';
import type { Pokemon } from '../data/pokemon';

interface HistoryPanelProps {
  history: Pokemon[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (p: Pokemon) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, isOpen, onClose, onSelect, onClear }: HistoryPanelProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 15
          }}
        />
      )}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 220,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 20, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '14px 16px 10px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', color: 'var(--text-muted)',
          textTransform: 'uppercase', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>履歴</span>
          <button
            onClick={onClear}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 11, fontFamily: "'Exo 2', sans-serif", padding: 0
            }}
          >クリア</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {history.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              まだ履歴がありません
            </div>
          ) : history.map((p, i) => (
            <div
              key={i}
              onClick={() => { onSelect(p); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: TYPE_COLORS[p.types[0]] || '#888'
              }} />
              <div style={{
                fontSize: 14, fontWeight: 600, flex: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {p.name}
                {p.form && (
                  <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>
                    {p.form}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
