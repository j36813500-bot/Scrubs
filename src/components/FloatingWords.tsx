interface FloatingWordsProps {
  words: string[]
}

interface WordConfig {
  text: string
  top: string
  left: string
  size: string
  delay: string
  duration: string
  rotate: string
  color: string
}

const palette = [
  '#e85c8a',
  '#916dba',
  '#f59e0b',
  '#cba878',
  '#d63d6e',
  '#7a55a3',
]

const positions: { top: string; left: string; rotate: string }[] = [
  { top: '5%', left: '50%', rotate: '-8deg' },
  { top: '12%', left: '78%', rotate: '6deg' },
  { top: '30%', left: '90%', rotate: '-4deg' },
  { top: '50%', left: '92%', rotate: '10deg' },
  { top: '70%', left: '85%', rotate: '-6deg' },
  { top: '88%', left: '70%', rotate: '8deg' },
  { top: '92%', left: '42%', rotate: '-10deg' },
  { top: '85%', left: '15%', rotate: '4deg' },
  { top: '65%', left: '5%', rotate: '-8deg' },
  { top: '42%', left: '2%', rotate: '6deg' },
  { top: '22%', left: '12%', rotate: '-4deg' },
  { top: '8%', left: '28%', rotate: '10deg' },
]

const sizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl']
const durations = ['7s', '9s', '8s', '10s', '6.5s']

export default function FloatingWords({ words }: FloatingWordsProps) {
  if (!words || words.length === 0) return null

  const configs: WordConfig[] = words.map((text, i) => {
    const pos = positions[i % positions.length]
    return {
      text,
      top: pos.top,
      left: pos.left,
      size: sizes[i % sizes.length],
      delay: `${(i % 6) * 1.2}s`,
      duration: durations[i % durations.length],
      rotate: pos.rotate,
      color: palette[i % palette.length],
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Central circle */}
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-blush-300/40 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border border-lavender-300/30" />
        <div className="absolute inset-8 rounded-full glass shadow-glow animate-breathe" />
        <div className="relative z-10 text-center">
          <div className="text-4xl font-extrabold premium-gradient-text">اسكربك</div>
          <div className="text-xs text-gray-500 mt-1">أناقة طبية</div>
        </div>
      </div>

      {/* Floating words */}
      {configs.map((w, i) => (
        <span
          key={i}
          className="absolute font-extrabold animate-float-words whitespace-nowrap select-none"
          style={{
            top: w.top,
            left: w.left,
            transform: `translate(-50%, -50%) rotate(${w.rotate})`,
            animationDelay: w.delay,
            animationDuration: w.duration,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
            color: w.color,
            opacity: 0,
            textShadow: `0 2px 12px ${w.color}33`,
          }}
        >
          <span className={w.size}>{w.text}</span>
        </span>
      ))}
    </div>
  )
}
