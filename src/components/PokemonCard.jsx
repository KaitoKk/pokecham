import { useEffect, useRef } from 'react';
import { TYPE_COLORS, STAT_LABELS } from '../data/pokemon';
import TypeMatchup from './TypeMatchup';

function statColor(v) {
  if (v >= 130) return '#7c6dfa';
  if (v >= 100) return '#5dd86a';
  if (v >= 70)  return '#f5c842';
  return '#e85d5d';
}

/**
 * 素早さ実数値計算（ポケモンチャンピオンズ: 個体値なし, Lv50）
 * formula: floor((floor(2*base + floor(ev/4)) * level/100 + 5) * nature)
 */
function calcSpeed(base, ev, natureMod, level = 50) {
  return Math.floor((Math.floor((2 * base + Math.floor(ev / 4)) * level / 100) + 5) * natureMod);
}

const SPEED_ROWS = [
  { label: '性格+ 252', ev: 252, nature: 1.1 },
  { label: '性格± 252', ev: 252, nature: 1.0 },
  { label: '性格± 0',   ev: 0,   nature: 1.0 },
  { label: '性格- 0',   ev: 0,   nature: 0.9 },
];

const TIER_COLORS = {
  'Uber': '#e85d5d', 'OU': '#7c6dfa', 'UU': '#5dd86a', 'RU': '#f5c842',
  'NU': '#e8a45d', 'PU': '#5db8e8', 'ZU': '#888', 'NFE': '#aaa',
  'LC': '#bbb', 'AG': '#ff4444', 'Illegal': '#555',
};

function TierBadge({ tier }) {
  if (!tier || tier === 'Illegal') return null;
  const color = TIER_COLORS[tier] || '#888';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      letterSpacing: '0.06em', border: `1px solid ${color}`, color,
    }}>
      {tier}
    </span>
  );
}

export default function PokemonCard({ pokemon, format }) {
  const bst = pokemon.stats.reduce((a, b) => a + b, 0);
  const barRefs = useRef([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barRefs.current.forEach((el, i) => {
          if (el) {
            const pct = Math.round(pokemon.stats[i] / 255 * 100);
            el.style.width = pct + '%';
          }
        });
      });
    });
  }, [pokemon]);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      animation: 'slideUp 0.25s ease'
    }}>
      {/* カードヘッダー */}
      <div style={{
        padding: '16px 18px 12px', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'space-between', gap: 12
      }}>
        <div>
          <div style={{
            fontSize: 'clamp(28px, 5vw, 34px)', fontWeight: 900,
            letterSpacing: '0.01em', lineHeight: 1.1
          }}>
            {pokemon.name}
          </div>
          {pokemon.form && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
              {pokemon.form}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <TierBadge tier={pokemon.tier} />
          </div>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
          letterSpacing: '0.05em', flexShrink: 0, marginTop: 4
        }}>
          {pokemon.no}
        </div>
      </div>

      {/* タイプバッジ */}
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {pokemon.types.map(t => (
          <span key={t} style={{
            padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            background: TYPE_COLORS[t] || '#888'
          }}>
            {t}
          </span>
        ))}
      </div>

      {/* タイプ相性 */}
      <TypeMatchup types={pokemon.types} />

      {/* 種族値 */}
      <div style={{
        padding: '14px 18px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4
        }}>種族値</div>
        {STAT_LABELS.map((label, i) => (
          <div key={label} style={{
            display: 'grid', gridTemplateColumns: '64px 1fr 36px',
            alignItems: 'center', gap: 10
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {label}
            </div>
            <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                ref={el => barRefs.current[i] = el}
                style={{
                  height: '100%', borderRadius: 4,
                  width: '0%',
                  background: statColor(pokemon.stats[i]),
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                }}
              />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {pokemon.stats[i]}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>BST</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)' }}>{bst}</span>
        </div>
      </div>

      {/* 特性 */}
      <div style={{
        padding: '14px 18px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4
        }}>特性</div>
        {pokemon.abilities.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>データなし</div>
        ) : pokemon.abilities.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
              letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
              background: a.hidden ? 'rgba(124,109,250,0.15)' : 'var(--surface2)',
              color: a.hidden ? 'var(--accent)' : 'var(--text-muted)'
            }}>
              {a.hidden ? '夢' : '通'}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{a.name}</div>
              {a.desc && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>
                  {a.desc}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Smogon セット: 一時非表示 */}

      {/* 素早さ実数値 */}
      <div style={{
        padding: '10px 18px 14px', borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8
        }}>素早さ実数値 (Lv50)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SPEED_ROWS.map(row => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'center', gap: 8
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {calcSpeed(pokemon.stats[5], row.ev, row.nature)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
