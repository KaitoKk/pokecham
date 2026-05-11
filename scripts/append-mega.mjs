#!/usr/bin/env node
/**
 * メガ進化ポケモンのデータを pokemon.json に追記するスクリプト。
 * PokéAPI からデータ取得し、既存エントリの姿違いとして追加する。
 * 実行: node scripts/append-mega.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const OUTPUT = path.join(ROOT, 'src', 'data', 'pokemon.json');
const API = 'https://pokeapi.co/api/v2';

const TYPE_JA = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
};

// PokéAPI 英語フォルムスラッグ → 日本語フォルム名
const MEGA_FORM_JA = {
  'mega':   'メガシンカ',
  'mega-x': 'メガシンカX',
  'mega-y': 'メガシンカY',
};

// 全メガ進化ポケモン (PokéAPI スラッグ : 図鑑番号)
const MEGA_LIST = [
  ['venusaur-mega', 3],    ['charizard-mega-x', 6],  ['charizard-mega-y', 6],
  ['blastoise-mega', 9],   ['alakazam-mega', 65],     ['gengar-mega', 94],
  ['kangaskhan-mega', 115],['pinsir-mega', 127],      ['gyarados-mega', 130],
  ['aerodactyl-mega', 142],['mewtwo-mega-x', 150],    ['mewtwo-mega-y', 150],
  ['ampharos-mega', 181],  ['scizor-mega', 212],      ['heracross-mega', 214],
  ['houndoom-mega', 229],  ['tyranitar-mega', 248],   ['sceptile-mega', 254],
  ['blaziken-mega', 257],  ['swampert-mega', 260],    ['gardevoir-mega', 282],
  ['sableye-mega', 302],   ['mawile-mega', 303],      ['aggron-mega', 306],
  ['medicham-mega', 308],  ['manectric-mega', 310],   ['sharpedo-mega', 319],
  ['camerupt-mega', 323],  ['altaria-mega', 334],     ['banette-mega', 354],
  ['absol-mega', 359],     ['glalie-mega', 362],      ['salamence-mega', 373],
  ['metagross-mega', 376], ['latias-mega', 380],      ['latios-mega', 381],
  ['rayquaza-mega', 384],  ['lopunny-mega', 428],     ['garchomp-mega', 445],
  ['lucario-mega', 448],   ['abomasnow-mega', 460],   ['gallade-mega', 475],
  ['audino-mega', 531],    ['diancie-mega', 719],
];

async function fetchCached(url, cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = await res.json();
  fs.writeFileSync(cachePath, JSON.stringify(data));
  return data;
}

const abilityCache = new Map();
async function getAbility(nameEn) {
  if (abilityCache.has(nameEn)) return abilityCache.get(nameEn);
  try {
    const data = await fetchCached(`${API}/ability/${nameEn}`, `ability_${nameEn}`);
    const jaName = data.names.find(n => n.language.name === 'ja-Hrkt')?.name
      || data.names.find(n => n.language.name === 'ja')?.name || nameEn;
    const jaEntries = data.flavor_text_entries.filter(e => e.language.name === 'ja-Hrkt' || e.language.name === 'ja');
    const desc = jaEntries.at(-1)?.flavor_text?.replace(/\n/g, '') ?? '';
    const result = { jaName, desc };
    abilityCache.set(nameEn, result);
    return result;
  } catch {
    return { jaName: nameEn, desc: '' };
  }
}

async function fetchMega(slug, speciesId) {
  const pokemon = await fetchCached(`${API}/pokemon/${slug}`, `pokemon_${slug}`);
  const species = await fetchCached(`${API}/pokemon-species/${speciesId}`, `species_${speciesId}`);

  const jaName = species.names.find(n => n.language.name === 'ja-Hrkt')?.name
    || species.names.find(n => n.language.name === 'ja')?.name || slug;

  // フォルム名: slug から species slug を除いたサフィックス
  const speciesSlug = species.name;
  const suffix = slug.replace(`${speciesSlug}-`, '');
  const form = MEGA_FORM_JA[suffix] || `メガ(${suffix})`;

  const types = pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => TYPE_JA[t.type.name] || t.type.name);

  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const stats = statNames.map(name => pokemon.stats.find(s => s.stat.name === name)?.base_stat ?? 0);

  const abilities = await Promise.all(
    pokemon.abilities.sort((a, b) => a.slot - b.slot).map(async (a) => {
      const { jaName: name, desc } = await getAbility(a.ability.name);
      return { name, hidden: a.is_hidden, desc };
    })
  );

  return {
    name: jaName,
    no: `#${String(speciesId).padStart(4, '0')}`,
    form,
    types,
    stats,
    abilities,
    enName: pokemon.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-'),
    tier: 'Illegal', // 現行フォーマット外
  };
}

async function main() {
  console.log('=== メガ進化データ追記スクリプト ===');
  const pokemon = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));

  // 既存のメガ進化エントリを削除（再実行時の重複防止）
  const base = pokemon.filter(p => !p.form?.includes('メガ'));

  const results = [];
  for (const [slug, speciesId] of MEGA_LIST) {
    try {
      process.stdout.write(`  ${slug}... `);
      const entry = await fetchMega(slug, speciesId);
      results.push(entry);
      console.log(`✅ ${entry.name}(${entry.form})`);
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  }

  // 元ポケモンの直後に挿入されるようにソート
  const all = [...base, ...results];
  all.sort((a, b) => {
    const noA = parseInt(a.no.slice(1));
    const noB = parseInt(b.no.slice(1));
    if (noA !== noB) return noA - noB;
    if (!a.form && b.form) return -1;
    if (a.form && !b.form) return 1;
    return 0;
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`\n✅ 完了: ${results.length}件追加、合計${all.length}体`);
}

main().catch(e => { console.error(e); process.exit(1); });
