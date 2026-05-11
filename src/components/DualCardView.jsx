import { useEffect, useRef, memo } from 'react';
import { TYPE_COLORS, STAT_LABELS } from '../data/pokemon';
import TypeMatchup from './TypeMatchup';
import CandidateList from './CandidateList';
import IdleState from './IdleState';

const TIER_COLORS = {
  'Uber': '#e85d5d', 'OU': '#7c6dfa', 'UU': '#5dd86a', 'RU': '#f5c842',
  'NU': '#e8a45d', 'PU': '#5db8e8', 'ZU': '#888', 'NFE': '#aaa',
  'LC': '#bbb', 'AG': '#ff4444',
};

function TierBadge({ tier }) {
  if (!tier || tier === 'Illegal') return null;
  const color = TIER_COLORS[tier] || '#888';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      letterSpacing: '0.06em', border: `1px solid ${color}`, color,
    }}>{tier}</span>
  );
}

function statColor(v) {
  if (v >= 130) return '#7c6dfa';
  if (v >= 100) return '#5dd86a';
  if (v >= 70)  return '#f5c842';
  return '#e85d5d';
}

function calcSpeed(base, ev, natureMod, level = 50) {
  return Math.floor((Math.floor((2 * base + 31 + Math.floor(ev / 4)) * level / 100) + 5) * natureMod);
}

const SPEED_ROWS = [
  { label: '性格+ 252', ev: 252, nature: 1.1 },
  { label: '性格± 252', ev: 252, nature: 1.0 },
  { label: '性格± 0',   ev: 0,   nature: 1.0 },
  { label: '性格- 0',   ev: 0,   nature: 0.9 },
];

const PAD = '12px 14px';
const BORDER_B = '1px solid var(--border)';

const SectionHeader = memo(function SectionHeader({ pokemon, style }) {
  if (!pokemon) return <div style={style} />;
  return (
    <div style={{ padding: PAD, borderBottom: BORDER_B, animation: 'slideUp 0.25s ease', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.1 }}>
            {pokemon.name}
          </div>
          {pokemon.form && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
              {pokemon.form}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', flexShrink: 0 }}>
          {pokemon.no}
        </div>
      </div>
    </div>
  );
});

const SectionTypes = memo(function SectionTypes({ pokemon, style }) {
  if (!pokemon) return <div style={style} />;
  return (
    <div style={{ padding: PAD, borderBottom: BORDER_B, display: 'flex', gap: 6, flexWrap: 'wrap', ...style }}>
      {pokemon.types.map(t => (
        <span key={t} style={{
          padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.06em', color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          background: TYPE_COLORS[t] || '#888',
        }}>{t}</span>
      ))}
    </div>
  );
});

const SectionMatchup = memo(function SectionMatchup({ pokemon, style }) {
  if (!pokemon) return <div style={style} />;
  return (
    <div style={{ borderBottom: BORDER_B, ...style }}>
      <TypeMatchup types={pokemon.types} />
    </div>
  );
});

const SectionStats = memo(function SectionStats({ pokemon, style }) {
  const barRefs = useRef([]);
  useEffect(() => {
    barRefs.current.forEach(el => { if (el) el.style.width = '0%'; });
    if (!pokemon) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barRefs.current.forEach((el, i) => {
          if (el) el.style.width = Math.round(pokemon.stats[i] / 255 * 100) + '%';
        });
      });
    });
  }, [pokemon]);

  if (!pokemon) return <div style={style} />;
  const bst = pokemon.stats.reduce((a, b) => a + b, 0);
  return (
    <div style={{ padding: PAD, borderBottom: BORDER_B, display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>種族値</div>
      {STAT_LABELS.map((label, i) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '58px 32px 1fr', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{label}</div>
          <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {pokemon.stats[i]}
          </div>
          <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              ref={el => barRefs.current[i] = el}
              style={{ height: '100%', borderRadius: 4, width: '0%', background: statColor(pokemon.stats[i]), transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>BST</span>
        <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)' }}>{bst}</span>
      </div>
    </div>
  );
});

const SectionAbilities = memo(function SectionAbilities({ pokemon, style }) {
  if (!pokemon) return <div style={style} />;
  return (
    <div style={{ padding: PAD, borderBottom: BORDER_B, display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>特性</div>
      {pokemon.abilities.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>データなし</div>
      ) : pokemon.abilities.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
            background: a.hidden ? 'rgba(124,109,250,0.15)' : 'var(--surface2)',
            color: a.hidden ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {a.hidden ? '夢' : '通'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{a.name}</div>
            {a.desc && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>{a.desc}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

const SectionSpeed = memo(function SectionSpeed({ pokemon, style }) {
  if (!pokemon) return <div style={style} />;
  return (
    <div style={{ padding: PAD, ...style }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>素早さ実数値 (Lv50)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {SPEED_ROWS.map(row => (
          <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {calcSpeed(pokemon.stats[5], row.ev, row.nature)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

function SideStatus({ state }) {
  const { currentPokemon, candidates, notFound, lastQuery, showPokemon } = state;
  if (currentPokemon) return null;
  if (candidates.length > 1) {
    return <CandidateList candidates={candidates} onSelect={showPokemon} query={lastQuery} />;
  }
  return <IdleState notFound={notFound} query={lastQuery} />;
}

const LEFT_STYLE = { borderRight: '1px solid var(--border)' };

const SECTIONS = [SectionHeader, SectionTypes, SectionMatchup, SectionStats, SectionAbilities, SectionSpeed];

export default function DualCardView({ left, right }) {
  const hasAny = left.currentPokemon || right.currentPokemon;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Status row: idle / not-found (hidden when Pokemon is shown) */}
      <div style={LEFT_STYLE}>
        {!left.currentPokemon && <SideStatus state={left} />}
      </div>
      <div>
        {!right.currentPokemon && <SideStatus state={right} />}
      </div>

      {/* Section rows: each pair shares the same grid row, heights auto-align */}
      {hasAny && SECTIONS.flatMap((Comp, i) => [
        <Comp key={`l-${i}`} pokemon={left.currentPokemon} style={LEFT_STYLE} />,
        <Comp key={`r-${i}`} pokemon={right.currentPokemon} />,
      ])}

      {/* Candidates row: shown below card when multiple forms are available */}
      <div style={{ padding: left.candidates.length > 1 ? '8px' : 0, ...LEFT_STYLE }}>
        {left.candidates.length > 1 && (
          <CandidateList candidates={left.candidates} onSelect={left.showPokemon} query={left.lastQuery} />
        )}
      </div>
      <div style={{ padding: right.candidates.length > 1 ? '8px' : 0 }}>
        {right.candidates.length > 1 && (
          <CandidateList candidates={right.candidates} onSelect={right.showPokemon} query={right.lastQuery} />
        )}
      </div>
    </div>
  );
}
