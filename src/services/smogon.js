/**
 * data.pkmn.cc から Smogon セットデータを取得する。
 * @pkmn/dex を使わず直接フェッチするためバンドルサイズを増やさない。
 * セッション内でキャッシュする。
 */

const BASE = 'https://data.pkmn.cc';

// セッション内キャッシュ
const cache = {};

async function fetchGen(genNum) {
  if (cache[genNum]) return cache[genNum];
  const res = await fetch(`${BASE}/sets/gen${genNum}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  cache[genNum] = await res.json();
  return cache[genNum];
}

/**
 * 指定ポケモンの Smogon セット一覧を返す。
 * @param {string} enName - 英語名 (e.g. "Flutter Mane")
 * @param {string} format - フォーマットID (e.g. "ou", "vgc2025")
 * @param {number} genNum - 世代番号 (e.g. 9)
 * @returns {Promise<Array<{name: string, item: string, moves: string[], nature: string, evs: Object}>>}
 */
export async function getPokemonSets(enName, format = 'ou', genNum = 9) {
  if (!enName) return [];
  try {
    const data = await fetchGen(genNum);
    const entry = data[enName];
    if (!entry) return [];

    // 指定フォーマットのセットのみ返す。なければ全フォーマット
    const target = format && entry[format] ? { [format]: entry[format] } : entry;

    const sets = [];
    for (const [fmt, formatSets] of Object.entries(target)) {
      for (const [setName, set] of Object.entries(formatSets)) {
        sets.push({
          name: setName,
          format: fmt,
          item: Array.isArray(set.item) ? set.item[0] : set.item,
          moves: (set.moves || []).map(m => Array.isArray(m) ? m[0] : m),
          nature: set.nature,
          evs: set.evs || {},
        });
      }
    }
    return sets;
  } catch {
    return [];
  }
}
