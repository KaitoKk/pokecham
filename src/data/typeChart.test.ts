import { describe, it, expect } from 'vitest';
import { calcMatchups } from './typeChart';

// calcMatchups(defenderTypes) は「攻撃タイプ→防御タイプ」の倍率を返す
// CHART[攻撃][防御] = 倍率

describe('calcMatchups', () => {
  it('全18タイプの結果を返す', () => {
    const results = calcMatchups(['みず']);
    expect(results).toHaveLength(18);
  });

  it('結果は { type, multiplier } の形を持つ', () => {
    const results = calcMatchups(['ほのお']);
    results.forEach(r => {
      expect(r).toHaveProperty('type');
      expect(r).toHaveProperty('multiplier');
      expect(typeof r.type).toBe('string');
      expect(typeof r.multiplier).toBe('number');
    });
  });

  describe('単タイプ（攻撃→防御）', () => {
    it('みずタイプへのほのお攻撃は×0.5（ほのおはみずに半減）', () => {
      const results = calcMatchups(['みず']);
      const fire = results.find(r => r.type === 'ほのお');
      expect(fire?.multiplier).toBe(0.5);
    });

    it('みずタイプへのくさ攻撃は×2（くさはみずに弱点）', () => {
      const results = calcMatchups(['みず']);
      const grass = results.find(r => r.type === 'くさ');
      expect(grass?.multiplier).toBe(2);
    });

    it('みずタイプへのでんき攻撃は×2（でんきはみずに弱点）', () => {
      const results = calcMatchups(['みず']);
      const electric = results.find(r => r.type === 'でんき');
      expect(electric?.multiplier).toBe(2);
    });

    it('フェアリータイプへのドラゴン攻撃は×0（ドラゴン技はフェアリーに無効）', () => {
      const results = calcMatchups(['フェアリー']);
      const dragon = results.find(r => r.type === 'ドラゴン');
      expect(dragon?.multiplier).toBe(0);
    });

    it('ゴーストタイプへのノーマル攻撃は×0（ノーマル技はゴーストに無効）', () => {
      const results = calcMatchups(['ゴースト']);
      const normal = results.find(r => r.type === 'ノーマル');
      expect(normal?.multiplier).toBe(0);
    });

    it('あくタイプへのエスパー攻撃は×0（エスパー技はあくに無効）', () => {
      const results = calcMatchups(['あく']);
      const psychic = results.find(r => r.type === 'エスパー');
      expect(psychic?.multiplier).toBe(0);
    });
  });

  describe('複合タイプ', () => {
    it('みず・じめんタイプへのでんき攻撃は×0（じめんがでんきを無効）', () => {
      const results = calcMatchups(['みず', 'じめん']);
      const electric = results.find(r => r.type === 'でんき');
      expect(electric?.multiplier).toBe(0);
    });

    it('みず・じめんタイプへのくさ攻撃は×4（くさは両方に弱点）', () => {
      const results = calcMatchups(['みず', 'じめん']);
      const grass = results.find(r => r.type === 'くさ');
      expect(grass?.multiplier).toBe(4);
    });

    it('ほのお・ひこうタイプへのいわ攻撃は×4（いわは両方に弱点）', () => {
      const results = calcMatchups(['ほのお', 'ひこう']);
      const rock = results.find(r => r.type === 'いわ');
      expect(rock?.multiplier).toBe(4);
    });
  });

  describe('倍率1（ニュートラル）', () => {
    it('ノーマルタイプへのノーマル攻撃は×1', () => {
      const results = calcMatchups(['ノーマル']);
      const normal = results.find(r => r.type === 'ノーマル');
      expect(normal?.multiplier).toBe(1);
    });
  });
});
