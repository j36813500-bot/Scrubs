import { useEffect, useRef, useState } from 'react';
import type { Product } from '../lib/types';

// Full-screen cinematic 3D scrub viewer.
// Background blurs + darkens, the scrub appears on a rotating mannequin
// under studio lighting with endless seamless 360° rotation.
export default function Cinematic3DViewer({ product, onClose }: { product: Product; onClose: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [lit, setLit] = useState(false);
  const rafRef = useRef(0);
  const rotRef = useRef(0);
  const zoomRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const manualOffset = useRef(0);

  // Entrance / exit animation phases
  useEffect(() => {
    const t1 = setTimeout(() => setLit(true), 50);
    const t2 = setTimeout(() => setPhase('show'), 600);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  // Endless seamless rotation via requestAnimationFrame — no restart, no loop seam.
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!dragging.current) {
        // continuous rotation: 12 degrees per second
        rotRef.current += 12 * dt;
      }
      setRotation(rotRef.current);
      setZoom(zoomRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClose = () => {
    setPhase('exit');
    setTimeout(onClose, 500);
  };

  // Pointer drag to manually rotate
  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    rotRef.current += dx * 0.4;
    manualOffset.current = dx;
  };
  const onUp = () => { dragging.current = false; };

  // Wheel / pinch zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(0.7, Math.min(2.2, zoomRef.current - e.deltaY * 0.001));
  };

  // Touch pinch
  const pinchDist = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.hypot(dx, dy);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      const delta = d - pinchDist.current;
      pinchDist.current = d;
      zoomRef.current = Math.max(0.7, Math.min(2.2, zoomRef.current + delta * 0.003));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-all duration-700 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: phase === 'enter' ? 'rgba(0,0,0,0)' : 'rgba(20,10,30,0.92)',
        backdropFilter: phase === 'show' ? 'blur(30px)' : 'blur(0px)',
      }}
    >
      {/* ambient stage glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${lit ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(247,168,198,0.15) 0%, rgba(192,166,226,0.08) 40%, transparent 70%)',
        }}
      />

      {/* studio light beams */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-2/3 transition-opacity duration-1000 ${lit ? 'opacity-40' : 'opacity-0'}`} style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)', filter: 'blur(40px)' }} />

      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-float-slow"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* 3D stage */}
      <div
        ref={stageRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none gpu"
        style={{ touchAction: 'none' }}
      >
        {/* rotating rings */}
        <div className="absolute w-[420px] h-[420px] max-w-[80vw] max-h-[80vw] rounded-full border border-dashed border-white/10 animate-spin-slower pointer-events-none" />
        <div className="absolute w-[340px] h-[340px] max-w-[65vw] max-h-[65vw] rounded-full border border-white/5 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />

        {/* platform shadow */}
        <div
          className="absolute rounded-full bg-black/40 blur-2xl transition-all duration-700"
          style={{
            width: `${200 * zoom}px`,
            height: `${30 * zoom}px`,
            bottom: '22%',
            opacity: lit ? 0.6 : 0,
          }}
        />

        {/* mannequin + scrub */}
        <div
          className="relative preserve-3d gpu"
          style={{
            transform: `rotateY(${rotation}deg) scale(${zoom})`,
            transition: dragging.current ? 'none' : 'transform 0.05s linear',
            opacity: lit ? 1 : 0,
            transformOrigin: 'center center',
          }}
        >
          {/* glow behind */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blush-300/30 to-lavender-300/30 blur-3xl scale-125" />

          {/* back face */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden shadow-premium" style={{ transform: 'rotateY(180deg)', width: '280px', height: '380px' }}>
            <img src={product.image_url} alt="" className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* front face */}
          <div className="relative rounded-3xl overflow-hidden backface-hidden shadow-premium" style={{ width: '280px', height: '380px' }}>
            <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover" />
            {/* studio lighting overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/15" />
            <div className="absolute inset-0 bg-gradient-to-br from-blush-200/10 to-lavender-200/10" />
            {/* fabric sheen sweep */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)',
                animation: 'shimmerSweep 4s ease-in-out infinite',
              }}
            />
          </div>

          {/* floating info chips */}
          <div className="absolute -top-5 -right-8 glass rounded-2xl px-3 py-2 text-xs font-bold text-white animate-float-fast whitespace-nowrap">
            {product.collection_ar || 'يونيفورم فاخر'}
          </div>
          <div className="absolute -bottom-5 -left-8 glass rounded-2xl px-3 py-2 text-xs font-bold text-white animate-float-medium whitespace-nowrap" style={{ animationDelay: '1s' }}>
            {product.price} ج.م
          </div>
        </div>
      </div>

      {/* top bar */}
      <div className={`absolute top-0 inset-x-0 p-4 flex items-center justify-between transition-all duration-700 ${phase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="glass rounded-full px-5 py-2.5">
          <div className="font-display font-bold text-white text-sm">{product.name_ar}</div>
        </div>
        <button
          onClick={handleClose}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:scale-110 hover:bg-red-500/40 transition-all"
          aria-label="إغلاق"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      {/* bottom controls */}
      <div className={`absolute bottom-6 inset-x-0 flex flex-col items-center gap-3 transition-all duration-700 ${phase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="glass rounded-full px-4 py-2 text-xs font-semibold text-white/80">
          اسحب للتدوير • مرر للتكبير • 360°
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { zoomRef.current = Math.max(0.7, zoomRef.current - 0.15); }}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>
          </button>
          <button
            onClick={() => { zoomRef.current = 1; rotRef.current = 0; }}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>
          </button>
          <button
            onClick={() => { zoomRef.current = Math.min(2.2, zoomRef.current + 0.15); }}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmerSweep {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
