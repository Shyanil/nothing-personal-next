'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IMAGES } from '@/lib/shop';
import Lightbox from './Lightbox';
import { sfx } from './Sound';

/** App-style product gallery: full-bleed swipe on phones, thumbnails + arrows on desktop, tap to zoom. */
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoomAt, setZoomAt] = useState<number | null>(null);

  useEffect(() => {
    const el = track.current!;
    let raf = 0, lastIdx = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== lastIdx) { lastIdx = i; setActive(i); sfx('swipe'); }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const go = (i: number) => {
    const el = track.current!;
    const n = (i + IMAGES.length) % IMAGES.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };

  const open = (i: number) => { sfx('zoom'); setZoomAt(i); };

  return (
    <div className="gallery">
      <div className="stage">
        <div className="track" ref={track}>
          {IMAGES.map((im, i) => (
            <button key={im.src} type="button" className="shot" onClick={() => open(i)} aria-label={`Zoom photo ${i + 1}: ${im.tag.toLowerCase()}`}>
              <img className="shot-bg" src={im.src} alt="" aria-hidden="true" loading={i ? 'lazy' : 'eager'} />
              <img className="shot-img" src={im.src} alt={im.alt} width={im.w} height={im.h}
                loading={i ? 'lazy' : 'eager'} fetchPriority={i ? 'auto' : 'high'} draggable={false} />
            </button>
          ))}
        </div>

        <div className="hud-corner tl" /><div className="hud-corner tr" /><div className="hud-corner bl" /><div className="hud-corner br" />
        <span className="shot-tag">{IMAGES[active].tag}</span>
        <span className="shot-count">{String(active + 1).padStart(2, '0')}<i>/</i>{String(IMAGES.length).padStart(2, '0')}</span>
        <button type="button" className="zoom-chip" onClick={() => open(active)}>
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.2" fill="none" /><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          TAP TO ZOOM
        </button>
        <button type="button" className="nav prev" aria-label="Previous photo" onClick={() => go(active - 1)}>‹</button>
        <button type="button" className="nav next" aria-label="Next photo" onClick={() => go(active + 1)}>›</button>
        <div className="dots" aria-hidden="true">{IMAGES.map((im, i) => <i key={im.src} className={i === active ? 'on' : ''} />)}</div>
      </div>

      <div className="thumbs" role="tablist" aria-label="Product photos">
        {IMAGES.map((im, i) => (
          <button key={im.src} type="button" role="tab" aria-selected={i === active} className={'thumb' + (i === active ? ' on' : '')}
            onClick={() => { go(i); sfx('select'); }} aria-label={im.tag}>
            <img src={im.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {zoomAt !== null && createPortal(
        <Lightbox start={zoomAt} onClose={i => { setZoomAt(null); go(i); sfx('close'); }} />,
        document.body,
      )}
    </div>
  );
}
