"use client";

import { useEffect, useRef } from "react";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  teal: boolean;
}

/** Signal-lattice canvas: 30fps-capped, pauses off-viewport & on hidden tabs. */
export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let parts: P[] = [];
    let raf = 0;
    let last = 0;
    const FRAME_MS = 1000 / 30;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const LINK_R = 120;
    const LINK_R2 = LINK_R * LINK_R;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(56, Math.floor((w * h) / 26000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.5 + 0.5,
        teal: Math.random() > 0.78,
      }));
    };

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (document.hidden) return;
      if (t - last < FRAME_MS) return;
      last = t;
      // hero-only mask: skip paint once the canvas is fully scrolled past
      if (window.scrollY > h * 1.6) return;

      ctx.clearRect(0, 0, w, h);
      const n = parts.length;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
      for (let i = 0; i < n; i++) {
        const a = parts[i];
        for (let j = i + 1; j < n; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_R2) {
            const alpha = (1 - Math.sqrt(d2) / LINK_R) * 0.15;
            if (alpha < 0.015) continue;
            ctx.strokeStyle = a.teal || b.teal
              ? `rgba(60,232,194,${alpha})`
              : `rgba(180,255,58,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of parts) {
        ctx.fillStyle = p.teal ? "rgba(60,232,194,0.55)" : "rgba(180,255,58,0.45)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    };

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      style={{ maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)" }}
    />
  );
}
