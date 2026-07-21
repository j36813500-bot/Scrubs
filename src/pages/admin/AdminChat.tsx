import { useEffect, useState, useCallback, useRef } from 'react'
import {
  fetchOrCreateConversation,
  fetchMessages,
  sendMessage,
} from '../../lib/api'
import type { SupportConversation, SupportMessage } from '../../lib/types'

export default function AdminChat(): JSX.Element {
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false)
  const [replyText, setReplyText] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Load conversations - we use fetchOrCreateConversation as the entry point
  // and also try to list all conversations by fetching them
  useEffect(() => {
    let mounted = true
    // The API only exposes fetchOrCreateConversation; we'll initialize one
    // and display the conversation list. In a full implementation, an admin
    // list endpoint would be used. Here we bootstrap with the available API.
    fetchOrCreateConversation()
      .then((conv) => {
        if (!mounted) return
        if (conv) {
          setConversations([conv])
          setSelectedConversation(conv)
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to load conversations:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    setMessagesLoading(true)
    try {
      const data = await fetchMessages(conversationId)
      setMessages(data)
    } catch (err: unknown) {
      console.error('Failed to load messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation, loadMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSelectConversation = useCallback(
    (conv: SupportConversation): void => {
      setSelectedConversation(conv)
    },
    []
  )

  const handleSend = useCallback(async (): Promise<void> => {
    if (!replyText.trim() || !selectedConversation) return
    setSending(true)
    try {
      await sendMessage(selectedConversation.id, replyText, 'agent')
      const newMessage: SupportMessage = {
        id: Date.now().toString(),
        conversation_id: selectedConversation.id,
        sender_type: 'agent',
        content_ar: replyText,
        attachment_url: null,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage])
      setReplyText('')
    } catch (err: unknown) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }, [replyText, selectedConversation])

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const conversationLabel = (conv: SupportConversation): string => {
    if (conv.user_id) return `عميل: ${conv.user_id.slice(0, 8)}`
    if (conv.guest_id) return `زائر: ${conv.guest_id.slice(0, 8)}`
    return 'محادثة'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-lavender-50" dir="rtl">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold premium-gradient-text">محادثات الدعم</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">إدارة والرد على استفسارات العملاء</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" style={{ height: '70vh' }}>
            {/* Conversations list */}
            <div className="glass-card flex flex-col overflow-hidden md:col-span-1">
              <div className="border-b border-blush-100 p-4">
                <h2 className="text-sm font-extrabold text-gray-800">المحادثات</h2>
                <p className="text-xs text-gray-500">{conversations.length} محادثة</p>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                {conversations.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full glass">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-gray-500">لا توجد محادثات</p>
                  </div>
                ) : (
                  conversations.map((conv, i) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-right transition-all animate-fade-in-up ${
                        selectedConversation?.id === conv.id
                          ? 'glass shadow-premium'
                          : 'hover:bg-blush-50/40'
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full glass">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">
                          {conversationLabel(conv)}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {conv.summary_ar || 'لا توجد رسائل'}
                        </p>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          conv.agent_status === 'online'
                            ? 'bg-green-500 animate-breathe'
                            : 'bg-gray-300'
                        }`}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div className="glass-card flex flex-col overflow-hidden md:col-span-2">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between border-b border-blush-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-800">
                          {conversationLabel(selectedConversation)}
                        </p>
                        <p className="text-xs text-gray-500">
                          بدأت في {formatDate(selectedConversation.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        selectedConversation.status === 'ai'
                          ? 'bg-lavender-100 text-lavender-700'
                          : selectedConversation.status === 'agent'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedConversation.status === 'ai'
                        ? 'رد آلي'
                        : selectedConversation.status === 'agent'
                        ? 'موظف الدعم'
                        : selectedConversation.status}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e85c8a" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full glass">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-gray-500">لا توجد رسائل بعد</p>
                        <p className="mt-1 text-xs text-gray-400">ابدأ المحادثة بإرسال رسالة</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg, i) => {
                          const isAgent = msg.sender_type === 'agent'
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isAgent ? 'justify-start' : 'justify-end'} animate-fade-in-up`}
                              style={{ animationDelay: `${i * 0.03}s` }}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl p-3 ${
                                  isAgent
                                    ? 'glass shadow-premium'
                                    : 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-glow'
                                }`}
                              >
                                <p className="text-sm font-medium">{msg.content_ar}</p>
                                <p
                                  className={`mt-1 text-xs ${
                                    isAgent ? 'text-gray-400' : 'text-white/70'
                                  }`}
                                >
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="border-t border-blush-100 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        className="input-premium flex-1"
                        placeholder="اكتب ردك هنا..."
                        disabled={sending}
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !replyText.trim()}
                        className="btn-premium flex h-12 w-12 items-center justify-center p-0"
                        aria-label="إرسال"
                      >
                        {sending ? (
                          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full glass animate-float-medium">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#916dba" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500">اختر محادثة لعرض الرسائل</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
