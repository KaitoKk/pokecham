import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import Header from './components/Header';
import HistoryPanel from './components/HistoryPanel';
import PokemonPanel from './components/PokemonPanel';
import DualCardView from './components/DualCardView';
import { useHistory } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import { usePokemonState } from './hooks/usePokemonState';
import { preloadTokenizer } from './utils/yomi';

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, clearHistory } = useHistory();
  const { theme, toggleTheme } = useTheme();
  const leftState = usePokemonState();
  const rightState = usePokemonState();

  useEffect(() => { preloadTokenizer(); }, []);

  return (
    <>
      <Header
        onHistoryToggle={() => setHistoryOpen(v => !v)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex' }}>
        <HistoryPanel
          history={history}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onSelect={() => {}}
          onClear={clearHistory}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* ラベル行 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
            {['じぶん', 'あいて'].map((label, i) => (
              <div key={label} style={{
                padding: '6px 12px', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase',
                borderRight: i === 0 ? '1px solid var(--border)' : undefined,
              }}>{label}</div>
            ))}
          </div>

          {/* セクション共有グリッド（スクロール） */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <DualCardView left={leftState} right={rightState} />
          </div>

          {/* マイクボタン行 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
            <div style={{ borderRight: '1px solid var(--border)' }}>
              <PokemonPanel onQuery={leftState.handleQuery} />
            </div>
            <PokemonPanel onQuery={rightState.handleQuery} />
          </div>
        </div>
      </div>
    </>
  );
}
