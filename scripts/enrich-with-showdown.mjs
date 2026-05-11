#!/usr/bin/env node
/**
 * @pkmn/dex を使って pokemon.json に enName (英語名) と tier (Showdown ティア) を付与する。
 * 実行: node scripts/enrich-with-showdown.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dex } from '@pkmn/dex';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'pokemon.json');

// 日本語フォルム名 → Showdown forme キー (小文字、ハイフンなし)
const FORM_JA_TO_SD = {
  'アローラのすがた': 'alola',
  'ガラルのすがた': 'galar',
  'ヒスイのすがた': 'hisui',
  'パルデアのすがた': 'paldea',
  'オリジンフォルム': 'origin',
  'スカイフォルム': 'sky',
  'れいじゅうフォルム': 'therian',
  'ブラックフォルム': 'black',
  'ホワイトフォルム': 'white',
  'かくごのすがた': 'resolute',
  'ステップフォルム': 'pirouette',
  'ブレードフォルム': 'blade',
  'シールドフォルム': 'shield',
  'むれのすがた': 'school',
  'たそがれのすがた': 'dusk',
  'まよなかのすがた': 'midnight',
  'れいこくのつばさ': 'dawnwings',
  'たそがれのたてがみ': 'duskmane',
  'ウルトラ': 'ultra',
  'いちげきのかた': 'singlestrike',
  'れんげきのかた': 'rapidstrike',
  'ヒーローのすがた': 'hero',
  'ブラッドムーンのすがた': 'bloodmoon',
  'こおりのすがた': 'ice',
  'シャドーのすがた': 'shadow',
  'けんのおうのすがた': 'crowned',
  'エタールマックス': 'eternamax',
  'ダルマモード': 'zen',
  'はらぺこのすがた': 'hangry',
  'のっぺらのすがた': 'noice',
  'のみこみのすがた': 'gulping',
  'たべまくりのすがた': 'gorging',
  'マイペース': 'owntempo',
  'スターターのすがた': 'starter',
  'さすらいのすがた': 'roaming',
  'きんこのすがた': 'chest',
  'さんしまいのすがた': 'four',  // Maushold-Four in Showdown
  'コンバットのすがた': 'combat',
  'ブレイズのすがた': 'blaze',
  'アクアのすがた': 'aqua',
};

const dex = Dex.forGen(9);

// Showdown マップ構築: num_forme → { enName, tier, doublesTier }
const showdownMap = new Map();
for (const s of dex.species.all()) {
  if (s.num < 1 || s.num > 1025) continue;
  const formeKey = s.forme ? s.forme.toLowerCase().replace(/-/g, '') : '';
  const key = formeKey ? `${s.num}_${formeKey}` : String(s.num);
  if (!showdownMap.has(key)) {
    showdownMap.set(key, { enName: s.name, tier: s.tier, doublesTier: s.doublesTier });
  }
}

const pokemon = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));

let matched = 0, unmatched = 0;

for (const p of pokemon) {
  const num = parseInt(p.no.slice(1), 10);
  let key = String(num);

  if (p.form) {
    const sdKey = FORM_JA_TO_SD[p.form];
    if (sdKey) key = `${num}_${sdKey}`;
  }

  const sd = showdownMap.get(key);
  if (sd) {
    p.enName = sd.enName;
    p.tier = sd.tier;
    matched++;
  } else {
    unmatched++;
    console.warn(`  未対応: ${p.name} (${p.form || 'default'}) key=${key}`);
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(pokemon, null, 2), 'utf-8');
console.log(`✅ 完了: ${matched} 件マッチ、${unmatched} 件未対応`);
console.log(`   → ${OUTPUT}`);
