import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  onClick?: () => void
  color?: string
}

export default function StatCard({
  title,
  value,
  icon,
  onClick,
  color,
}: StatCardProps) {
  const accent = color || '#e85c8a'

  return (
    <div
      onClick={onClick}
      className={`glass-card group relative overflow-hidden p-6 transition-all duration-500 ${
        onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-glow' : ''
      } animate-fade-in-up`}
    >
      {/* Dynamic lighting glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: accent }}
      />

      {/* Animated glowing border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl animate-glow"
        style={{
          boxShadow: `inset 0 0 0 1px ${accent}33, 0 0 20px ${accent}22`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-600 mb-2">{title}</p>
          <p
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: accent }}
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl glass animate-float-medium"
          style={{ color: accent }}
        >
          {icon}
        </div>
      </div>

      {/* Bottom shimmer line */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-right scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
    </div>
  )
}
