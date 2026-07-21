import { useState, useEffect } from 'react'
import { fetchFAQs } from '../lib/api'
import type { FAQ } from '../lib/types'

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetchFAQs().then(data => {
      setFaqs(data)
      setLoading(false)
      if (data.length > 0) setOpenId(data[0].id)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer-bg animate-shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center premium-gradient-text">الأسئلة الشائعة</h1>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={faq.id}
            className="glass-card overflow-hidden rounded-2xl animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-5 text-right transition-all hover:bg-white/20"
            >
              <span className="font-bold text-lg">{faq.question_ar}</span>
              <span className={`text-2xl transition-transform duration-300 ${openId === faq.id ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: openId === faq.id ? '200px' : '0px' }}
            >
              <p className="p-5 pt-0 text-gray-600 leading-relaxed">{faq.answer_ar}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
