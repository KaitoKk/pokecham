import { ALIASES, POKEMON_DB, type Pokemon } from '../data/pokemon';

/** ひらがな → カタカナ */
function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/** 全角英数字・記号 → 半角 */
function toHalfWidth(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/\u3000/g, " ");
}

/** 長音記号の表記ゆれを統一（－/−/—/‐ → ー） */
function normalizeChoon(str: string): string {
  return str.replace(/[－−—―‐]/g, 'ー');
}

/** 小書き文字を大文字に統一（ぁ→あ、ァ→ア 等）*/
function normalizeSmall(str: string): string {
  return str
    .replace(/[ぁぃぅぇぉっゃゅょゎ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 1))
    .replace(/[ァィゥェォッャュョヮ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 1));
}

/** 検索用クエリ正規化 */
function normalize(str: string): string {
  let s = str.trim();
  s = toHalfWidth(s);
  s = normalizeChoon(s);
  s = toKatakana(s);
  s = normalizeSmall(s);
  // 記号・スペースを全除去（途中スペースも含む）
  s = s.replace(/[\s・。、]+/g, '');
  return s;
}

// DB の各エントリの正規化済み名前をキャッシュ
const normalizedDB = POKEMON_DB.map(p => ({ p, norm: normalize(p.name) }));

/** メガ接頭辞を検出してメガシンカ形式を検索 */
function searchMega(q: string): Pokemon[] | null {
  if (!q.startsWith('メガ')) return null;
  const base = q.slice(2); // "メガ" を除去
  if (!base) return null;

  // ベース名で完全一致 → メガフォームのみ返す
  const exact = normalizedDB
    .filter(({ norm, p }) => norm === base && p.form && p.form.includes('メガシンカ'))
    .map(({ p }) => p);
  if (exact.length) return exact;

  // ベース名で前方一致
  const forward = normalizedDB
    .filter(({ norm, p }) => norm.startsWith(base) && p.form && p.form.includes('メガシンカ'))
    .map(({ p }) => p);
  if (forward.length) return forward;

  return null;
}

export function searchPokemon(query: string): Pokemon[] {
  const q = normalize(query);
  if (!q) return [];

  // メガ接頭辞チェック（エイリアス解決より先に）
  const megaResults = searchMega(q);
  if (megaResults) return megaResults;

  // エイリアス解決（正規化前・後どちらにも対応）
  const aliasName = ALIASES[q] || ALIASES[query.trim()];
  const name = aliasName ? normalize(aliasName) : q;

  // 1. 完全一致（正規化済みで比較）
  const exact = normalizedDB.filter(({ norm }) => norm === name).map(({ p }) => p);
  if (exact.length) return exact;

  // 2. 前方一致
  const forward = normalizedDB.filter(({ norm }) => norm.startsWith(name)).map(({ p }) => p);
  if (forward.length) return forward;

  // 3. 部分一致
  const partial = normalizedDB.filter(({ norm }) => norm.includes(name) || name.includes(norm)).map(({ p }) => p);
  if (partial.length) return partial;

  // 4. あいまい（1文字ずつの包含、ー・ン を除外）
  return normalizedDB
    .filter(({ norm }) => [...name].some(ch => ch !== 'ー' && ch !== 'ン' && ch.trim() && norm.includes(ch)))
    .map(({ p }) => p);
}
