import { useEffect, useState, useRef } from 'react';
import { fetchOrCreateConversation, fetchMessages, sendMessage } from '../lib/api';
import type { SupportConversation, SupportMessage } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Polling interval for fetching new messages (ms). */
const POLL_INTERVAL = 3000;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Format an ISO timestamp into a short Arabic time string (e.g. "٣:٤٥ م"). */
function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** Agent status indicator pill shown at the top of the chat. */
const AgentStatusBadge: React.FC<{ conversation: SupportConversation | null }> = ({
  conversation,
}) => {
  const isOnline = conversation?.agent_status === 'online';
  const agentName = conversation?.agent_name;

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={
            'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-all duration-300 ' +
            (isOnline
              ? 'bg-gradient-to-br from-blush-400 to-lavender-400'
              : 'bg-gradient-to-br from-beige-300 to-beige-400')
          }
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        {/* Status dot */}
        <span
          className={
            'absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white transition-colors duration-300 ' +
            (isOnline ? 'bg-green-400' : 'bg-beige-300')
          }
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-beige-800">
          {agentName ?? 'فريق الدعم'}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-beige-500">
          <span
            className={
              'inline-block h-2 w-2 rounded-full ' +
              (isOnline ? 'bg-green-400' : 'bg-beige-300')
            }
            aria-hidden="true"
          />
          {isOnline ? 'متصل الآن' : 'غير متصل حالياً'}
        </p>
      </div>
    </div>
  );
};

/** A single chat message bubble. */
type MessageBubbleProps = {
  message: SupportMessage;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isCustomer = message.sender_type === 'customer';

  return (
    <div
      className={
        'flex w-full ' + (isCustomer ? 'justify-end' : 'justify-start')
      }
    >
      <div
        className={
          'max-w-[80%] rounded-3xl px-4 py-3 shadow-sm transition-all duration-300 sm:max-w-[70%] ' +
          (isCustomer
            ? 'rounded-bl-md bg-gradient-to-br from-blush-400 to-blush-500 text-white'
            : 'glass-card rounded-br-md text-beige-800')
        }
      >
        {/* Content */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content_ar}
        </p>

        {/* Timestamp */}
        <p
          className={
            'mt-1.5 text-[10px] ' +
            (isCustomer ? 'text-white/70' : 'text-beige-400')
          }
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

/** Skeleton block shown while the conversation is being fetched. */
const ChatSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className={'flex ' + (i % 2 === 0 ? 'justify-start' : 'justify-end')}
      >
        <div
          className={
            'h-16 rounded-3xl bg-beige-200/50 animate-pulse ' +
            (i % 2 === 0 ? 'w-2/3 rounded-br-md' : 'w-1/2 rounded-bl-md')
          }
        />
      </div>
    ))}
  </div>
);

/** Empty state shown when a conversation has no messages yet. */
const EmptyState: React.FC = () => (
  <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blush-100 to-lavender-100 text-blush-400">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-beige-700">
      لا توجد رسائل بعد
    </h3>
    <p className="mt-1.5 max-w-xs text-sm text-beige-500">
      ابدأ المحادثة مع فريق الدعم — نحن هنا لمساعدتك في أي استفسار حول منتجاتنا أو طلبك.
    </p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* SupportPage                                                                 */
/* -------------------------------------------------------------------------- */

const SupportPage: React.FC = () => {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------------------------------------------- */
  /* Auto-scroll to bottom on new messages                                    */
  /* ----------------------------------------------------------------------- */
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ----------------------------------------------------------------------- */
  /* Initialize: fetch or create conversation + load messages                */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function init(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const conv = await fetchOrCreateConversation();
        if (cancelled) return;
        setConversation(conv);

        // The conversation may already include messages from the create call.
        if (conv.messages && conv.messages.length > 0) {
          setMessages(conv.messages);
        } else {
          const msgs = await fetchMessages(conv.id);
          if (cancelled) return;
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Failed to initialize support conversation:', err);
        if (!cancelled) {
          setError('تعذّر تحميل المحادثة. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------------------- */
  /* Poll for new messages every 3 seconds                                    */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    if (!conversation) return;

    const intervalId = window.setInterval(async () => {
      try {
        const msgs = await fetchMessages(conversation.id);
        setMessages(msgs);
      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, POLL_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [conversation]);

  /* ----------------------------------------------------------------------- */
  /* Send a new message                                                      */
  /* ----------------------------------------------------------------------- */
  async function handleSend(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const content = input.trim();
    if (!content || !conversation || sending) return;

    setSending(true);
    setInput('');

    // Optimistic update: append the customer message immediately.
    const optimistic: SupportMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_type: 'customer',
      content_ar: content,
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(conversation.id, content);
      // Refresh to get the persisted message with its real id/timestamp.
      const msgs = await fetchMessages(conversation.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Roll back the optimistic message on failure.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError('تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      setInput(content); // restore the drafted text
    } finally {
      setSending(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Derived values                                                          */
  /* ----------------------------------------------------------------------- */
  const isEmpty = !loading && !error && messages.length === 0;

  /* ----------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ----------------------------------------------------------------------- */
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
      <div className="relative z-10 mx-auto flex h-screen max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-4 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            الدعم والمحادثة
          </h1>
          <p className="mt-2 text-sm text-beige-500">
            نحن هنا لمساعدتك — تحدّث مع فريق الدعم في أي وقت
          </p>
        </header>

        {/* Chat card */}
        <div className="glass-card flex flex-1 flex-col overflow-hidden rounded-3xl">
          {/* Top bar: agent status */}
          <div className="flex items-center justify-between border-b border-beige-200/50 px-5 py-4">
            <AgentStatusBadge conversation={conversation} />
            <span className="rounded-full bg-blush-100/70 px-3 py-1 text-xs font-semibold text-blush-600">
              محادثة مباشرة
            </span>
          </div>

          {/* Messages area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-5"
          >
            {/* Loading state */}
            {loading && <ChatSkeleton />}

            {/* Error state */}
            {!loading && error && (
              <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-sm text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-full bg-gradient-to-r from-blush-400 to-lavender-400 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-105"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Empty state */}
            {isEmpty && <EmptyState />}

            {/* Messages list */}
            {!loading && !error && messages.length > 0 && (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-beige-200/50 px-4 py-3 sm:px-5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              aria-label="رسالة جديدة"
              disabled={loading || !conversation}
              className="input-premium flex-1 rounded-full py-3 pr-4 pl-4 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || !conversation}
              aria-label="إرسال"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-glow transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? (
                <svg
                  className="animate-spin"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
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
                  {/* Send icon — points left for RTL */}
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
