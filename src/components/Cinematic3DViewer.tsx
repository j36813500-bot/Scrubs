import { useEffect, useRef, useState } from 'react';
import type { Product } from '../lib/types';

/**
 * Cinematic 3D Product Viewer
 *
 * Displays product images on a single flat plane that rotates smoothly in 3D space.
 * After each full 360° rotation, crossfades to the next image with a cinematic sweep.
 * Loops through all gallery images infinitely: img1 → img2 → img3 → img1 → ...
 *
 * Rendering approach: a single CSS 3D-transformed plane (no intersecting geometry,
 * no overlapping meshes, no z-fighting). The plane is a flat card with front/back faces.
 */
export default function Cinematic3DViewer({ product, onClose }: { product: Product; onClose: () => void }) {
  const images = (product.gallery_urls?.length ? product.gallery_urls : [product.image_url]).slice(0, 3);

  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const [imgIdx, setImgIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [lit, setLit] = useState(false);

  // Refs for the animation loop (avoids re-renders during 60fps rotation)
  const rotRef = useRef(0);
  const fullRotationsRef = useRef(0);
  const imgIdxRef = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const manualOffset = useRef(0);
  const rafRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  // Enter animation
  useEffect(() => {
    const t1 = setTimeout(() => setLit(true), 100);
    const t2 = setTimeout(() => setPhase('show'), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Close handler
  const handleClose = () => {
    setPhase('exit');
    setTimeout(onClose, 500);
  };

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Main rotation loop — smooth 60fps via requestAnimationFrame
  useEffect(() => {
    let last = performance.now();
    const ROTATION_SPEED = 36; // degrees per second (full 360° in 10 seconds)

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!dragging.current) {
        rotRef.current += ROTATION_SPEED * dt;

        // Detect full 360° completion to advance to next image
        const currentFull = Math.floor(Math.abs(rotRef.current) / 360);
        if (currentFull > fullRotationsRef.current) {
          fullRotationsRef.current = currentFull;
          // Trigger cinematic transition
          setTransitioning(true);
          setTimeout(() => {
            imgIdxRef.current = (imgIdxRef.current + 1) % images.length;
            setImgIdx(imgIdxRef.current);
          }, 350);
          setTimeout(() => {
            setTransitioning(false);
          }, 900);
        }
      }

      // Apply rotation directly to DOM for 60fps (no React re-render)
      if (stageRef.current) {
        const totalRot = rotRef.current + manualOffset.current;
        stageRef.current.style.transform = `rotateY(${totalRot}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images.length]);

  // Drag interaction
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    manualOffset.current += dx * 0.8;
    if (stageRef.current) {
      const totalRot = rotRef.current + manualOffset.current;
      stageRef.current.style.transform = `rotateY(${totalRot}deg)`;
    }
  };

  const onPointerUp = () => {
    dragging.current = false;
    // Fold manual offset back into rotation
    rotRef.current += manualOffset.current;
    manualOffset.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden animate-fade-in"
      style={{
        background: 'rgba(15, 8, 25, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blush-500/15 blur-3xl animate-breathe pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-lavender-500/15 blur-3xl animate-breathe pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-red-500/30 transition-all hover:scale-110"
        aria-label="إغلاق"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Product name */}
      <div className="absolute top-6 right-6 z-10 text-right">
        <div className="text-white/60 text-sm">العرض ثلاثي الأبعاد</div>
        <div className="font-display font-bold text-white text-lg">{product.name_ar}</div>
      </div>

      {/* Stage — single flat plane, no intersecting geometry */}
      <div
        className="relative z-10"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Studio floor reflection */}
        <div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,125,160,0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* The rotating plane — front and back faces only, no intersecting geometry */}
        <div
          ref={stageRef}
          className="relative cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            width: '300px',
            height: '400px',
            transform: 'rotateY(0deg)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-premium"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <img
              src={images[imgIdx]}
              alt={product.name_ar}
              className="w-full h-full object-cover"
              style={{
                opacity: transitioning ? 0 : 1,
                transition: 'opacity 0.35s ease-in-out',
              }}
              draggable={false}
            />
            {/* Studio lighting overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-white/10" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blush-200/10 to-lavender-200/10" />
            {/* Continuous fabric sheen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
                animation: 'shimmerSweep 4s ease-in-out infinite',
              }}
            />
            {/* Cinematic transition sweep */}
            {transitioning && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'cinematicSweep 0.9s ease-out forwards',
                }}
              />
            )}
          </div>

          {/* Back face — shows the next image during rotation for seamless visual */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-premium"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <img
              src={images[(imgIdx + 1) % images.length]}
              alt=""
              className="w-full h-full object-cover scale-x-[-1]"
              draggable={false}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-white/10" />
          </div>
        </div>

        {/* Image indicator dots */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: i === imgIdx ? '24px' : '8px',
                background: i === imgIdx ? '#ff7da0' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm flex items-center gap-2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        اسحب للتدوير
      </div>
    </div>
  );
}
