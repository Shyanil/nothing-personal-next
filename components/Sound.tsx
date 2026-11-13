'use client';
import { useEffect, useState } from 'react';

/**
 * Tiny synthesized game UI sounds (no audio files).
 * Browsers only allow audio after the first tap, so the context is unlocked on first interaction.
 */
type Name = 'tick' | 'select' | 'open' | 'close' | 'error' | 'success' | 'swipe' | 'zoom';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let unlocked = false; // browsers block audio until the visitor taps / types once
const listeners = new Set<(on: boolean) => void>();

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(f: number, dur: number, opts: { type?: OscillatorType; vol?: number; to?: number; at?: number } = {}) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + (opts.at ?? 0);
  const o = a.createOscillator(), g = a.createGain();
  o.type = opts.type ?? 'square';
  o.frequency.setValueAtTime(f, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.08, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

export function sfx(name: Name) {
  if (!enabled || !unlocked) return;
  switch (name) {
    case 'tick': tone(2200, 0.025, { type: 'triangle', vol: 0.025 }); break;
    case 'select': tone(660, 0.06, { vol: 0.05 }); tone(990, 0.08, { vol: 0.05, at: 0.05 }); break;
    case 'swipe': tone(500, 0.07, { type: 'triangle', vol: 0.05, to: 900 }); break;
    case 'zoom': tone(380, 0.09, { type: 'sine', vol: 0.08, to: 760 }); break;
    case 'open': tone(220, 0.16, { type: 'sawtooth', vol: 0.035, to: 880 }); tone(1320, 0.08, { type: 'triangle', vol: 0.04, at: 0.12 }); break;
    case 'close': tone(700, 0.12, { type: 'triangle', vol: 0.05, to: 220 }); break;
    case 'error': tone(150, 0.09, { vol: 0.07 }); tone(110, 0.14, { vol: 0.07, at: 0.1 }); break;
    case 'success':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, { vol: 0.06, at: i * 0.09 }));
      tone(1568, 0.35, { type: 'triangle', vol: 0.05, at: 0.36 });
      break;
  }
}

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem('np-sound', on ? '1' : '0'); } catch {}
  listeners.forEach(l => l(on));
}

/** Speaker on/off button + global listeners for hover ticks and audio unlock. */
export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    try { const v = localStorage.getItem('np-sound'); if (v === '0') { enabled = false; setOn(false); } } catch {}
    const l = (v: boolean) => setOn(v);
    listeners.add(l);
    const unlock = () => { unlocked = true; if (enabled) audio(); };
    addEventListener('pointerdown', unlock, { once: true });
    addEventListener('keydown', unlock, { once: true });
    // soft hover tick on desktop for anything interactive
    const canHover = matchMedia('(hover: hover)').matches;
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.('button, a, label[for], [data-sfx]');
      if (el && el !== last && ctx) sfx('tick');
      last = el;
    };
    if (canHover) addEventListener('pointerover', over);
    return () => { listeners.delete(l); removeEventListener('pointerover', over); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
  }, []);
  return (
    <button type="button" className="sound-btn" aria-pressed={on} aria-label={on ? 'Mute sounds' : 'Turn sounds on'}
      onClick={() => { const v = !on; setSound(v); if (v) { unlocked = true; audio(); sfx('select'); } }}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {on
          ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          : <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
