import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchOrCreateConversation, fetchMessages, sendMessage } from '../lib/api'
import type { SupportMessage } from '../lib/types'

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    const msgs = await fetchMessages(conversationId)
    setMessages(msgs)
    setLoading(false)
  }, [conversationId])

  useEffect(() => {
    (async () => {
      const conv = await fetchOrCreateConversation()
      if (conv) setConversationId(conv.id)
    })()
  }, [])

  useEffect(() => {
    if (!conversationId) return
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [conversationId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return
    const content = input.trim()
    setInput('')
    setSending(true)

    const optimistic: SupportMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: conversationId,
      sender_type: 'user',
      content_ar: content,
      attachment_url: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    await sendMessage(conversationId, content, 'user')
    setSending(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        <div className="glass p-4 border-b border-white/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center text-white font-bold">
            س
          </div>
          <div>
            <h2 className="font-bold">الدعم الفني</h2>
            <p className="text-xs text-green-500">● متصل</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {loading ? (
            <div className="text-center text-gray-400 py-8">جاري التحميل...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg mb-2">مرحباً بك في الدعم الفني</p>
              <p className="text-sm">كيف يمكننا مساعدتك؟</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    msg.sender_type === 'user'
                      ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white rounded-br-sm'
                      : 'glass text-gray-700 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content_ar}</p>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl px-4 py-2 flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/20 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك..."
            className="input-premium flex-1"
          />
          <button onClick={handleSend} disabled={!input.trim()} className="btn-premium px-6">
            إرسال
          </button>
        </div>
      </div>
    </div>
  )
}
