import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// jsdom 29 + Node 22+ では localStorage が実装不完全になることがあるため、
// テスト環境では確実に動く in-memory 実装で上書きする。
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

Object.defineProperty(window, 'localStorage', { value: new MemoryStorage(), configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: new MemoryStorage(), configurable: true });

// AudioContext は jsdom にないので最低限のスタブを置く
class FakeOscillator {
  frequency = { value: 0 };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}
class FakeGain {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}
class FakeAudioContext {
  currentTime = 0;
  state = 'running' as const;
  destination = {};
  resume = vi.fn();
  createOscillator(): FakeOscillator { return new FakeOscillator(); }
  createGain(): FakeGain { return new FakeGain(); }
}
Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true });

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
