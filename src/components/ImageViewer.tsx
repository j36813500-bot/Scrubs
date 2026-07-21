import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/* ============================================================
 * ImageViewer — premium product image viewer (RTL, Arabic)
 * ------------------------------------------------------------
 * Modal overlay (NOT fullscreen). The product image is shown in a
 * centered card at its natural 3:4 portrait aspect ratio over a dark
 * backdrop. An automatic cinematic rotation sequence plays on loop:
 *
 *   Image 1 → 360° rotateY → crossfade → Image 2 → 360° → crossfade
 *   → Image 3 → 360° → crossfade → Image 1 → ... (infinite)
 *
 * Rotation is driven by requestAnimationFrame and applied directly to
 * the DOM via refs (no React re-renders during animation). Users can
 * also drag horizontally to manually rotate.
 * ============================================================ */

export type ImageViewerProduct = {
  name_ar: string;
  gallery_urls: string[];
  image_url: string;
};

type ImageViewerProps = {
  product: ImageViewerProduct;
  onClose: () => void;
};

/* ---- tuning constants -------------------------------------------------- */

const ROTATION_DEG_PER_SEC = 36; // 36°/s → full 360° in 10s
const FULL_ROTATION_DEG = 360;
const TRANSITION_MS = 500; // cinematic crossfade duration

/* ---- component --------------------------------------------------------- */

