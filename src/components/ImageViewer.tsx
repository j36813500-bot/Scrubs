import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

interface ImageViewerProps {
  product: {
    name_ar: string
    gallery_urls?: string[]
    image_url?: string | null
  }
  onClose: () => void
}

export default function ImageViewer({ product, onClose }: ImageViewerProps) {
  const images: string[] = useMemo(() => {
    const urls = product.gallery_urls?.length ? product.gallery_urls : [product.image_url].filter(Boolean) as string[]
    return urls.length ? urls : [product.image_url || '']
  }, [product.gallery_urls, product.image_url])

  const [currentIndex, setCurrentIndex] = useState(0)
  const rotationRef = useRef(0)
  const [rotation, setRotation] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const phaseRef = useRef<'rotating' | 'transitioning'>('rotating')
  const rotationSpeed = 36
  const rotationDuration = 10000
  const transitionDuration = 500

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time
    const delta = time - lastTimeRef.current
    lastTimeRef.current = time

    if (phaseRef.current === 'transitioning') {
      setCurrentIndex(prev => (prev + 1) % images.length)
      rotationRef.current = 0
      setRotation(0)
      phaseRef.current = 'rotating'
      lastTimeRef.current = 0
      rafRef.current = requestAnimationFrame(animate)
      return
    }

    rotationRef.current += (rotationSpeed * delta) / 1000
    setRotation(rotationRef.current)

    if (rotationRef.current >= 360) {
      phaseRef.current = 'transitioning'
      setIsTransitioning(true)
      setTimeout(() => {
        setIsTransitioning(false)
      }, transitionDuration)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [images.length])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 left-0 text-white/80 hover:text-white transition-colors text-lg font-bold z-10">
          إغلاق ✕
        </button>
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {images.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: i === currentIndex ? (isTransitioning ? 0.3 : 1) : 0,
                transform: `rotate(${i === currentIndex ? rotation : 0}deg)`,
                transition: isTransitioning ? 'opacity 0.5s ease' : 'none',
              }}
            >
              <img src={img} alt={product.name_ar} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
        <div className="text-center mt-4 text-white/60 text-sm">
          عرض ثلاثي الأبعاد — {product.name_ar}
        </div>
      </div>
    </div>
  )
}
