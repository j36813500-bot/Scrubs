import { useEffect, useState } from 'react';
import { fetchAllFeedback } from '../../lib/api';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setFeedback(await fetchAllFeedback()); } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const avgRating = feedback.length > 0 ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display font-black text-3xl mb-8 animate-fade-in-up">
        <span className="premium-gradient-text">تقييمات العملاء</span>
      </h1>

      <div className="glass-card rounded-3xl p-6 mb-8 text-center animate-fade-in-up">
        <div className="text-sm text-beige-600 mb-1">متوسط التقييم</div>
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-8 h-8 ${i < Math.round(avgRating) ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
          <span className="font-display font-black text-3xl premium-gradient-text">{avgRating.toFixed(1)}</span>
          <span className="text-beige-500 text-sm">({feedback.length} تقييم)</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card rounded-3xl h-28 skeleton" />)}</div>
      ) : feedback.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-beige-600">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((f, i) => (
            <div key={f.id} className="glass-card rounded-3xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-beige-900">{f.order?.customer_name || 'عميل'}</div>
                  <div className="text-xs text-beige-500">{f.order?.order_number} • {new Date(f.created_at).toLocaleDateString('ar')}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className={`w-4 h-4 ${j < f.rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-beige-700 mb-1">{f.review}</p>
              {f.experience && <p className="text-xs text-beige-500">{f.experience}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
