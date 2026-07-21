import { useEffect, useState } from 'react';
import { fetchFAQs } from '../lib/api';
import type { FAQ } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Chevron icon                                                               */
/* -------------------------------------------------------------------------- */

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={'transition-transform duration-500 ease-out ' + (open ? 'rotate-180' : 'rotate-0')}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Accordion item                                                             */
/* -------------------------------------------------------------------------- */

type FaqItemProps = {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
};

const FaqItem: React.FC<FaqItemProps> = ({ faq, isOpen, onToggle }) => {
  return (
    <div
      className={
        'glass-card rounded-2xl transition-all duration-500 ' +
        (isOpen ? 'shadow-glow ring-1 ring-blush-300/40' : 'hover:shadow-glow hover:ring-1 hover:ring-blush-300/20')
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60 sm:p-6"
      >
        {/* Question — on the right (RTL natural start) */}
        <span
          className={
            'flex-1 text-base font-semibold leading-relaxed transition-colors duration-300 ' +
            (isOpen ? 'text-blush-700' : 'text-beige-800')
          }
        >
          {faq.question_ar}
        </span>

        {/* Chevron — on the left (RTL natural end) */}
        <span
          className={
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ' +
            (isOpen
              ? 'bg-gradient-to-br from-blush-400 to-lavender-400 text-white'
              : 'bg-beige-100/70 text-beige-500')
          }
        >
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {/* Answer — smooth max-height + opacity transition */}
      <div
        className="grid transition-all duration-500 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-beige-600 sm:px-6 sm:pb-6 sm:text-[15px]">
            {faq.answer_ar}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

const FaqSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-3/4 rounded-full bg-beige-200/50 animate-pulse" />
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-beige-200/50 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

const EmptyState: React.FC = () => (
  <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-beige-100 to-beige-200/60 text-beige-400">
      <svg
        width="38"
        height="38"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-beige-700">لا توجد أسئلة شائعة حالياً</h3>
    <p className="mt-2 max-w-sm text-sm text-beige-500">
      لم نتمكن من العثور على أي أسئلة شائعة في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع فريق الدعم.
    </p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* FAQPage                                                                     */
/* -------------------------------------------------------------------------- */

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  /* --------------------------------------------------------------------- */
  /* Load FAQs on mount                                                     */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFAQs();
        if (!cancelled) {
          setFaqs(data);
          // Auto-expand the first FAQ for a premium, content-rich first impression.
          if (data.length > 0) setOpenId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
        if (!cancelled) setError('تعذّر تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --------------------------------------------------------------------- */
  /* Toggle handler — only one FAQ open at a time                           */
  /* --------------------------------------------------------------------- */
  function handleToggle(id: string): void {
    setOpenId((prev) => (prev === id ? null : id));
  }

  /* --------------------------------------------------------------------- */
  /* Render                                                                 */
  /* --------------------------------------------------------------------- */
  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50/40 via-white to-lavender-50/30"
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blush-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-lavender-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-300/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            الأسئلة الشائعة
          </h1>
          <p className="mt-3 text-sm text-beige-500 sm:text-base">
            كل ما تحتاج معرفته عن منتجاتنا وخدماتنا في مكان واحد
          </p>
        </header>

        {/* Error state */}
        {error && (
          <div className="glass-card mb-6 rounded-2xl border border-red-200/40 p-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <FaqSkeleton />}

        {/* Empty state */}
        {!loading && !error && faqs.length === 0 && <EmptyState />}

        {/* FAQ accordion list */}
        {!loading && !error && faqs.length > 0 && (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            ))}
          </div>
        )}

        {/* Support nudge */}
        {!loading && !error && faqs.length > 0 && (
          <div className="glass-card mt-10 rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-lg font-bold text-beige-800">لم تجد إجابتك؟</h2>
            <p className="mt-2 text-sm text-beige-500">
              فريق الدعم لدينا جاهز لمساعدتك في أي وقت. تواصل معنا وسنرد على استفسارك في أقرب وقت ممكن.
            </p>
            <a
              href="/support"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-7 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:scale-105"
            >
              تواصل مع الدعم
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
