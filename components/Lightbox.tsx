'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IMAGES } from '@/lib/shop';
import { sfx } from './Sound';

type View = { s: number; x: number; y: number };
const MAX = 4;

/**
 * Full-screen image viewer.
 * Phone: pinch to zoom, drag to pan, double-tap to zoom, swipe to change photo.
 * Desktop: scroll / double-click to zoom, drag to pan, arrow keys, Esc to close.
 */
export default function Lightbox({ start, onClose }: { start: number; onClose: (i: number) => void }) {
  const [idx, setIdx] = useState(start);
  const [v, setV] = useState<View>({ s: 1, x: 0, y: 0 });
  const [anim, setAnim] = useState(true);
  const [swipe, setSwipe] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({ startDist: 0, startS: 1, startV: { s: 1, x: 0, y: 0 } as View, startX: 0, startY: 0, moved: false, lastTap: 0 });
  const vRef = useRef(v); vRef.current = v;

  const clamp = useCallback((n: View): View => {
    const el = box.current;
    const s = Math.min(MAX, Math.max(1, n.s));
    if (!el || s === 1) return { s: 1, x: 0, y: 0 };
    const mx = (el.clientWidth * (s - 1)) / 2, my = (el.clientHeight * (s - 1)) / 2;
    return { s, x: Math.max(-mx, Math.min(mx, n.x)), y: Math.max(-my, Math.min(my, n.y)) };
  }, []);

  /** zoom to scale s keeping screen point (cx, cy) fixed */
  const zoomAt = useCallback((s: number, cx: number, cy: number, base = vRef.current) => {
    const el = box.current!;
    const r = el.getBoundingClientRect();
    const px = cx - r.left - r.width / 2, py = cy - r.top - r.height / 2;
    const k = s / base.s;
    return clamp({ s, x: px - (px - base.x) * k, y: py - (py - base.y) * k });
  }, [clamp]);

  const change = useCallback((d: number) => {
    setIdx(i => (i + d + IMAGES.length) % IMAGES.length);
    setV({ s: 1, x: 0, y: 0 });
    sfx('swipe');
  }, []);

  const closeRef = useRef(() => onClose(idx));
  closeRef.current = () => onClose(idx);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'ArrowRight') change(1);
      if (e.key === 'ArrowLeft') change(-1);
    };
    addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', key); };
  }, [change]);

  // preload neighbours at full resolution
  useEffect(() => {
    [1, -1].forEach(d => { const im = new Image(); im.src = IMAGES[(idx + d + IMAGES.length) % IMAGES.length].full; });
  }, [idx]);

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const G = g.current;
    setAnim(false);
    G.startV = vRef.current; G.startX = e.clientX; G.startY = e.clientY; G.moved = false;
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      G.startDist = Math.hypot(a.x - b.x, a.y - b.y); G.startS = vRef.current.s;
    }
  };

  const move = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const G = g.current;
    const dx = e.clientX - G.startX, dy = e.clientY - G.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) G.moved = true;
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setV(zoomAt(G.startS * (dist / G.startDist), (a.x + b.x) / 2, (a.y + b.y) / 2, G.startV));
    } else if (vRef.current.s > 1) {
      setV(clamp({ ...G.startV, x: G.startV.x + dx, y: G.startV.y + dy }));
    } else {
      setSwipe(dx);
    }
  };

  const up = (e: React.PointerEvent) => {
    pts.current.delete(e.pointerId);
    const G = g.current;
    setAnim(true);
    if (pts.current.size > 0) { // one finger lifted from a pinch: re-base the remaining one
      const [p] = [...pts.current.values()];
      G.startV = vRef.current; G.startX = p.x; G.startY = p.y;
      return;
    }
    if (vRef.current.s === 1 && Math.abs(swipe) > 60) { change(swipe < 0 ? 1 : -1); setSwipe(0); return; }
    setSwipe(0);
    if (!G.moved) {
      const now = Date.now();
      if (now - G.lastTap < 300) { // double tap
        sfx('zoom');
        setV(vRef.current.s > 1 ? { s: 1, x: 0, y: 0 } : zoomAt(2.5, e.clientX, e.clientY));
        G.lastTap = 0;
      } else G.lastTap = now;
    }
  };

  const wheel = (e: React.WheelEvent) => {
    setAnim(false);
    setV(zoomAt(vRef.current.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY));
  };

  const im = IMAGES[idx];
  const zoomBy = (k: number) => { sfx('zoom'); const r = box.current!.getBoundingClientRect(); setV(zoomAt(vRef.current.s * k, r.left + r.width / 2, r.top + r.height / 2)); };

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="lb-top">
        <span className="lb-count">{im.tag} · {idx + 1}/{IMAGES.length}</span>
        <button type="button" className="lb-btn" onClick={() => onClose(idx)} aria-label="Close viewer" autoFocus>✕</button>
      </div>

      <div className="lb-stage" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}>
        <img
          key={im.full} src={im.full} alt={im.alt} draggable={false}
          style={{
            transform: `translate(${v.x + (v.s === 1 ? swipe : 0)}px, ${v.y}px) scale(${v.s})`,
            transition: anim ? 'transform .25s cubic-bezier(.2,.8,.2,1)' : 'none',
            cursor: v.s > 1 ? 'grab' : 'zoom-in',
          }}
        />
      </div>

      <button type="button" className="lb-nav prev" onClick={() => change(-1)} aria-label="Previous photo">‹</button>
      <button type="button" className="lb-nav next" onClick={() => change(1)} aria-label="Next photo">›</button>

      <div className="lb-bottom">
        <div className="lb-zoom">
          <button type="button" className="lb-btn" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out" disabled={v.s <= 1}>−</button>
          <span>{Math.round(v.s * 100)}%</span>
          <button type="button" className="lb-btn" onClick={() => zoomBy(1.5)} aria-label="Zoom in" disabled={v.s >= MAX}>+</button>
        </div>
        <div className="lb-thumbs">
          {IMAGES.map((t, i) => (
            <button key={t.src} type="button" className={'thumb' + (i === idx ? ' on' : '')} onClick={() => { setIdx(i); setV({ s: 1, x: 0, y: 0 }); sfx('select'); }} aria-label={t.tag}>
              <img src={t.src} alt="" />
            </button>
          ))}
        </div>
        <p className="lb-hint">Pinch or double-tap to zoom · swipe for more</p>
      </div>
    </div>
  );
}
