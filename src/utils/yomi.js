/**
 * kuromoji を使って文字列の読みをカタカナで返すユーティリティ。
 * 辞書ロードは初回呼び出し時に遅延実行し、以後キャッシュする。
 */
import kuromoji from 'kuromoji';

let tokenizerPromise = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
    });
  }
  return tokenizerPromise;
}

/**
 * 文字列をカタカナ読みに変換する。
 * 変換できない場合は元の文字列を返す。
 */
export async function toYomiKatakana(text) {
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    return tokens.map(t => t.reading ?? t.surface_form).join('');
  } catch {
    return text;
  }
}

/** バックグラウンドで辞書をプリロードする */
export function preloadTokenizer() {
  getTokenizer().catch(() => {});
}
