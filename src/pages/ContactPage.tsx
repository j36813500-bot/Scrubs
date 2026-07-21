import { useState, useEffect } from 'react'
import { fetchSettings, fetchSocialLinks } from '../lib/api'
import type { Setting, SocialLink } from '../lib/types'

export default function ContactPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {})
    fetchSocialLinks().then(setSocials).catch(() => {})
  }, [])

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value_ar || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const socialIcons: Record<string, string> = {
    facebook: 'f', instagram: '◉', tiktok: '♪', whatsapp: '✆',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center premium-gradient-text">تواصل معنا</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="font-bold text-lg mb-4">معلومات التواصل</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full glass flex items-center justify-center">📞</span>
                <div>
                  <div className="text-sm text-gray-400">الهاتف</div>
                  <div className="font-bold" dir="ltr">{getSetting('support_phone')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full glass flex items-center justify-center">✉</span>
                <div>
                  <div className="text-sm text-gray-400">البريد الإلكتروني</div>
                  <div className="font-bold" dir="ltr">{getSetting('support_email')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h2 className="font-bold text-lg mb-4">تابعنا</h2>
            <div className="flex gap-3">
              {socials.map(s => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full glass flex items-center justify-center text-xl transition-all hover:scale-110 hover:shadow-glow"
                  style={{ color: s.color_hex || undefined }}
                >
                  {socialIcons[s.platform] || '●'}
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-100 via-lavender-100 to-beige-100 opacity-50" />
            <div className="relative flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2">📍</div>
                <p className="text-sm text-gray-500">القاهرة، مصر</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h2 className="font-bold text-lg mb-6">أرسل لنا رسالة</h2>
          {sent ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 animate-scale-in">✓</div>
              <p className="text-lg font-bold text-green-500">تم إرسال رسالتك بنجاح!</p>
              <p className="text-sm text-gray-400 mt-2">سنرد عليك في أقرب وقت ممكن</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="الاسم" className="input-premium" required />
              <input type="email" placeholder="البريد الإلكتروني" className="input-premium" required />
              <textarea placeholder="رسالتك" rows={5} className="input-premium" required />
              <button type="submit" className="btn-premium w-full">إرسال</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
