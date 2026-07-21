import { useRouter } from '../lib/router';

// ============================================================================
// AboutPage — Premium Arabic (RTL) "About Us" page for اسكربك
// Palette: blush (pink) · lavender (purple) · beige (neutral) · gold (accent)
// Effects: glass morphism, ambient glow orbs, premium gradient text, float
// ============================================================================

// ----------------------------------------------------------------------------
// Inline SVG icons (lucide-react style, stroke-based, 24x24 viewBox)
// ----------------------------------------------------------------------------
type IconProps = { className?: string };

function ShieldIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function SparklesIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
      <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />
    </svg>
  );
}

function HeadsetIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11v-1a9 9 0 0 1 18 0v1" />
      <path d="M21 16a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3z" />
      <path d="M3 16a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3z" />
      <path d="M18 18a4 4 0 0 1-4 3h-2" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function ClockIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UsersIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BoxIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function StarIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Ambient glow orbs — blurred, animated background accents
// ----------------------------------------------------------------------------
function GlowOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="animate-float-medium absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)' }}
      />
      <div
        className="animate-float-medium absolute top-1/3 -left-32 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 70%)', animationDelay: '1.2s' }}
      />
      <div
        className="animate-float-medium absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)', animationDelay: '2.1s' }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Static content
// ----------------------------------------------------------------------------
type Value = {
  icon: (props: IconProps) => JSX.Element;
  title: string;
  description: string;
};

const VALUES: Value[] = [
  {
    icon: ShieldIcon,
    title: 'الجودة',
    description: 'نختار أجود الأقمشة عالمياً ونخضعها لمعايير صارمة لتدوم طويلاً وتتحمل الحركة اليومية.',
  },
  {
    icon: HeartIcon,
    title: 'الراحة',
    description: 'تصاميم مدروسة بقصات مريحة وخامات ناعمة تمنحك حرية الحركة طوال ساعات العمل الطويلة.',
  },
  {
    icon: SparklesIcon,
    title: 'الأناقة',
    description: 'ألوان راقية وتفاصيل عصرية تعكس شخصيتك المهنية وتمنحك إطلالة واثقة في المستشفى والعيادة.',
  },
  {
    icon: HeadsetIcon,
    title: 'خدمة العملاء',
    description: 'فريق متخصص يرافقك من اختيار المقاس حتى ما بعد الشراء، لضمان تجربة شراء لا تُنسى.',
  },
];

type Stat = {
  icon: (props: IconProps) => JSX.Element;
  value: string;
  label: string;
};

const STATS: Stat[] = [
  { icon: ClockIcon, value: '+٥', label: 'سنوات الخبرة' },
  { icon: UsersIcon, value: '+١٠٬٠٠٠', label: 'عميل سعيد' },
  { icon: BoxIcon, value: '+٥٠', label: 'منتج' },
  { icon: StarIcon, value: '٤٫٩', label: 'تقييم' },
];

// ----------------------------------------------------------------------------
// Value card (glass)
// ----------------------------------------------------------------------------
function ValueCard({ value, index }: { value: Value; index: number }) {
  const Icon = value.icon;
  return (
    <div
      className="glass-card group flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-glow sm:p-8"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-200 to-lavender-200 text-blush-700 transition-all duration-500 group-hover:scale-110 group-hover:from-blush-300 group-hover:to-lavender-300">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="text-lg font-bold text-beige-800">{value.title}</h3>
      <p className="text-sm leading-relaxed text-beige-600">{value.description}</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Stat card (glass)
// ----------------------------------------------------------------------------
function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const Icon = stat.icon;
  return (
    <div
      className="glass-card group flex flex-col items-center gap-2 rounded-3xl p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-glow"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-200 to-blush-200 text-gold-600 transition-transform duration-500 group-hover:scale-110">
        <Icon className="h-7 w-7" />
      </span>
      <span className="premium-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
        {stat.value}
      </span>
      <span className="text-xs font-medium text-beige-500 sm:text-sm">{stat.label}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// AboutPage
// ----------------------------------------------------------------------------
export default function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div
      dir="rtl"
      lang="ar"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30"
    >
      <GlowOrbs />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Title                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="mb-12 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            من نحن
          </h1>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-16 flex flex-col items-center text-center">
          {/* Logo — gradient circle with "س" */}
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blush-400/40 to-lavender-400/40 blur-2xl" aria-hidden="true" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 via-lavender-400 to-gold-400 shadow-glow sm:h-32 sm:w-32">
              <span className="text-5xl font-extrabold text-white drop-shadow-md sm:text-6xl">س</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-beige-800 sm:text-4xl">
            اسكربك
          </h2>
          <p className="mt-3 text-base font-medium text-blush-500 sm:text-lg">
            يونيفورمات طبية فاخرة
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* About text                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-16 space-y-6">
          <div className="glass-card rounded-3xl p-6 leading-relaxed text-beige-700 sm:p-8 sm:text-lg">
            <p>
              <span className="font-bold text-blush-600">اسكربك</span> علامة تجارية مصرية وُلدت من
              شغفنا بتوفير يونيفورمات طبية تجمع بين الفخامة والراحة العملية. نؤمن أن من يعالجون
              ويرعون الآخرين يستحقون ملابس تليق بمهنتهم النبيلة، فصمّمنا مجموعاتنا بأقمشة منتقاة
              بعناية تتحمل ساعات العمل الطويلة وتمنح حرية الحركة الكاملة.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-6 leading-relaxed text-beige-700 sm:p-8 sm:text-lg">
            <p>
              نخدم طيفاً واسعاً من الكوادر الطبية: <span className="font-semibold text-lavender-600">الأطباء</span>،
              و<span className="font-semibold text-lavender-600">الممرضين</span>،
              و<span className="font-semibold text-lavender-600">الصيادلة</span>،
              و<span className="font-semibold text-lavender-600">أطباء الأسنان</span>،
              و<span className="font-semibold text-lavender-600">طلاب الطب</span>. لكل فئة احتياجاتها،
              ولكل مهنيّ ذوقه — لذلك نقدّم تشكيلة متنوعة من الألوان والقصات والمقاسات تناسب الجميع.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-6 leading-relaxed text-beige-700 sm:p-8 sm:text-lg">
            <p>
              من أول غرزة في القماش حتى آخر لمسة في التغليف، نحرص على أعلى معايير الجودة. هدفنا أن
              يكون كل يونيفورم يصل إليك قطعة فاخرة تعزز ثقتك بنفسك وتمنحك إطلالة مهنية راقية يوم
              بعد يوم.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Values                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-16">
          <h2 className="premium-gradient-text mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            قيمنا
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Stats                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-16">
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Call to action                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="glass-card flex flex-col items-center gap-5 rounded-3xl p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-beige-800 sm:text-3xl">
            اكتشف مجموعتنا الفاخرة
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-beige-600 sm:text-base">
            تصفّح تشكيلتنا الكاملة من اليونيفورمات الطبية واختر ما يناسب مهنتك وذوقك.
          </p>
          <button
            type="button"
            onClick={() => navigate('/store')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-lavender-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blush-500/30 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60"
          >
            تصفح المتجر
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </section>
      </div>
    </div>
  );
}
