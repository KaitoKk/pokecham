import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

interface MockRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((e: { results: { isFinal: boolean; 0: { transcript: string }; length: number }[] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

let instances: MockRecognition[] = [];

function FakeRecognition(this: MockRecognition) {
  this.lang = '';
  this.interimResults = false;
  this.maxAlternatives = 0;
  this.continuous = false;
  this.onstart = null;
  this.onresult = null;
  this.onerror = null;
  this.onend = null;
  this.start = vi.fn();
  this.stop = vi.fn();
  instances.push(this);
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    instances = [];
    // @ts-expect-error mock global
    window.SpeechRecognition = FakeRecognition;
  });

  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.SpeechRecognition;
    // @ts-expect-error cleanup
    delete window.webkitSpeechRecognition;
  });

  it('初期状態は isListening / isReady ともに false', () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult: vi.fn() })
    );
    expect(result.current.isListening).toBe(false);
    expect(result.current.isReady).toBe(false);
  });

  it('SR 未対応ブラウザでは alert を出して何もしない', () => {
    // @ts-expect-error cleanup
    delete window.SpeechRecognition;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult: vi.fn() })
    );
    act(() => { result.current.startListening(); });

    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
    alertSpy.mockRestore();
  });

  it('startListening で isListening が true になり onstart で isReady に', () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult: vi.fn() })
    );
    act(() => { result.current.startListening(); });

    expect(result.current.isListening).toBe(true);
    expect(instances).toHaveLength(1);

    act(() => { instances[0].onstart?.(); });
    expect(result.current.isReady).toBe(true);
  });

  it('isFinal な結果で onResult が呼ばれる', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));
    act(() => { result.current.startListening(); });

    act(() => {
      instances[0].onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'ピカチュウ' }, length: 1 }],
      });
    });

    expect(onResult).toHaveBeenCalledWith('ピカチュウ');
  });

  it('interim 結果で onInterim が呼ばれる', () => {
    const onInterim = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult: vi.fn(), onInterim })
    );
    act(() => { result.current.startListening(); });

    act(() => {
      instances[0].onresult?.({
        results: [{ isFinal: false, 0: { transcript: 'ピカ' }, length: 1 }],
      });
    });

    expect(onInterim).toHaveBeenCalledWith('ピカ');
  });

  it('webkitSpeechRecognition のみがある環境でも動く', () => {
    // @ts-expect-error cleanup
    delete window.SpeechRecognition;
    // @ts-expect-error mock global
    window.webkitSpeechRecognition = FakeRecognition;

    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult: vi.fn() })
    );
    act(() => { result.current.startListening(); });

    expect(result.current.isListening).toBe(true);
    expect(instances).toHaveLength(1);
  });
});
