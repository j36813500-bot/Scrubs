import { useEffect, useState } from 'react';
import { fetchFaqs } from '../lib/api';
import type { Faq } from '../lib/types';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [open, setOpen] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setFaqs(await fetchFaqs()); } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-display font-black text-3xl sm:text-4xl mb-2">
            <span className="premium-gradient-text">الأسئلة الشائعة</span>
          </h1>
          <p className="text-beige-600">كل ما تحتاج معرفته عن منتجاتنا وخدماتنا</p>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-20 skeleton" />)}</div>
        ) : (
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={f.id} className="glass-card rounded-3xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-right"
                >
                  <span className="font-bold text-beige-900">{f.question_ar}</span>
                  <svg className={`w-5 h-5 text-blush-500 transition-transform ${open === i ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-beige-700 text-sm leading-relaxed animate-fade-in">
                    {f.answer_ar}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
