import '../App.css';

export default function MicButton({ isListening, isReady, transcript, onToggle }) {
  // isListening=false              → 待機中（紫）
  // isListening=true, isReady=false → 準備中（紫・点滅なし）
  // isListening=true, isReady=true  → 録音中（赤・pulse）
  const btnBg = isReady ? '#e85d5d' : 'var(--accent)';
  const btnShadow = isReady
    ? '0 4px 28px rgba(232,93,93,0.5)'
    : '0 4px 24px rgba(124,109,250,0.45)';
  const statusText = isReady ? (transcript || '聞き取り中…') : '準備中…';

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 16px 24px',
      background: 'linear-gradient(transparent, var(--bg) 30%)',
      zIndex: 10, pointerEvents: 'none'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, pointerEvents: 'none',
        opacity: isListening ? 1 : 0,
        transition: 'opacity 0.2s'
      }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
          {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2, background: isReady ? '#e85d5d' : 'var(--accent)',
              animation: isReady ? `wavePulse 0.8s ease-in-out ${delay}s infinite` : 'none',
              height: isReady ? 4 : 8,
              opacity: isReady ? 1 : 0.4,
              transition: 'height 0.2s, opacity 0.2s'
            }} />
          ))}
        </div>
        <div style={{ fontSize: 15, color: isReady ? 'var(--text)' : 'var(--text-muted)', fontWeight: 700, maxWidth: 260, textAlign: 'center', minHeight: 20 }}>
          {statusText}
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 'var(--mic-size)', height: 'var(--mic-size)',
          borderRadius: '50%', border: 'none',
          background: btnBg,
          color: 'white', fontSize: 26, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: btnShadow,
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
          pointerEvents: 'all',
          WebkitTapHighlightColor: 'transparent',
          animation: isReady ? 'micPulse 1.2s ease-in-out infinite' : 'none'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.93)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isListening ? '⏹' : '🎤'}
      </button>
    </div>
  );
}
