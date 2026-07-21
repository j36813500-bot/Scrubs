import { useState, useEffect } from 'react';
import { useRouter } from '../lib/router';
import { fetchCustomerOrders, submitOrderFeedback } from '../lib/api';
import type { Order } from '../lib/types';

export default function FeedbackPage() {
  const { query, navigate } = useRouter();
  const orderId = query.get('order') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const orders = await fetchCustomerOrders();
        const o = orders.find(x => x.id === orderId || x.order_number === orderId);
        setOrder(o || null);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [orderId]);

  const handleSubmit = async () => {
    if (!order || !review) return;
    setSubmitting(true);
    try {
      await submitOrderFeedback(order.id, rating, review, experience);
      setDone(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="pt-28 px-4 pb-12">
        <div className="mx-auto max-w-md glass-card rounded-3xl h-64 skeleton" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-28 px-4 pb-12">
        <div className="mx-auto max-w-md glass-card rounded-3xl p-10 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center mb-4 shadow-glow animate-float-medium">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-beige-900 mb-2">شكراً لتقييمك!</h2>
          <p className="text-beige-600 mb-6">رأيك يهمنا ويساعدنا على التحسين</p>
          <button onClick={() => navigate('/')} className="btn-premium">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blush-200/30 blur-3xl animate-breathe" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-lavender-200/30 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 mx-auto max-w-md">
        <h1 className="font-display font-black text-3xl text-center mb-2 animate-fade-in-up">
          <span className="premium-gradient-text">تقييم الطلب</span>
        </h1>
        <p className="text-center text-beige-600 mb-8">شاركنا تجربتك مع طلبك</p>

        {order ? (
          <div className="glass-card rounded-3xl p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-sm text-beige-500">رقم الطلب</div>
              <div className="font-display font-bold text-xl text-beige-900">{order.order_number}</div>
            </div>

            {/* star rating */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-beige-800 mb-3 text-center">تقييمك بالنجوم</label>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setRating(i + 1)} className="transition-transform hover:scale-125">
                    <svg className={`w-12 h-12 ${i < rating ? 'text-gold-400 fill-gold-300' : 'text-beige-300'} transition-colors`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </button>
                ))}
              </div>
            </div>

            {/* review */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-beige-800 mb-2">رأيك المكتوب</label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="اكتب تجربتك مع المنتج..."
                className="input-premium !rounded-2xl text-sm min-h-[100px]"
              />
            </div>

            {/* experience */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-beige-800 mb-2">التجربة العامة</label>
              <input
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="مثال: تجربة ممتازة، جودة عالية..."
                className="input-premium text-sm"
              />
            </div>

            <button onClick={handleSubmit} disabled={submitting || !review} className="btn-premium w-full">
              {submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-10 text-center">
            <p className="text-beige-600 mb-4">لم يتم العثور على الطلب</p>
            <button onClick={() => navigate('/track')} className="btn-premium">تتبع الطلبات</button>
          </div>
        )}
      </div>
    </div>
  );
}
