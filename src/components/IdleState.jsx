import { memo } from 'react';

export default memo(function IdleState({ notFound, query }) {
  if (notFound) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, color: 'var(--text-muted)', paddingBottom: 80
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, opacity: 0.5
        }}>🔍</div>
        <div style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
          「{query}」は見つかりませんでした
          <br />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            データベースに未登録の可能性があります
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, color: 'var(--text-muted)', paddingBottom: 80
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        border: '2px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, opacity: 0.5
      }}>🎤</div>
      <div style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
        マイクボタンを押して<br />ポケモン名を話しかけてください
      </div>
    </div>
  );
});
