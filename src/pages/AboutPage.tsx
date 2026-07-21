import { useEffect, useState } from 'react';
import { fetchSocialLinks } from '../lib/api';
import type { SocialLink } from '../lib/types';

export default function AboutPage() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  useEffect(() => { (async () => { try { setSocials(await fetchSocialLinks()); } catch { /* ignore */ } })(); }, []);

  return (
    <div className="pt-28 px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        {/* hero */}
        <section className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-soft" />
            <span className="text-sm font-semibold text-beige-700">قصتنا</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl mb-6">
            <span className="premium-gradient-text">من نحن</span>
          </h1>
          <p className="text-lg text-beige-700 max-w-2xl mx-auto leading-relaxed">
            وُلدت اسكربك من شغفٍ بالتميّز الطبي ورغبةٍ في إعادة تعريف اليونيفورم الطبي كقطعة أنيقة تمنح الكوادر الصحية ثقةً وإطلالةً راقية. نؤمن أن من يعتنون بصحتنا يستحقون أن يرتدوا ما يليق بمكانتهم.
          </p>
        </section>

        {/* story cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: 'sparkle', t: 'رؤيتنا', d: 'أن نكون الوجهة الأولى لليونيفورمات الطبية الفاخرة في المنطقة العربية، بتصاميم تجمع بين الأناقة والراحة والاحترافية.' },
            { icon: 'heart', t: 'رسالتنا', d: 'تمكين كل كادر صحي بإطلالة تعكس مهنيتّه وذوقه، عبر يونيفورمات مصممة بعناية من أقمشة فاخرة ومستدامة.' },
            { icon: 'star', t: 'قيمنا', d: 'الجودة، الأناقة، الاهتمام بالتفاصيل، وخدمة عملاء استثنائية ترافقك في كل خطوة من رحلتك معنا.' },
          ].map((c, i) => (
            <div key={c.t} className="glass-card rounded-3xl p-8 text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-blush-200 to-lavender-200 flex items-center justify-center mb-4 animate-float-medium" style={{ animationDelay: `${i * 0.5}s` }}>
                <StoryIcon name={c.icon} />
              </div>
              <h3 className="font-display font-bold text-xl text-beige-900 mb-2">{c.t}</h3>
              <p className="text-beige-700 text-sm leading-relaxed">{c.d}</p>
            </div>
          ))}
        </section>

        {/* stats */}
        <section className="glass-card rounded-3xl p-10 mb-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blush-200/40 blur-3xl animate-breathe" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-lavender-200/40 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: '+5000', l: 'عميل سعيد' },
              { n: '+120', l: 'تصميم فاخر' },
              { n: '+30', l: 'تخصص طبي' },
              { n: '4.9', l: 'تقييم العملاء' },
            ].map(s => (
              <div key={s.l}>
                <div className="font-display font-black text-4xl premium-gradient-text mb-1">{s.n}</div>
                <div className="text-sm text-beige-600">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* social glass cards */}
        <section>
          <h2 className="font-display font-bold text-2xl text-beige-900 text-center mb-2">تواصل معنا</h2>
          <p className="text-beige-600 text-center mb-8">تابعنا على منصاتنا الاجتماعية</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {socials.map((s, i) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-3xl p-6 text-center group relative overflow-hidden hover:scale-105 hover:shadow-glow transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${s.color_hex}, transparent)` }}
                />
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${s.color_hex}, ${s.color_hex}99)` }}
                >
                  <SocialIcon platform={s.platform} />
                </div>
                <div className="font-display font-bold text-beige-900">{s.label_ar}</div>
                <div className="text-xs text-beige-600 mt-1">تابعنا</div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StoryIcon({ name }: { name: string }) {
  const cls = "w-8 h-8 text-blush-700";
  if (name === 'sparkle') return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/></svg>;
  if (name === 'heart') return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
}

function SocialIcon({ platform }: { platform: string }) {
  const cls = "w-7 h-7 text-white";
  switch (platform) {
    case 'tiktok': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
    case 'facebook': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>;
    case 'instagram': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38C1.36 2.67.95 3.34.63 4.13c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.12-1.38 5.9 5.9 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>;
    case 'whatsapp': return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.5 9.5 0 0 1-4.84-1.32l-.35-.2-3.6.94.96-3.51-.23-.36a9.5 9.5 0 1 1 8.06 4.45zM20.5 3.49A11.45 11.45 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.2-1.62a11.93 11.93 0 0 0 5.84 1.49h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.49-8.44z"/></svg>;
    default: return null;
  }
}
