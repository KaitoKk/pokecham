import { useState, useRef, useCallback } from 'react';

let sharedAudioCtx = null;

function getAudioCtx() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
}

function playBeep() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) { /* 無音環境では無視 */ }
}

export function useSpeechRecognition({ onResult, onInterim }) {
  const [isListening, setIsListening] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const shouldStopRef = useRef(false);
  const recRef = useRef(null);

  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  onResultRef.current = onResult;
  onInterimRef.current = onInterim;

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('このブラウザは音声認識に対応していません。Chrome をお使いください。');
      return;
    }

    if (isListening) {
      shouldStopRef.current = true;
      recRef.current?.stop();
      return;
    }

    shouldStopRef.current = false;
    setIsListening(true);
    getAudioCtx();

    let sessionCount = 0;

    function start() {
      if (shouldStopRef.current) return;

      sessionCount++;

      const rec = new SR();
      recRef.current = rec;
      rec.lang = 'ja-JP';
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.continuous = true;

      rec.onstart = () => {
        playBeep();
        setIsReady(true);
      };

      rec.onresult = (e) => {
        const result = e.results[e.results.length - 1];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          shouldStopRef.current = true;
          onResultRef.current(transcript);
          rec.stop();
        } else {
          onInterimRef.current?.(transcript);
        }
      };

      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          console.warn('Speech error (terminal):', e.error);
          shouldStopRef.current = true;
        }
      };

      rec.onend = () => {
        if (shouldStopRef.current) {
          setIsListening(false);
          setIsReady(false);
          onInterimRef.current?.('');
        } else {
          setTimeout(start, 300);
        }
      };

      try {
        rec.start();
      } catch (err) {
        setTimeout(start, 300);
      }
    }

    start();
  }, [isListening]);

  return { isListening, isReady, startListening };
}
