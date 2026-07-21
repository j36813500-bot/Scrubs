import { useEffect, useRef, useState } from 'react';
import {
  fetchOrCreateConversation, fetchMessages, sendMessage, requestHumanAgent,
} from '../lib/api';
import type { SupportConversation, SupportMessage } from '../lib/types';

const EMOJIS = ['😀', '😍', '👍', '🙏', '❤️', '😊', '🩺', '✨', '🛍️', '💡', '🤔', '👌'];
const SUGGESTIONS = [
  'كيف أختار المقاس المناسب؟',
  'كم تستغرق مدة التوصيل؟',
  'هل يمكنني استبدال المنتج؟',
  'ما هي طرق الدفع المتاحة؟',
  'كيف أتتبع طلبي؟',
];

// Lightweight Arabic AI responder — rule-based, no external API needed.
function aiReply(input: string): string {
  const q = input.toLowerCase();
  if (/مرحبا|السلام|اهلا|هاي|hi|hello/.test(q)) return 'مرحباً بك في اسكربك! 👋 كيف يمكنني مساعدتك اليوم؟';
  if (/مقاس|حجم|size/.test(q)) return 'يمكنك الاطلاع على دليل المقاسات في صفحة كل منتج. ننصح بقياس محيط الصدر والخصر ومقارنته بالجدول. إذا كنت بين مقاسين، اختر الأكبر للراحة. 📏';
  if (/توصيل|شحن|delivery|shipping/.test(q)) return 'عادة يستغرق التوصيل 2-5 أيام عمل داخل المدن الرئيسية، و5-8 أيام للمناطق الأخرى. ستصلك رسالة تتبع فور شحن طلبك. 🚚';
  if (/استبدال|استرجاع|ارجاع|return|exchange/.test(q)) return 'نعم، يمكنك استبدال أو إرجاع المنتج خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية مع البطاقات. راجع صفحة سياسة الاستبدال والاسترجاع للتفاصيل. 🔄';
  if (/دفع|payment|بطاقة|تحويل/.test(q)) return 'نوفر الدفع عند الاستلام، والبطاقات الائتمانية، والتحويل البنكي. جميع المعاملات آمنة ومشفّرة. 💳';
  if (/تتبع|طلب|order|track/.test(q)) return 'يمكنك تتبع طلبك من صفحة "تتبع الطلبات" بإدخال رقم طلبك. سترى حالة الشحنة لحظياً. 📦';
  if (/سعر|ثمن|price|تكلفة/.test(q)) return 'تتراوح أسعار يونيفورماتنا بين 750 و 1400 ج.م حسب التصميم والقماش. تصفح المتجر للاطلاع على كل التفاصيل والعروض! 💰';
  if (/قماش|خامة|نسيج|fabric|material/.test(q)) return 'نستخدم أقمشة فاخرة: قطن طبي، ميكرو فايبر مرن، ونسيج مضاد للبكتيريا. كلها مريحة ومتينة وتتحمل الغسيل المتكرر. 🧵';
  if (/لون|ألوان|color/.test(q)) return 'متوفر لدينا تشكيلة ألوان أنثوية راقية: وردي، لافندر، بيج، أبيض ذهبي، أزرق سماوي وأكثر. اختر ما يناسب ذوقك! 🎨';
  if (/خصم|عروض|تخفيض|offer|discount/.test(q)) return 'لدينا عروض دورية على تشكيلات مختارة! تابع صفحة المتجر وقسم العروض للاطلاع على أحدث الخصومات. ✨';
  if (/شكر|thank/.test(q)) return 'العفو! سعداء بخدمتك دائماً. هل من شيء آخر يمكنني مساعدتك به؟ 🌸';
  return 'شكراً لسؤالك! لمساعدتك بشكل أفضل، يمكنني تحويلك إلى أحد ممثلي خدمة العملاء. اضغط على زر "التواصل مع خدمة العملاء" أدناه. 🌟';
}

