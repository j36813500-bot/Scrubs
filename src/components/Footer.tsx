import { useRouter } from '../lib/router';

const FOOTER_NAV = [
  { label: 'الرئيسية', to: '/' },
  { label: 'المتجر', to: '/store' },
  { label: 'من نحن', to: '/about' },
  { label: 'اتكلم معانا', to: '/support' },
  { label: 'تتبع الطلبات', to: '/track' },
  { label: 'الأسئلة الشائعة', to: '/faq' },
  { label: 'سياسة الاستبدال والاسترجاع', to: '/returns' },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'الشروط والأحكام', to: '/terms' },
];

export default function Footer() {
  const { navigate } = useRouter();
  return (
    <footer className="relative mt-20 px-4 pb-10">
      <div className="mx-auto max-w-7xl glass-card rounded-3xl p-8 sm:p-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">س</span>
              </div>
              <span className="font-display font-bold text-2xl premium-gradient-text">اسكربك</span>
            </div>
            <p className="text-beige-700 text-sm leading-relaxed">
              منصة فاخرة متخصصة في اليونيفورمات الطبية للأطباء والممرضين والصيادلة وأطباء الأسنان وطلاب الطب وكل الكوادر الصحية. نصمم تجربة تسوق استثنائية بلمسة أنثوية راقية.
            </p>
          </div>
          <div>
            <h3 className="font-display font-bold text-blush-800 mb-4">روابط سريعة</h3>
            <div className="grid grid-cols-2 gap-2">
              {FOOTER_NAV.map(item => (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="text-right text-sm text-beige-700 hover:text-blush-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-blush-800 mb-4">تواصل معنا</h3>
            <p className="text-sm text-beige-700 mb-2">الدعم متاح على مدار الساعة</p>
            <button
              onClick={() => navigate('/support')}
              className="btn-premium text-sm"
            >
              ابدأ محادثة
            </button>
          </div>
        </div>
        <div className="pt-6 border-t border-white/40 text-center text-sm text-beige-600">
          © 2026 اسكربك. جميع الحقوق محفوظة. صُمم بحب للكوادر الصحية.
        </div>
      </div>
    </footer>
  );
}
