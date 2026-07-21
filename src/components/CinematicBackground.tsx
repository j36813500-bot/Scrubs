import { useEffect, useRef } from 'react';

// Animated premium background: soft floating orbs + particles, GPU-accelerated.
// Pure CSS/canvas, no heavy 3D libs — keeps 60fps on mobile.
export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.5 ? 330 : 270,
      a: Math.random() * 0.5 + 0.2,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 80%, ${p.a})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 80%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blush-50 via-lavender-50 to-beige-50" />
      {/* large floating orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blush-200/30 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -left-40 w-[450px] h-[450px] rounded-full bg-lavender-200/30 blur-3xl animate-float-medium" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-100/40 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-blush-100/40 blur-3xl animate-breathe" />
      {/* particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