export default function SupportPage() {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const conv = await fetchOrCreateConversation();
        setConversation(conv);
        const msgs = await fetchMessages(conv.id);
        setMessages(msgs);
        if (msgs.length === 0) {
          const greeting = 'مرحباً بك في اسكربك! 🌸 أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن المقاسات، التوصيل، الأقمشة، أو أي استفسار آخر.';
          await sendMessage(conv.id, 'ai', greeting);
          setMessages(await fetchMessages(conv.id));
        }
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, agentTyping]);

  const send = async (text: string) => {
    if (!text.trim() || !conversation) return;
    setInput('');
    try {
      await sendMessage(conversation.id, 'user', text);
      setMessages(await fetchMessages(conversation.id));
      // AI response
      if (conversation.status === 'ai') {
        setTyping(true);
        setTimeout(async () => {
          setTyping(false);
          const reply = aiReply(text);
          await sendMessage(conversation.id, 'ai', reply);
          setMessages(await fetchMessages(conversation.id));
        }, 1200);
      } else {
        // agent responds
        setAgentTyping(true);
        setTimeout(async () => {
          setAgentTyping(false);
          const reply = 'شكراً لتواصلك معنا. تم استلام رسالتك وسنقوم بالرد عليك في أقرب وقت. 🌟';
          await sendMessage(conversation.id, 'agent', reply);
          setMessages(await fetchMessages(conversation.id));
        }, 2000);
      }
    } catch { /* ignore */ }
  };

  const transferToAgent = async () => {
    if (!conversation) return;
    try {
      await requestHumanAgent(conversation.id);
      const updated = { ...conversation, status: 'agent' as const, agent_name: 'خدمة العملاء', agent_status: 'online' as const };
      setConversation(updated);
      setHandoff(true);
      await sendMessage(conversation.id, 'system', 'تم تحويلك إلى أحد ممثلي خدمة العملاء. سيتم الرد عليك خلال لحظات... 🌟');
      setMessages(await fetchMessages(conversation.id));
      setAgentTyping(true);
      setTimeout(async () => {
        setAgentTyping(false);
        await sendMessage(conversation.id, 'agent', 'مرحباً، أنا ممثل خدمة العملاء. تم الاطلاع على محادثتك السابقة. كيف يمكنني مساعدتك؟ 🙏');
        setMessages(await fetchMessages(conversation.id));
      }, 2500);
    } catch { /* ignore */ }
  };

  const addEmoji = (e: string) => setInput(prev => prev + e);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) send(`📎 ${file.name}`);
  };

  const isAgent = conversation?.status === 'agent' || conversation?.status === 'queued';

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-6 animate-fade-in-up">
          <h1 className="font-display font-black text-3xl sm:text-4xl mb-2">
            <span className="premium-gradient-text">اتكلم معانا</span>
          </h1>
          <p className="text-beige-600">مركز الدعم الذكي — نحن هنا لمساعدتك</p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-[70vh] animate-scale-in">
          {/* header */}
          <div className="p-4 border-b border-white/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 flex items-center justify-center text-white font-bold text-lg shadow-glow">
                  {isAgent ? 'ع' : '🤖'}
                </div>
                <span className={`absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isAgent ? 'bg-green-400' : 'bg-blush-400'}`} />
              </div>
              <div>
                <div className="font-bold text-beige-900">{isAgent ? conversation?.agent_name : 'المساعد الذكي'}</div>
                <div className="text-xs text-beige-600 flex items-center gap-1">
                  {agentTyping ? (
                    <span className="text-blush-600">يكتب الآن...</span>
                  ) : isAgent ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span>متصل الآن</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blush-400" />
                      <span>جاهز للمساعدة</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isAgent && conversation?.last_seen_at && (
              <div className="text-xs text-beige-500">آخر ظهور: {new Date(conversation.last_seen_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
            {typing && (
              <div className="flex justify-start">
                <div className="glass rounded-3xl rounded-tr-sm px-4 py-3">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            {agentTyping && (
              <div className="flex justify-start">
                <div className="glass rounded-3xl rounded-tr-sm px-4 py-3">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* handoff button */}
          {!isAgent && (
            <div className="px-4 pb-2">
              <button onClick={transferToAgent} className="w-full btn-premium btn-gold text-sm">
                التواصل مع خدمة العملاء
              </button>
            </div>
          )}

          {/* suggestions */}
          {conversation?.status === 'ai' && messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="px-3 py-1.5 rounded-full glass text-xs font-semibold text-blush-700 hover:scale-105 transition-transform">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* emoji bar */}
          <div className="px-4 py-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
            ))}
          </div>

          {/* input */}
          <div className="p-3 border-t border-white/40 flex items-center gap-2">
            <label className="w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer shrink-0">
              <svg className="w-5 h-5 text-beige-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <input type="file" className="hidden" onChange={onFile} accept="image/*" />
            </label>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0" title="إدخال صوتي">
              <svg className="w-5 h-5 text-beige-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="اكتب رسالتك هنا..."
              className="input-premium text-sm"
            />
            <button
              onClick={() => send(input)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-white flex items-center justify-center shrink-0 shadow-glow hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'scaleX(-1)' }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: SupportMessage }) {
  const isUser = msg.sender_type === 'user';
  const isSystem = msg.sender_type === 'system';
  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="glass rounded-full px-4 py-2 text-xs text-beige-600 text-center max-w-md">
          {msg.content_ar}
        </div>
      </div>
    );
  }
  return (
    <div className={`flex animate-fade-in-up ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-3xl ${
          isUser
            ? 'bg-gradient-to-br from-blush-400 to-lavender-400 text-white rounded-tr-sm shadow-glow'
            : 'glass rounded-tl-sm text-beige-800'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-line">{msg.content_ar}</div>
        <div className={`text-[10px] mt-1 ${isUser ? 'text-white/70' : 'text-beige-500'}`}>
          {new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
