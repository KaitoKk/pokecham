#!/usr/bin/env node
/**
 * 不足ポケモンデータを補完するスクリプト
 *   1. 欠番ベースポケモン (Meganium No.154 / Yanmega No.469 / Capsakid No.951)
 *   2. Showdownにあるが未収録のメガシンカ44体
 *   3. 対戦で差異のあるフォルム違い
 *
 * 実行: node scripts/fill-missing.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dex } from '@pkmn/dex';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.join(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const OUTPUT   = path.join(ROOT, 'src', 'data', 'pokemon.json');
const API      = 'https://pokeapi.co/api/v2';

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const TYPE_JA = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
};
const SD_TYPE_JA = {
  Normal: 'ノーマル', Fire: 'ほのお', Water: 'みず', Electric: 'でんき',
  Grass: 'くさ', Ice: 'こおり', Fighting: 'かくとう', Poison: 'どく',
  Ground: 'じめん', Flying: 'ひこう', Psychic: 'エスパー', Bug: 'むし',
  Rock: 'いわ', Ghost: 'ゴースト', Dragon: 'ドラゴン', Dark: 'あく',
  Steel: 'はがね', Fairy: 'フェアリー',
};

// PokéAPI フォルムスラッグサフィックス → 日本語フォルム名（fallback用）
const FORM_JA_FALLBACK = {
  'mega': 'メガシンカ', 'mega-x': 'メガシンカX', 'mega-y': 'メガシンカY',
  'attack': 'アタックフォルム', 'defense': 'ディフェンスフォルム', 'speed': 'スピードフォルム',
  'heat': 'ヒートロトム', 'wash': 'ウォッシュロトム', 'frost': 'フロストロトム',
  'fan': 'スピンロトム', 'mow': 'カットロトム',
  'paldea-combat-breed': 'パルデアのすがた（コンバット）',
  'paldea-blaze-breed': 'パルデアのすがた（ブレイズ）',
  'paldea-aqua-breed': 'パルデアのすがた（アクア）',
  'battle-bond': 'サトシゲッコウガ',
  'f': '♀のすがた',
  'unbound': 'ときはなたれしフーパ',
  'pom-pom': 'ポムポムスタイル', 'pau': 'パウスタイル', 'sensu': 'センススタイル',
  'dusk': 'たそがれのたてがみ', 'dawn': 'れいこくのつばさ',
  'low-key': 'ローキーフォルム',
  'bloodmoon': 'ブラッドムーンのすがた',
  'wellspring-mask': 'いどのめん', 'hearthflame-mask': 'かまどのめん', 'cornerstone-mask': 'いしずえのめん',
  'terastal': 'テラスタルフォルム', 'stellar': 'ステラフォルム',
  'three-segment': 'みつなぎのすがた',
  'artisan': '巧みのわざのすがた', 'masterpiece': '逸品のすがた',
  'droopy': 'うなだれたすがた', 'stretchy': 'のびのびすがた',
};

// ──────────────────────────────────────────────
// 補完対象リスト
// ──────────────────────────────────────────────

// 1. 欠番ベースポケモン (speciesId のみ)
const MISSING_BASE_IDS = [154, 469, 951];

// 2. 未収録メガシンカ [pokeapi-slug, speciesId, showdown-name]
const MISSING_MEGAS = [
  ['beedrill-mega', 15, 'Beedrill-Mega'],
  ['pidgeot-mega', 18, 'Pidgeot-Mega'],
  ['raichu-mega-x', 26, 'Raichu-Mega-X'],
  ['raichu-mega-y', 26, 'Raichu-Mega-Y'],
  ['clefable-mega', 36, 'Clefable-Mega'],
  ['victreebel-mega', 71, 'Victreebel-Mega'],
  ['slowbro-mega', 80, 'Slowbro-Mega'],
  ['starmie-mega', 121, 'Starmie-Mega'],
  ['dragonite-mega', 149, 'Dragonite-Mega'],
  ['meganium-mega', 154, 'Meganium-Mega'],
  ['feraligatr-mega', 160, 'Feraligatr-Mega'],
  ['steelix-mega', 208, 'Steelix-Mega'],
  ['skarmory-mega', 227, 'Skarmory-Mega'],
  ['chimecho-mega', 358, 'Chimecho-Mega'],
  ['staraptor-mega', 398, 'Staraptor-Mega'],
  ['froslass-mega', 478, 'Froslass-Mega'],
  ['heatran-mega', 485, 'Heatran-Mega'],
  ['darkrai-mega', 491, 'Darkrai-Mega'],
  ['emboar-mega', 500, 'Emboar-Mega'],
  ['excadrill-mega', 530, 'Excadrill-Mega'],
  ['scolipede-mega', 545, 'Scolipede-Mega'],
  ['scrafty-mega', 560, 'Scrafty-Mega'],
  ['eelektross-mega', 604, 'Eelektross-Mega'],
  ['chandelure-mega', 609, 'Chandelure-Mega'],
  ['golurk-mega', 623, 'Golurk-Mega'],
  ['chesnaught-mega', 652, 'Chesnaught-Mega'],
  ['delphox-mega', 655, 'Delphox-Mega'],
  ['greninja-mega', 658, 'Greninja-Mega'],
  ['pyroar-mega', 668, 'Pyroar-Mega'],
  ['floette-mega', 670, 'Floette-Mega'],
  ['malamar-mega', 687, 'Malamar-Mega'],
  ['barbaracle-mega', 689, 'Barbaracle-Mega'],
  ['dragalge-mega', 691, 'Dragalge-Mega'],
  ['hawlucha-mega', 701, 'Hawlucha-Mega'],
  ['zygarde-mega', 718, 'Zygarde-Mega'],
  ['crabominable-mega', 740, 'Crabominable-Mega'],
  ['golisopod-mega', 768, 'Golisopod-Mega'],
  ['drampa-mega', 780, 'Drampa-Mega'],
  ['magearna-mega', 801, 'Magearna-Mega'],
  ['zeraora-mega', 807, 'Zeraora-Mega'],
  ['falinks-mega', 870, 'Falinks-Mega'],
  ['scovillain-mega', 952, 'Scovillain-Mega'],
  ['glimmora-mega', 970, 'Glimmora-Mega'],
  ['baxcalibur-mega', 998, 'Baxcalibur-Mega'],
];

// 3. 対戦差異フォルム [pokeapi-slug, speciesId, showdown-name]
const BATTLE_FORMS = [
  ['deoxys-attack', 386, 'Deoxys-Attack'],
  ['deoxys-defense', 386, 'Deoxys-Defense'],
  ['deoxys-speed', 386, 'Deoxys-Speed'],
  ['rotom-heat', 479, 'Rotom-Heat'],
  ['rotom-wash', 479, 'Rotom-Wash'],
  ['rotom-frost', 479, 'Rotom-Frost'],
  ['rotom-fan', 479, 'Rotom-Fan'],
  ['rotom-mow', 479, 'Rotom-Mow'],
  ['tauros-paldea-combat-breed', 128, 'Tauros-Paldea-Combat'],
  ['tauros-paldea-blaze-breed', 128, 'Tauros-Paldea-Blaze'],
  ['tauros-paldea-aqua-breed', 128, 'Tauros-Paldea-Aqua'],
  ['greninja-battle-bond', 658, 'Greninja-Bond'],
  ['meowstic-f', 678, 'Meowstic-F'],
  ['hoopa-unbound', 720, 'Hoopa-Unbound'],
  ['oricorio-pom-pom', 741, 'Oricorio-Pom-Pom'],
  ['oricorio-pau', 741, "Oricorio-Pa'u"],
  ['oricorio-sensu', 741, 'Oricorio-Sensu'],
  ['necrozma-dusk', 800, 'Necrozma-Dusk-Mane'],
  ['necrozma-dawn', 800, 'Necrozma-Dawn-Wings'],
  ['toxtricity-low-key', 849, 'Toxtricity-Low-Key'],
  ['indeedee-f', 876, 'Indeedee-F'],
  ['ursaluna-bloodmoon', 901, 'Ursaluna-Bloodmoon'],
  ['basculegion-f', 902, 'Basculegion-F'],
  ['oinkologne-f', 916, 'Oinkologne-F'],
  ['tatsugiri-droopy', 978, 'Tatsugiri-Droopy'],
  ['tatsugiri-stretchy', 978, 'Tatsugiri-Stretchy'],
  ['dudunsparce-three-segment', 982, 'Dudunsparce-Three-Segment'],
  ['poltchageist-artisan', 1012, 'Poltchageist-Artisan'],
  ['sinistcha-masterpiece', 1013, 'Sinistcha-Masterpiece'],
  ['ogerpon-wellspring-mask', 1017, 'Ogerpon-Wellspring'],
  ['ogerpon-hearthflame-mask', 1017, 'Ogerpon-Hearthflame'],
  ['ogerpon-cornerstone-mask', 1017, 'Ogerpon-Cornerstone'],
  ['terapagos-terastal', 1024, 'Terapagos-Terastal'],
  ['terapagos-stellar', 1024, 'Terapagos-Stellar'],
];

// ──────────────────────────────────────────────
// ユーティリティ
// ──────────────────────────────────────────────

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
    const jaEntries = data.flavor_text_entries.filter(
      e => e.language.name === 'ja-Hrkt' || e.language.name === 'ja'
    );
    const desc = jaEntries.at(-1)?.flavor_text?.replace(/\n/g, '') ?? '';
    const result = { jaName, desc };
    abilityCache.set(nameEn, result);
    return result;
  } catch {
    return { jaName: nameEn, desc: '' };
  }
}

function sdToEntry(sdSpecies, baseEntry) {
  const types = sdSpecies.types.map(t => SD_TYPE_JA[t] || t);
  const bs = sdSpecies.baseStats;
  const stats = [bs.hp, bs.atk, bs.def, bs.spa, bs.spd, bs.spe];
  const formeSuffix = sdSpecies.forme
    ? sdSpecies.forme.toLowerCase().replace(/ /g, '-')
    : '';
  const form = formeSuffix.includes('mega-x') ? 'メガシンカX'
    : formeSuffix.includes('mega-y') ? 'メガシンカY'
    : formeSuffix.includes('mega') ? 'メガシンカ'
    : FORM_JA_FALLBACK[formeSuffix] || sdSpecies.forme || null;
  return {
    name: baseEntry.name,
    no: baseEntry.no,
    form,
    types,
    stats,
    abilities: baseEntry.abilities,
    enName: sdSpecies.name,
  };
}

async function fetchEntry(slug, speciesId, sdName) {
  // PokéAPI から取得試みる
  try {
    const [pokemon, species, form] = await Promise.all([
      fetchCached(`${API}/pokemon/${slug}`, `pokemon_${slug}`),
      fetchCached(`${API}/pokemon-species/${speciesId}`, `species_${speciesId}`),
      fetchCached(`${API}/pokemon-form/${slug}`, `form_${slug}`).catch(() => null),
    ]);

    const jaName = species.names.find(n => n.language.name === 'ja-Hrkt')?.name
      || species.names.find(n => n.language.name === 'ja')?.name;

    // フォルム名: form endpoint の form_names 優先（言語コードは大文字小文字問わず比較）、なければ fallback
    let formJa = form?.form_names?.find(n => n.language.name.toLowerCase() === 'ja-hrkt')?.name
      || form?.form_names?.find(n => n.language.name === 'ja')?.name
      || null;

    if (!formJa && !form?.is_default) {
      const suffix = slug.replace(species.name + '-', '');
      formJa = FORM_JA_FALLBACK[suffix] || null;
    }

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

    const enName = sdName || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');

    return {
      name: jaName,
      no: `#${String(speciesId).padStart(4, '0')}`,
      ...(formJa && !form?.is_default ? { form: formJa } : {}),
      types,
      stats,
      abilities,
      enName,
    };
  } catch (e) {
    // PokéAPI にない場合は Showdown fallback
    if (!sdName) throw e;
    const dex = Dex.forGen(9);
    const sd = dex.species.get(sdName);
    if (!sd?.exists) throw new Error(`Showdown にも見つかりません: ${sdName}`);
    // ベースポケモンの情報を現在のDBから取得
    const db = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    const baseEntry = db.find(p => parseInt(p.no.slice(1)) === speciesId && !p.form);
    if (!baseEntry) throw new Error(`ベースポケモンが DB にありません: No.${speciesId}`);
    return sdToEntry(sd, baseEntry);
  }
}

// ──────────────────────────────────────────────
// メイン
// ──────────────────────────────────────────────

async function main() {
  const db = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
  const existingEnNames = new Set(db.map(p => p.enName).filter(Boolean));
  const existingNos = new Set(db.map(p => p.no));

  const results = [];
  let ok = 0, skip = 0, fail = 0;

  async function processEntry(slug, speciesId, sdName, label) {
    const enKey = sdName || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
    if (existingEnNames.has(enKey)) {
      skip++;
      return;
    }
    process.stdout.write(`  [${label}] ${slug}... `);
    try {
      const entry = await fetchEntry(slug, speciesId, sdName);
      results.push(entry);
      console.log(`✅ ${entry.name}${entry.form ? `(${entry.form})` : ''}`);
      ok++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      fail++;
    }
  }

  // 1. 欠番ベースポケモン
  console.log('\n=== 1. 欠番ベースポケモン ===');
  for (const id of MISSING_BASE_IDS) {
    const no = `#${String(id).padStart(4, '0')}`;
    if (existingNos.has(no)) { skip++; continue; }
    await processEntry(
      (await fetchCached(`${API}/pokemon-species/${id}`, `species_${id}`)).name,
      id,
      null,
      'base'
    );
  }

  // 2. 未収録メガシンカ
  console.log('\n=== 2. 未収録メガシンカ ===');
  for (const [slug, speciesId, sdName] of MISSING_MEGAS) {
    await processEntry(slug, speciesId, sdName, 'mega');
  }

  // 3. 対戦差異フォルム
  console.log('\n=== 3. 対戦差異フォルム ===');
  for (const [slug, speciesId, sdName] of BATTLE_FORMS) {
    await processEntry(slug, speciesId, sdName, 'form');
  }

  // マージ＆ソート
  const all = [...db, ...results];
  all.sort((a, b) => {
    const noA = parseInt(a.no.slice(1));
    const noB = parseInt(b.no.slice(1));
    if (noA !== noB) return noA - noB;
    if (!a.form && b.form) return -1;
    if (a.form && !b.form) return 1;
    return 0;
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`\n✅ 完了: 追加 ${ok} 件 / スキップ ${skip} 件 / 失敗 ${fail} 件`);
  console.log(`   合計 ${all.length} 体 → ${OUTPUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
