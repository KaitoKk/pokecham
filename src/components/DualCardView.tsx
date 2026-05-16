import CandidateList from './CandidateList';
import IdleState from './IdleState';
import type { PokemonState } from '../hooks/usePokemonState';
import { SECTIONS } from './DualCardSections';

function SideStatus({ state }: { state: PokemonState }) {
  const { currentPokemon, candidates, notFound, lastQuery, showPokemon } = state;
  if (currentPokemon) return null;
  if (candidates.length > 1) {
    return <CandidateList candidates={candidates} onSelect={showPokemon} query={lastQuery} />;
  }
  return <IdleState notFound={notFound} query={lastQuery} />;
}

const LEFT_STYLE: React.CSSProperties = { borderRight: '1px solid var(--border)' };

const SECTION_MIN_HEIGHTS = [
  64,   // Header
  42,   // Types
  220,  // Matchup
  180,  // Stats
  220,  // Abilities
  130,  // Speed
];

interface DualCardViewProps {
  left: PokemonState;
  right: PokemonState;
}

export default function DualCardView({ left, right }: DualCardViewProps) {
  const hasAny = left.currentPokemon || right.currentPokemon;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {!hasAny && (
        <>
          <div style={LEFT_STYLE}>
            <SideStatus state={left} />
          </div>
          <div>
            <SideStatus state={right} />
          </div>
        </>
      )}

      {hasAny && SECTIONS.flatMap((Comp, i) => {
        const minH = SECTION_MIN_HEIGHTS[i];
        return [
          <Comp key={`l-${i}`} pokemon={left.currentPokemon} style={{ ...LEFT_STYLE, minHeight: minH }} />,
          <Comp key={`r-${i}`} pokemon={right.currentPokemon} style={{ minHeight: minH }} />,
        ];
      })}

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
