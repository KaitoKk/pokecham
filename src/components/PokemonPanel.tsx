import { useState, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface PanelMicButtonProps {
  isListening: boolean;
  isReady: boolean;
  transcript: string;
  onToggle: () => void;
}

function PanelMicButton({ isListening, isReady, transcript, onToggle }: PanelMicButtonProps) {
  const btnBg = isReady ? '#e85d5d' : 'var(--accent)';
  const btnShadow = isReady
    ? '0 4px 20px rgba(232,93,93,0.5)'
    : '0 4px 16px rgba(124,109,250,0.4)';
  const statusText = isReady ? (transcript || '聞き取り中…') : '準備中…';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 12px 16px', flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        opacity: isListening ? 1 : 0, transition: 'opacity 0.2s'
      }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 16 }}>
          {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2, background: isReady ? '#e85d5d' : 'var(--accent)',
              animation: isReady ? `wavePulse 0.8s ease-in-out ${delay}s infinite` : 'none',
              height: isReady ? 4 : 6, opacity: isReady ? 1 : 0.4,
              transition: 'height 0.2s'
            }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: isReady ? 'var(--text)' : 'var(--text-muted)', fontWeight: 700, maxWidth: 160, textAlign: 'center' }}>
          {statusText}
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: btnBg, color: 'white', fontSize: 22, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: btnShadow, transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
          WebkitTapHighlightColor: 'transparent',
          animation: isReady ? 'micPulse 1.2s ease-in-out infinite' : 'none'
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.93)')}
        onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isListening ? '⏹' : '🎤'}
      </button>
    </div>
  );
}

interface PokemonPanelProps {
  onQuery: (query: string) => void;
}

export default function PokemonPanel({ onQuery }: PokemonPanelProps) {
  const [transcript, setTranscript] = useState('');
  const { isListening, isReady, startListening } = useSpeechRecognition({
    onResult: useCallback((t: string) => { onQuery(t); }, [onQuery]),
    onInterim: useCallback((t: string) => setTranscript(t), []),
  });

  return (
    <PanelMicButton
      isListening={isListening}
      isReady={isReady}
      transcript={transcript}
      onToggle={startListening}
    />
  );
}
