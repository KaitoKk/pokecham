/**
 * data.pkmn.cc から Smogon セットデータを取得する。
 * @pkmn/dex を使わず直接フェッチするためバンドルサイズを増やさない。
 * セッション内でキャッシュする。
 */

const BASE = 'https://data.pkmn.cc';

// セッション内キャッシュ
const cache: Record<number, unknown> = {};

async function fetchGen(genNum: number): Promise<Record<string, Record<string, Record<string, SmogonRawSet>>>> {
  if (cache[genNum]) return cache[genNum] as Record<string, Record<string, Record<string, SmogonRawSet>>>;
  const res = await fetch(`${BASE}/sets/gen${genNum}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  cache[genNum] = await res.json();
  return cache[genNum] as Record<string, Record<string, Record<string, SmogonRawSet>>>;
}

interface SmogonRawSet {
  item?: string | string[];
  moves?: (string | string[])[];
  nature?: string;
  evs?: Record<string, number>;
}

export interface SmogonSet {
  name: string;
  format: string;
  item: string | undefined;
  moves: string[];
  nature: string | undefined;
  evs: Record<string, number>;
}

/**
 * 指定ポケモンの Smogon セット一覧を返す。
 * @param enName - 英語名 (e.g. "Flutter Mane")
 * @param format - フォーマットID (e.g. "ou", "vgc2025")
 * @param genNum - 世代番号 (e.g. 9)
 */
export async function getPokemonSets(enName: string, format = 'ou', genNum = 9): Promise<SmogonSet[]> {
  if (!enName) return [];
  try {
    const data = await fetchGen(genNum);
    const entry = data[enName];
    if (!entry) return [];

    // 指定フォーマットのセットのみ返す。なければ全フォーマット
    const target = format && entry[format] ? { [format]: entry[format] } : entry;

    const sets: SmogonSet[] = [];
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
