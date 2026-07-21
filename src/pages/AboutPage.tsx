import { useRouter } from '../lib/router'

export default function AboutPage() {
  const router = useRouter()

  const values = [
    { icon: '✨', title: 'الجودة', desc: 'أقمشة فاخرة تتحمل الغسيل المتكرر وتدوم طويلاً' },
    { icon: '🌿', title: 'الراحة', desc: 'تصاميم مريحة تمنحك حرية الحركة طوال يوم العمل' },
    { icon: '🎨', title: 'الأناقة', desc: 'ألوان وتصاميم عصرية تعكس احترافيتك' },
    { icon: '🤝', title: 'الثقة', desc: 'آلاف العملاء يثقون بنا في جميع أنحاء مصر' },
  ]

  const stats = [
    { value: '+5000', label: 'منتج مُباع' },
    { value: '+1200', label: 'عميل سعيد' },
    { value: '+5', label: 'سنوات خبرة' },
    { value: '4.9', label: 'تقييم العملاء' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 premium-gradient-text">قصة اسكربك</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          بدأت رحلتنا من شغف بتوفير يونيفورمات طبية تجمع بين الأناقة والراحة والجودة.
          نؤمن أن الكوادر الطبية يستحقون الأفضل، لذلك نختار أجود الأقمشة ونصمم
          كل قطعة بعناية فائقة.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {values.map((v, i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-3xl text-center animate-fade-in-up hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="text-4xl mb-3 animate-float-medium">{v.icon}</div>
            <h3 className="font-bold text-lg mb-2">{v.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 rounded-3xl mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-bold premium-gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center glass-card p-12 rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">جاهز لاكتشاف مجموعتنا؟</h2>
        <p className="text-gray-500 mb-6">تصفح أحدث تصاميم اليونيفورمات الطبية الفاخرة</p>
        <button onClick={() => router.navigate('/store')} className="btn-premium text-lg">
          تصفح المتجر
        </button>
      </div>
    </div>
  )
}
