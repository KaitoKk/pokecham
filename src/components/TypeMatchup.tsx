import { useMemo, memo } from 'react';
import { calcMatchups } from '../data/typeChart';
import { TYPE_COLORS } from '../data/pokemon';

const GROUPS = [
  { key: 4,    label: '×4',  bg: '#e85d5d', color: 'white' },
  { key: 2,    label: '×2',  bg: '#e8a45d', color: 'white' },
  { key: 0.5,  label: '×½',  bg: '#5db8e8', color: 'white' },
  { key: 0.25, label: '×¼',  bg: '#5d84e8', color: 'white' },
  { key: 0,    label: '×0',  bg: '#555',    color: '#aaa'   },
];

function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', color: 'white',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      background: TYPE_COLORS[type] || '#888',
    }}>
      {type}
    </span>
  );
}

interface TypeMatchupProps {
  types: string[];
}

export default memo(function TypeMatchup({ types }: TypeMatchupProps) {
  const matchups = useMemo(() => calcMatchups(types), [types]);

  const grouped = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const { type, multiplier } of matchups) {
      if (multiplier === 1) continue;
      if (!map[multiplier]) map[multiplier] = [];
      map[multiplier].push(type);
    }
    return map;
  }, [matchups]);

  const hasEntries = GROUPS.some(g => grouped[g.key]?.length > 0);
  if (!hasEntries) return null;

  return (
    <div style={{
      padding: '14px 18px 16px', borderTop: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2
      }}>タイプ相性</div>

      {GROUPS.map(({ key, label, bg, color }) => {
        const types = grouped[key];
        if (!types?.length) return null;
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 800, minWidth: 28, textAlign: 'center',
              padding: '2px 6px', borderRadius: 4, background: bg, color,
              flexShrink: 0,
            }}>
              {label}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
});
