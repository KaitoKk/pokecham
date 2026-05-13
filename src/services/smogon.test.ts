import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SmogonSet } from './smogon';

// モジュールキャッシュをリセットするため動的インポートを使う
let getPokemonSets: (enName: string, format?: string, genNum?: number) => Promise<SmogonSet[]>;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('./smogon');
  getPokemonSets = mod.getPokemonSets;
});

const MOCK_DATA = {
  Garchomp: {
    ou: {
      'Swords Dance': {
        item: 'Rocky Helmet',
        moves: ['Swords Dance', 'Earthquake', 'Scale Shot', 'Stone Edge'],
        nature: 'Jolly',
        evs: { hp: 4, atk: 252, spe: 252 },
      },
    },
    ubers: {
      'Offensive': {
        item: 'Choice Scarf',
        moves: ['Earthquake', 'Scale Shot', 'Stone Edge', 'Fire Blast'],
        nature: 'Naive',
        evs: { atk: 252, spa: 4, spe: 252 },
      },
    },
  },
};

function mockFetchSuccess(data: unknown = MOCK_DATA) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

describe('getPokemonSets', () => {
  it('指定フォーマットのセットを返す', async () => {
    mockFetchSuccess();
    const sets = await getPokemonSets('Garchomp', 'ou', 9);
    expect(sets).toHaveLength(1);
    expect(sets[0].name).toBe('Swords Dance');
    expect(sets[0].format).toBe('ou');
    expect(sets[0].item).toBe('Rocky Helmet');
    expect(sets[0].nature).toBe('Jolly');
    expect(sets[0].moves).toContain('Earthquake');
  });

  it('フォーマット未指定時は全セットを返す', async () => {
    mockFetchSuccess();
    const sets = await getPokemonSets('Garchomp', '', 9);
    expect(sets).toHaveLength(2);
    const names = sets.map(s => s.name);
    expect(names).toContain('Swords Dance');
    expect(names).toContain('Offensive');
  });

  it('enName が空のとき空配列を返す', async () => {
    mockFetchSuccess();
    const sets = await getPokemonSets('', 'ou', 9);
    expect(sets).toEqual([]);
  });

  it('存在しないポケモン名は空配列を返す', async () => {
    mockFetchSuccess();
    const sets = await getPokemonSets('Unknown', 'ou', 9);
    expect(sets).toEqual([]);
  });

  it('fetch が失敗したとき空配列を返す', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    const sets = await getPokemonSets('Garchomp', 'ou', 9);
    expect(sets).toEqual([]);
  });

  it('item が配列のとき最初の要素を返す', async () => {
    mockFetchSuccess({
      TestMon: {
        ou: {
          'Main Set': {
            item: ['Choice Band', 'Choice Scarf'],
            moves: ['Tackle'],
            nature: 'Adamant',
            evs: {},
          },
        },
      },
    });
    const sets = await getPokemonSets('TestMon', 'ou', 9);
    expect(sets[0].item).toBe('Choice Band');
  });
});