export default function ImageViewer({ product, onClose }: ImageViewerProps) {
  // Resolve the image list: first 3 of gallery_urls, fall back to image_url.
  const images = useMemo<string[]>(() => {
    const fromGallery = (product.gallery_urls || []).slice(0, 3);
    const list = fromGallery.length > 0 ? fromGallery : [product.image_url];
    return list;
  }, [product.gallery_urls, product.image_url]);

  const imageCount = images.length;

  /* ----- DOM refs (no re-render during animation) ----- */
  const frontRef = useRef<HTMLDivElement>(null); // visible plane
  const backRef = useRef<HTMLDivElement>(null); // preloaded next plane (for crossfade)
  const frontImgRef = useRef<HTMLImageElement>(null);
  const backImgRef = useRef<HTMLImageElement>(null);

  /* ----- animation state (mutable, in refs) ----- */
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0); // current rotateY in degrees
  const phaseRef = useRef<'rotating' | 'transitioning'>('rotating');
  const transitionStartRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0); // index currently rotating
  const nextIndexRef = useRef<number>(1); // index to crossfade to
  const userControlledRef = useRef<boolean>(false);
  const userControlTimeoutRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startAngle: number;
  }>({ active: false, startX: 0, startAngle: 0 });

  /* ----- React state (only for UI chrome: dots, product name) ----- */
  const [activeIndex, setActiveIndex] = useState(0);
  const [frontSrc, setFrontSrc] = useState(images[0]);
  const [backSrc, setBackSrc] = useState(images[1 % imageCount]);
  const [backVisible, setBackVisible] = useState(false); // toggles back plane opacity

  /* --------------------------------------------------------------------
   * Apply the current angle to whichever plane is "active".
   * During transition, front fades out while back (at full angle) fades in.
   * -------------------------------------------------------------------- */
  const applyTransform = useCallback(() => {
    const angle = angleRef.current;
    if (frontRef.current) {
      frontRef.current.style.transform = `rotateY(${angle}deg)`;
    }
    // The back plane holds the NEXT image; it stays at the natural angle
    // (0°) so when it fades in it reads as a fresh, un-rotated frame.
    if (backRef.current) {
      backRef.current.style.transform = `rotateY(${angle}deg)`;
    }
  }, []);

  /* --------------------------------------------------------------------
   * Main animation loop. Two phases:
   *  - rotating: accumulate angle at ROTATION_DEG_PER_SEC. When a full
   *    360° is completed, switch to 'transitioning'.
   *  - transitioning: 0.5s crossfade. When done, swap sources and resume
   *    rotating from 0° on the new image.
   * -------------------------------------------------------------------- */
  const tick = useCallback(
    (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      if (userControlledRef.current) {
        // While the user drags, we don't auto-advance; just keep applying.
        applyTransform();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (phaseRef.current === 'rotating') {
        angleRef.current += ROTATION_DEG_PER_SEC * dt;

        if (angleRef.current >= FULL_ROTATION_DEG) {
          // Clamp to exactly 360 for a clean visual, then begin transition.
          angleRef.current = FULL_ROTATION_DEG;
          applyTransform();

          phaseRef.current = 'transitioning';
          transitionStartRef.current = ts;
          // Reveal the back plane (next image) to begin crossfade.
          setBackVisible(true);
        } else {
          applyTransform();
        }
      } else {
        // transitioning
        const elapsed = ts - transitionStartRef.current;
        const progress = Math.min(elapsed / TRANSITION_MS, 1);

        // Front opacity: 1 → 0, Back opacity: 0 → 1 (eased)
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        if (frontRef.current) frontRef.current.style.opacity = String(1 - eased);
        if (backRef.current) backRef.current.style.opacity = String(eased);

        if (progress >= 1) {
          // Finish transition: promote back → front, reset angle, continue.
          const newIdx = nextIndexRef.current;
          currentIndexRef.current = newIdx;
          nextIndexRef.current = (newIdx + 1) % imageCount;
          angleRef.current = 0;
          phaseRef.current = 'rotating';

          // Swap React state so front now shows the new image at full opacity.
          setFrontSrc(images[newIdx]);
          setBackSrc(images[nextIndexRef.current]);
          setBackVisible(false);
          setActiveIndex(newIdx);

          // Reset inline opacity; the new front is fully opaque.
          if (frontRef.current) frontRef.current.style.opacity = '1';
          if (backRef.current) backRef.current.style.opacity = '0';
          applyTransform();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [applyTransform, imageCount, images],
  );

  /* --------------------------------------------------------------------
   * Pointer drag-to-rotate. Horizontal drag maps to rotateY degrees.
   * While dragging, auto-rotation is paused; it resumes after a short
   * idle window once the user releases.
   * -------------------------------------------------------------------- */
  const resumeAutoAfterIdle = useCallback(() => {
    if (userControlTimeoutRef.current) {
      clearTimeout(userControlTimeoutRef.current);
    }
    userControlTimeoutRef.current = window.setTimeout(() => {
      // Snap angle back into [0, 360) and resume auto-rotation cleanly.
      angleRef.current = ((angleRef.current % FULL_ROTATION_DEG) + FULL_ROTATION_DEG) % FULL_ROTATION_DEG;
      userControlledRef.current = false;
    }, 1500);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    userControlledRef.current = true;
    phaseRef.current = 'rotating'; // cancel any in-flight transition
    if (backVisible) setBackVisible(false);
    if (frontRef.current) frontRef.current.style.opacity = '1';
    if (backRef.current) backRef.current.style.opacity = '0';

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startAngle: angleRef.current,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [backVisible]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    // 1px ≈ 0.4° — feels responsive without being twitchy.
    angleRef.current = dragStateRef.current.startAngle + dx * 0.4;
    applyTransform();
    resumeAutoAfterIdle();
  }, [applyTransform, resumeAutoAfterIdle]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    resumeAutoAfterIdle();
  }, [resumeAutoAfterIdle]);

  /* --------------------------------------------------------------------
   * Lifecycle: start RAF loop, lock body scroll, ESC to close.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (userControlTimeoutRef.current) clearTimeout(userControlTimeoutRef.current);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [tick, onClose]);

  /* --------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------- */
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(15, 8, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      {/* ---- Ambient glow orbs ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 360,
            height: 360,
            left: '12%',
            top: '18%',
            background: 'radial-gradient(circle, rgba(255,170,190,0.30) 0%, rgba(255,170,190,0) 70%)',
            filter: 'blur(40px)',
            animation: 'ivFloat1 9s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 420,
            height: 420,
            right: '8%',
            bottom: '12%',
            background: 'radial-gradient(circle, rgba(196,170,255,0.28) 0%, rgba(196,170,255,0) 70%)',
            filter: 'blur(50px)',
            animation: 'ivFloat2 11s ease-in-out infinite',
          }}
        />
      </div>

      {/* ---- Card (stopPropagation so backdrop click doesn't close) ---- */}
      <div
        className="relative"
        style={{ width: '100%', maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top-left */}
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute -top-3 left-0 z-30 flex h-11 w-11 -translate-y-full items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 transition hover:scale-105 hover:bg-black/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/70"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Product name — top-right */}
        <div
          className="absolute -top-3 right-0 z-30 max-w-[70%] -translate-y-full"
          style={{ direction: 'rtl' }}
        >
          <span
            className="block truncate text-right font-arabic text-sm font-medium tracking-wide text-white/85"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            title={product.name_ar}
          >
            {product.name_ar}
          </span>
        </div>

        {/* ---- The 3:4 image card ---- */}
        <div
          className="relative w-full overflow-hidden rounded-3xl shadow-premium"
          style={{
            aspectRatio: '3 / 4',
            background: 'linear-gradient(160deg, #1a1030 0%, #0f0819 100%)',
            perspective: '1200px',
          }}
        >
          {/* Back plane (next image) — sits behind, fades in during transition */}
          <div
            ref={backRef}
            className="absolute inset-0"
            style={{
              opacity: backVisible ? undefined : 0,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform, opacity',
              transition: 'opacity 80ms linear',
            }}
          >
            <img
              ref={backImgRef}
              src={backSrc}
              alt={product.name_ar}
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ backfaceVisibility: 'hidden' }}
            />
            {/* Light sweep overlay (cinematic transition) */}
            <div className="ivSweep pointer-events-none absolute inset-0" />
            {/* Studio lighting overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 38%, rgba(255,255,255,0.08) 100%)',
              }}
            />
            {/* Continuous fabric sheen */}
            <div className="ivShimmer pointer-events-none absolute inset-0" />
          </div>

          {/* Front plane (current image) — receives pointer events for drag */}
          <div
            ref={frontRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform, opacity',
              touchAction: 'none',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              ref={frontImgRef}
              src={frontSrc}
              alt={product.name_ar}
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ backfaceVisibility: 'hidden' }}
            />
            {/* Studio lighting overlay (gradient: bottom dark → top light) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 38%, rgba(255,255,255,0.08) 100%)',
              }}
            />
            {/* Continuous fabric sheen */}
            <div className="ivShimmer pointer-events-none absolute inset-0" />
          </div>

          {/* Edge vignette to seat the card in the backdrop */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.35)' }}
          />
        </div>

        {/* ---- Indicator dots ---- */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className="block h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === activeIndex ? 28 : 8,
                background:
                  i === activeIndex
                    ? 'linear-gradient(90deg, #ec4899, #f9a8d4)'
                    : 'rgba(255,255,255,0.28)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ---- Keyframes (scoped via a one-off style block) ---- */}
      <style>{`
        @keyframes ivFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.08); }
        }
        @keyframes ivFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 25px) scale(1.12); }
        }
        @keyframes ivShimmerSweep {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          18% { opacity: 0.55; }
          50% { opacity: 0.7; }
          82% { opacity: 0.55; }
          100% { transform: translateX(120%) skewX(-18deg); opacity: 0; }
        }
        @keyframes ivLightSweep {
          0% { transform: translateX(-130%) skewX(-20deg); opacity: 0; }
          50% { opacity: 0.85; }
          100% { transform: translateX(130%) skewX(-20deg); opacity: 0; }
        }
        .ivShimmer {
          background: linear-gradient(
            100deg,
            transparent 30%,
            rgba(255, 255, 255, 0.14) 48%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(255, 255, 255, 0.14) 52%,
            transparent 70%
          );
          background-size: 220% 100%;
          animation: ivShimmerSweep 4.5s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .ivSweep {
          background: linear-gradient(
            100deg,
            transparent 38%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 62%
          );
          background-size: 300% 100%;
          animation: ivLightSweep 0.5s ease-out;
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
}
