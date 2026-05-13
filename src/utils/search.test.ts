import { describe, it, expect } from 'vitest';
import { searchPokemon } from './search';

describe('searchPokemon', () => {
  describe('完全一致', () => {
    it('ガブリアスを見つける', () => {
      const results = searchPokemon('ガブリアス');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ガブリアス');
    });

    it('ピカチュウを見つける', () => {
      const results = searchPokemon('ピカチュウ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ピカチュウ');
    });
  });

  describe('ひらがな入力', () => {
    it('ひらがなをカタカナに変換して検索する', () => {
      const results = searchPokemon('がぶりあす');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ガブリアス');
    });
  });

  describe('エイリアス検索', () => {
    it('「ガブ」でガブリアスを見つける', () => {
      const results = searchPokemon('ガブ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ガブリアス');
    });

    it('「ミミ」でミミッキュを見つける', () => {
      const results = searchPokemon('ミミ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ミミッキュ');
    });

    it('「サーフゴ」でサーフゴーを見つける', () => {
      const results = searchPokemon('サーフゴ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('サーフゴー');
    });
  });

  describe('前方一致', () => {
    it('「ガブリ」でガブリアスを見つける', () => {
      const results = searchPokemon('ガブリ');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(p => p.name === 'ガブリアス')).toBe(true);
    });
  });

  describe('メガシンカ', () => {
    it('「メガガブリアス」でメガフォームを見つける', () => {
      const results = searchPokemon('メガガブリアス');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(p => {
        expect(p.form).toContain('メガシンカ');
      });
    });

    it('「メガリザードン」でリザードンのメガフォームを見つける', () => {
      const results = searchPokemon('メガリザードン');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(p => {
        expect(p.form).toContain('メガシンカ');
      });
    });
  });

  describe('正規化', () => {
    it('前後スペースを無視する', () => {
      const results = searchPokemon('  ガブリアス  ');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('ガブリアス');
    });

    it('空文字列は空配列を返す', () => {
      const results = searchPokemon('');
      expect(results).toEqual([]);
    });

    it('スペースのみは空配列を返す', () => {
      const results = searchPokemon('   ');
      expect(results).toEqual([]);
    });
  });

  describe('見つからない場合', () => {
    it('存在しない名前は配列を返す', () => {
      const results = searchPokemon('xyzxyzxyz');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('データ整合性', () => {
    it('検索結果は必ずname, types, stats, abilitiesを持つ', () => {
      const results = searchPokemon('ガブリアス');
      expect(results.length).toBeGreaterThan(0);
      const p = results[0];
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('types');
      expect(p).toHaveProperty('stats');
      expect(p).toHaveProperty('abilities');
      expect(Array.isArray(p.types)).toBe(true);
      expect(Array.isArray(p.stats)).toBe(true);
      expect(p.stats).toHaveLength(6);
    });
  });
});
