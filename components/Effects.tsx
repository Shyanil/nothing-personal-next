'use client';
import { useEffect, useRef, useState } from 'react';

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** "LOADING DROP 001" boot screen — fades out after ~1.2s or on tap. */
export function Boot() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), reducedMotion() ? 0 : 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={'boot' + (done ? ' done' : '')} aria-hidden="true" onClick={() => setDone(true)}>
      <div className="boot-inner">
        <div className="boot-star" />
        <p className="boot-txt">LOADING DROP 001</p>
        <div className="boot-bar"><i /></div>
      </div>
    </div>
  );
}

/** Fades/slides its child in when scrolled into view. */
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`}>{children}</div>;
}

/** Floating ember particles on a canvas, paused when off-screen. */
export function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const cv = ref.current!, ctx = cv.getContext('2d')!;
    let W = 0, H = 0, raf = 0, visible = true;
    type P = { x: number; y: number; r: number; v: number; s: number; a: number };
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = cv.offsetWidth * d; H = cv.height = cv.offsetHeight * d; };
    const spawn = (y?: number): P => ({ x: Math.random() * W, y: y ?? H + 10, r: Math.random() * 2.2 + 0.6, v: Math.random() * 0.6 + 0.25, s: Math.random() * 2, a: Math.random() * 0.6 + 0.3 });
    size();
    const parts = Array.from({ length: innerWidth < 600 ? 34 : 60 }, () => spawn(Math.random() * H));
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    const frame = (t: number) => {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        ctx.shadowColor = '#ff2a35'; ctx.shadowBlur = 8;
        parts.forEach((p, i) => {
          p.y -= p.v * 2; p.x += Math.sin(t / 900 + p.s * 3) * 0.4;
          if (p.y < -10) parts[i] = spawn();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.6, 0, 7);
          ctx.fillStyle = `rgba(255,${(60 + p.s * 40) | 0},40,${p.a * Math.min(1, p.y / H + 0.2)})`;
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); };
  }, []);
  return <canvas className="embers" ref={ref} aria-hidden="true" />;
}

/** Logo that floats and tilts in 3D with finger / mouse. */
export function TiltLogo() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const logo = ref.current, hero = logo?.closest('.brand') as HTMLElement | null;
    if (!logo || !hero || reducedMotion()) return;
    const tilt = (x: number, y: number) => {
      const r = hero.getBoundingClientRect();
      logo.style.animation = 'none';
      logo.style.transform = `rotateX(${((y - r.top) / r.height - 0.5) * -22}deg) rotateY(${((x - r.left) / r.width - 0.5) * 26}deg)`;
    };
    const reset = () => { logo.style.transform = ''; logo.style.animation = ''; };
    const pm = (e: PointerEvent) => tilt(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => tilt(e.touches[0].clientX, e.touches[0].clientY);
    hero.addEventListener('pointermove', pm);
    hero.addEventListener('pointerleave', reset);
    hero.addEventListener('touchmove', tm, { passive: true });
    hero.addEventListener('touchend', reset);
    return () => {
      hero.removeEventListener('pointermove', pm); hero.removeEventListener('pointerleave', reset);
      hero.removeEventListener('touchmove', tm); hero.removeEventListener('touchend', reset);
    };
  }, []);
  return (
    <div className="logo3d" ref={ref}>
      <img src="/assets/logo.webp" alt="Nothing Personal. I'm Just Correct." width={1000} height={774} fetchPriority="high" />
    </div>
  );
}
