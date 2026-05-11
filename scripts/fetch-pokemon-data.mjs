#!/usr/bin/env node
/**
 * PokéAPI から Gen1-9 全ポケモンの対戦向けデータを取得するスクリプト。
 * キャッシュ付き。結果を src/data/pokemon.json に出力する。
 *
 * 実行: node scripts/fetch-pokemon-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const OUTPUT = path.join(ROOT, 'src', 'data', 'pokemon.json');
const API = 'https://pokeapi.co/api/v2';

// Gen 1-9 の species ID 範囲
const MAX_SPECIES_ID = 1025;
// 並列取得数
const BATCH_SIZE = 8;
// バッチ間の待機時間 (ms)
const BATCH_DELAY = 300;

// タイプ英語 → 日本語
const TYPE_JA = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
};

// フォルムサフィックス → 日本語フォルム名
const FORM_JA = {
  'alola': 'アローラのすがた',
  'galar': 'ガラルのすがた',
  'hisui': 'ヒスイのすがた',
  'paldea': 'パルデアのすがた',
  'origin': 'オリジンフォルム',
  'sky': 'スカイフォルム',
  'therian': 'れいじゅうフォルム',
  'black': 'ブラックフォルム',
  'white': 'ホワイトフォルム',
  'resolute': 'かくごのすがた',
  'pirouette': 'ステップフォルム',
  'blade': 'ブレードフォルム',
  'shield': 'シールドフォルム',
  'school': 'むれのすがた',
  'dusk': 'たそがれのすがた',
  'midnight': 'まよなかのすがた',
  'dawn-wings': 'れいこくのつばさ',
  'dusk-mane': 'たそがれのたてがみ',
  'ultra': 'ウルトラ',
  'single-strike': 'いちげきのかた',
  'rapid-strike': 'れんげきのかた',
  'hero': 'ヒーローのすがた',
  'blood-moon': 'ブラッドムーンのすがた',
  'ice': 'こおりのすがた',
  'shadow': 'シャドーのすがた',
  'crowned': 'けんのおうのすがた',
  'eternamax': 'エタールマックス',
  'zen': 'ダルマモード',
  'hangry': 'はらぺこのすがた',
  'noice': 'のっぺらのすがた',
  'gulping': 'のみこみのすがた',
  'gorging': 'たべまくりのすがた',
  'own-tempo': 'マイペース',
  'starter': 'スターターのすがた',
  'roaming': 'さすらいのすがた',
  'chest': 'きんこのすがた',
  'family-of-three': 'さんしまいのすがた',
  'combat': 'コンバットのすがた',
  'blaze': 'ブレイズのすがた',
  'aqua': 'アクアのすがた',
};

// スキップするフォルムのキーワード（メガ・キョダイ・トーテム等は対戦ツールとして除外）
const SKIP_FORM_KEYWORDS = ['mega', 'gmax', 'totem', 'eternal', 'partner', 'cap', 'original', 'cosplay', 'rock-star', 'belle', 'pop-star', 'phd', 'libre', 'fancy', 'pokeball'];

// ──────────────────────────────────
// キャッシュ付きフェッチ
// ──────────────────────────────────
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function fetchCached(url, cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = await res.json();
  fs.writeFileSync(cachePath, JSON.stringify(data));
  return data;
}

// ──────────────────────────────────
// 特性データ取得（日本語名・説明）
// ──────────────────────────────────
const abilityCache = new Map();

async function getAbility(nameEn) {
  if (abilityCache.has(nameEn)) return abilityCache.get(nameEn);

  try {
    const data = await fetchCached(`${API}/ability/${nameEn}`, `ability_${nameEn}`);

    const jaName = data.names.find(n => n.language.name === 'ja-Hrkt')?.name
      || data.names.find(n => n.language.name === 'ja')?.name
      || nameEn;

    // 最新世代のフレーバーテキスト（日本語）を取得
    const jaEntries = data.flavor_text_entries.filter(e => e.language.name === 'ja-Hrkt' || e.language.name === 'ja');
    const desc = jaEntries.at(-1)?.flavor_text?.replace(/\n/g, '') ?? '';

    const result = { jaName, desc };
    abilityCache.set(nameEn, result);
    return result;
  } catch {
    return { jaName: nameEn, desc: '' };
  }
}

// ──────────────────────────────────
// 1体分のポケモンデータを処理
// ──────────────────────────────────
async function processPokemon(pokemonName, speciesId, isDefault) {
  const pokemon = await fetchCached(`${API}/pokemon/${pokemonName}`, `pokemon_${pokemonName}`);
  const species = await fetchCached(`${API}/pokemon-species/${speciesId}`, `species_${speciesId}`);

  // 日本語名（種族名）
  const jaName = species.names.find(n => n.language.name === 'ja-Hrkt')?.name
    || species.names.find(n => n.language.name === 'ja')?.name
    || pokemonName;

  // フォルム名の判定
  let form = undefined;
  if (!isDefault) {
    // pokemonName から species name を除いたサフィックスがフォルム
    const speciesName = species.name;
    const suffix = pokemonName.replace(`${speciesName}-`, '');
    if (suffix && suffix !== speciesName) {
      form = FORM_JA[suffix] || suffix;
    }
  }

  // タイプ
  const types = pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => TYPE_JA[t.type.name] || t.type.name);

  // 種族値 [HP, こうげき, ぼうぎょ, とくこう, とくぼう, すばやさ]
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const stats = statNames.map(name => pokemon.stats.find(s => s.stat.name === name)?.base_stat ?? 0);

  // 特性
  const abilities = await Promise.all(
    pokemon.abilities
      .sort((a, b) => a.slot - b.slot)
      .map(async (a) => {
        const { jaName: name, desc } = await getAbility(a.ability.name);
        return { name, hidden: a.is_hidden, desc };
      })
  );

  return {
    name: jaName,
    no: `#${String(speciesId).padStart(4, '0')}`,
    ...(form ? { form } : {}),
    types,
    stats,
    abilities,
  };
}

// ──────────────────────────────────
// バッチ処理ユーティリティ
// ──────────────────────────────────
async function runBatches(items, fn, label) {
  const results = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map(fn));
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }
    const done = Math.min(i + BATCH_SIZE, items.length);
    process.stdout.write(`\r${label}: ${done}/${items.length}`);
    if (done < items.length) await new Promise(r => setTimeout(r, BATCH_DELAY));
  }
  console.log();
  return results;
}

// ──────────────────────────────────
// メイン
// ──────────────────────────────────
async function main() {
  console.log('=== pokecham データ取得スクリプト ===');
  console.log(`対象: Gen 1-9 (species ID 1-${MAX_SPECIES_ID})`);
  console.log(`キャッシュ: ${CACHE_DIR}`);
  console.log('');

  // species 一覧を取得して varieties（フォルム含む）を展開
  console.log('Step 1/3: species 情報を取得中...');
  const speciesIds = Array.from({ length: MAX_SPECIES_ID }, (_, i) => i + 1);

  const speciesList = await runBatches(speciesIds, async (id) => {
    const data = await fetchCached(`${API}/pokemon-species/${id}`, `species_${id}`);
    return { id, data };
  }, 'Species');

  // varieties を展開してポケモン一覧を作成
  const pokemonTargets = [];
  for (const { id, data } of speciesList) {
    for (const v of data.varieties) {
      const name = v.pokemon.name;
      // スキップフォルム判定
      if (SKIP_FORM_KEYWORDS.some(kw => name.includes(kw))) continue;
      pokemonTargets.push({ name, speciesId: id, isDefault: v.is_default });
    }
  }

  console.log(`\nStep 2/3: ポケモン詳細データを取得中 (${pokemonTargets.length}体)...`);
  const pokemonList = await runBatches(pokemonTargets, async ({ name, speciesId, isDefault }) => {
    return await processPokemon(name, speciesId, isDefault);
  }, 'Pokemon');

  // 特性の一括取得はすでに processPokemon 内で行われているが
  // abilityCache の状況をレポート
  console.log(`Step 3/3: 特性データ取得完了 (${abilityCache.size}種類)`);

  // ソート: 図鑑番号 → フォルムなし優先
  pokemonList.sort((a, b) => {
    const noA = parseInt(a.no.slice(1));
    const noB = parseInt(b.no.slice(1));
    if (noA !== noB) return noA - noB;
    if (!a.form && b.form) return -1;
    if (a.form && !b.form) return 1;
    return 0;
  });

  // 出力
  fs.writeFileSync(OUTPUT, JSON.stringify(pokemonList, null, 2), 'utf-8');

  console.log('');
  console.log(`✅ 完了: ${pokemonList.length}体のデータを出力`);
  console.log(`   → ${OUTPUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
