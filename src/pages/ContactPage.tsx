import { useEffect, useState } from 'react';
import { fetchSocialLinks, fetchSettings } from '../lib/api';
import type { SocialLink } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const PhoneIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MapPinIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MessageIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
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
);

const CheckCircleIcon: React.FC = () => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const SendIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Points left for RTL */}
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/**
 * Renders the inline SVG for a social platform based on its `icon` key.
 * Falls back to a generic globe icon when the platform is unknown.
 */
function renderSocialIcon(icon: string): React.ReactNode {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  } as const;

  switch (icon.toLowerCase()) {
    case 'instagram':
      return (
        <svg {...common}>
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.64 3.64 0 0 0-.88-1.35 3.64 3.64 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08zm6.95-9.18a1.28 1.28 0 1 1-2.56 0 1.28 1.28 0 0 1 2.56 0z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg {...common}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common}>
          <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.33 9.33 0 0 1 2.75 6.65c0 5.19-4.22 9.41-9.4 9.41zM20.52 3.49A11.78 11.78 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.25-1.64a11.9 11.9 0 0 0 5.78 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.5-8.45z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg {...common}>
          <path d="M12.21.5C9.39.5 7.6 2.76 7.6 5.15c0 .59.02 1.4.05 2.27-.32.18-.7.27-1.16.27-.36 0-.7-.13-1.02-.13-.36 0-.7.2-.7.6 0 .76 1.4.76 1.4 1.27 0 .2-.13.36-.27.52-.36.4-1.02.97-1.83 1.5-.83.55-1.4.83-1.7.97-.2.1-.34.27-.34.5 0 .36.3.6.66.74.4.15.97.27 1.5.43.2.05.27.15.3.35.04.2.06.5.1.7.05.27.27.4.55.4.4 0 .9-.2 1.5-.2.4 0 .85.1 1.3.4.5.34 1.1 1.06 2.1 1.06 1.4 0 2.5-1.4 3.6-1.4.5 0 1 .13 1.5.13.27 0 .5-.13.55-.4.04-.2.06-.5.1-.7.03-.2.1-.3.3-.35.53-.16 1.1-.28 1.5-.43.36-.14.66-.38.66-.74 0-.23-.14-.4-.34-.5-.3-.14-.87-.42-1.7-.97-.8-.53-1.47-1.1-1.83-1.5-.14-.16-.27-.32-.27-.52 0-.5 1.4-.5 1.4-1.27 0-.4-.34-.6-.7-.6-.32 0-.66.13-1.02.13-.46 0-.84-.1-1.16-.27.03-.87.05-1.68.05-2.27 0-2.4-1.8-4.65-4.6-4.65z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.37v13.67a2.89 2.89 0 0 1-5.2 1.73 2.89 2.89 0 0 1 2.31-4.61c.3 0 .6.05.88.13v-3.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.04z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg {...common}>
          <path d="M11.94 24c3.3 0 2.48-1.96 2.74-2.55l-.06-.5c1.7 1.45 2.07 1.36 3.9 2.05h.01c2.13.59 2.96.46 3.13.46.34-.05.5-.34.5-.34s.06-2.97.06-3.5c0-.5.16-.78.5-.78.34 0 .5.5.5.5l.5 3.5c.16.5.5.5.5.5h3.5c.5 0 .5-.5.5-.5s.5-1.5.5-1.5l-3.5-15c-.16-.5-.5-.5-.5-.5s-.5.16-.5.16l-3.5 1.84c-.5.16-.5.5-.5.5s.16.5.5.5l1.5.5c.5.16.5.5.5.5l-2.5 9.5s-.16.5-.5.5-.5-.5-.5-.5l-2-7.5s-.16-.5-.5-.5-.5.16-.5.16l-3.5 1.84c-.5.16-.5.5-.5.5s.16.5.5.5l1.5.5c.5.16.5.5.5.5l-2 8.5z" />
          <path d="M23.95 4.57 20.7 19.13c-.24 1.07-.88 1.34-1.79.83l-4.94-3.64-2.38 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.16-8.27c.4-.35-.09-.55-.62-.2L7.36 13.36l-4.88-1.53c-1.06-.33-1.08-1.06.22-1.57l19.04-7.34c.88-.32 1.65.2 1.21 1.65z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      );
    default:
      // Generic globe icon
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  delay?: number;
};

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, href, delay = 0 }) => {
  const content = (
    <div
      className="glass-card group flex items-center gap-4 rounded-2xl p-5 transition-all duration-500 hover:shadow-glow hover:ring-1 hover:ring-blush-300/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      {/* Label + value */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-beige-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-beige-800" dir="auto">
          {value}
        </p>
      </div>

      {/* External-link chevron (RTL: points left) */}
      {href && (
        <svg
          className="flex-shrink-0 text-beige-300 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-blush-400"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block" dir="rtl" aria-label={label}>
        {content}
      </a>
    );
  }
  return content;
};

/** Skeleton placeholder for the contact info cards. */
const InfoSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-beige-200/50 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 rounded-full bg-beige-200/50 animate-pulse" />
          <div className="h-4 w-32 rounded-full bg-beige-200/50 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton placeholder for the social links row. */
const SocialSkeleton: React.FC = () => (
  <div className="flex flex-wrap justify-center gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-14 w-14 rounded-full bg-beige-200/50 animate-pulse" />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* ContactPage                                                                 */
/* -------------------------------------------------------------------------- */

const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingSocial, setLoadingSocial] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* --------------------------------------------------------------------- */
  /* Load settings + social links on mount                                  */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadInfo(): Promise<void> {
      setLoadingInfo(true);
      setInfoError(null);
      try {
        const data = await fetchSettings();
        if (!cancelled) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
        if (!cancelled) setInfoError('تعذّر تحميل معلومات التواصل.');
      } finally {
        if (!cancelled) setLoadingInfo(false);
      }
    }

    async function loadSocial(): Promise<void> {
      setLoadingSocial(true);
      try {
        const data = await fetchSocialLinks();
        if (!cancelled) setSocialLinks(data);
      } catch (err) {
        console.error('Failed to load social links:', err);
      } finally {
        if (!cancelled) setLoadingSocial(false);
      }
    }

    loadInfo();
    loadSocial();

    return () => {
      cancelled = true;
    };
  }, []);

  /* --------------------------------------------------------------------- */
  /* Derived contact values (with sensible Arabic fallbacks)                */
  /* --------------------------------------------------------------------- */
  const phone = settings['phone'] || settings['phone_number'] || '';
  const email = settings['email'] || settings['contact_email'] || '';
  const address = settings['address'] || settings['address_ar'] || '';

  /* --------------------------------------------------------------------- */
  /* Form helpers                                                           */
  /* --------------------------------------------------------------------- */
  function validate(): boolean {
    const next: ContactFormErrors = {};
    if (!form.name.trim()) next.name = 'يرجى إدخال الاسم';
    if (!form.email.trim()) {
      next.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
    if (!form.phone.trim()) {
      next.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^[\d\s+()-]{7,}$/.test(form.phone.trim())) {
      next.phone = 'رقم الهاتف غير صحيح';
    }
    if (!form.message.trim()) next.message = 'يرجى إدخال رسالتك';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof ContactFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field-specific error as the user edits.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Hide the success banner once the user starts a new message.
    if (submitted) setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    // Simulate a network request for a premium feel — no backend required.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setErrors({});
  }

  /* --------------------------------------------------------------------- */
  /* Render                                                                 */
  /* --------------------------------------------------------------------- */
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
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="premium-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
            تواصل معنا
          </h1>
          <p className="mt-3 text-sm text-beige-500 sm:text-base">
            نسعد بتواصلك معنا — فريق اسكربك جاهز للإجابة على جميع استفساراتك
          </p>
        </header>

        {/* Contact info cards */}
        <section className="mb-10" aria-label="معلومات التواصل">
          {loadingInfo ? (
            <InfoSkeleton />
          ) : infoError ? (
            <div className="glass-card rounded-2xl border border-red-200/40 p-5 text-center">
              <p className="text-sm text-red-600">{infoError}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard
                icon={<PhoneIcon />}
                label="الهاتف"
                value={phone || 'غير متاح'}
                href={phone ? `tel:${phone.replace(/\s/g, '')}` : undefined}
                delay={0}
              />
              <InfoCard
                icon={<MailIcon />}
                label="البريد الإلكتروني"
                value={email || 'غير متاح'}
                href={email ? `mailto:${email}` : undefined}
                delay={80}
              />
              <InfoCard
                icon={<MapPinIcon />}
                label="العنوان"
                value={address || 'غير متاح'}
                delay={160}
              />
            </div>
          )}
        </section>

        {/* Form + decorative map panel */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Contact form */}
          <section className="lg:col-span-3" aria-label="نموذج التواصل">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-beige-800">أرسل لنا رسالة</h2>

              {/* Success banner */}
              {submitted && (
                <div
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200/50 bg-green-50/60 p-4"
                  role="status"
                  aria-live="polite"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                    <CheckCircleIcon />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-green-700">تم إرسال رسالتك بنجاح</p>
                    <p className="mt-0.5 text-xs text-green-600">
                      شكراً لتواصلك مع اسكربك — سنرد عليك في أقرب وقت ممكن.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-beige-700">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-beige-300">
                      <UserIcon />
                    </span>
                    <input
                      id="contact-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      aria-invalid={!!errors.name}
                      className="input-premium w-full rounded-2xl py-3.5 pr-12 pl-4 text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-beige-700">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-beige-300">
                        <MailIcon />
                      </span>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                        aria-invalid={!!errors.email}
                        className="input-premium w-full rounded-2xl py-3.5 pr-12 pl-4 text-right text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-beige-700">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-beige-300">
                        <PhoneIcon />
                      </span>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        aria-invalid={!!errors.phone}
                        className="input-premium w-full rounded-2xl py-3.5 pr-12 pl-4 text-right text-sm text-beige-800 placeholder:text-beige-400 focus:outline-none"
                      />
                    </div>
                    {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-beige-700">
                    رسالتك
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-4 top-4 text-beige-300">
                      <MessageIcon />
                    </span>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      aria-invalid={!!errors.message}
                      className="input-premium w-full resize-none rounded-2xl py-3.5 pr-12 pl-4 text-sm leading-relaxed text-beige-800 placeholder:text-beige-400 focus:outline-none"
                    />
                  </div>
                  {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-premium flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-glow transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
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
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <SendIcon />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Decorative map / location panel */}
          <aside className="lg:col-span-2" aria-label="موقعنا">
            <div className="glass-card flex h-full flex-col rounded-3xl p-6 sm:p-8">
              <h2 className="mb-1 text-lg font-bold text-beige-800">موقعنا</h2>
              <p className="mb-5 text-xs text-beige-500">تفضّل بزيارة متجرنا الرئيسي</p>

              {/* Decorative map placeholder */}
              <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-blush-100/60 via-lavender-100/50 to-beige-100/60">
                {/* Stylized "streets" */}
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <div className="absolute left-0 right-0 top-1/3 h-1.5 -translate-y-1/2 bg-beige-300/50" />
                  <div className="absolute left-0 right-0 top-2/3 h-1.5 -translate-y-1/2 bg-beige-300/50" />
                  <div className="absolute bottom-0 top-0 left-1/4 w-1.5 -translate-x-1/2 bg-beige-300/50" />
                  <div className="absolute bottom-0 top-0 left-3/4 w-1.5 -translate-x-1/2 bg-beige-300/50" />
                </div>

                {/* Center pin */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-glow ring-4 ring-white/60">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    {/* Pin tail */}
                    <div className="h-3 w-1 -translate-y-0.5 bg-gradient-to-b from-blush-500 to-transparent" />
                    {/* Pulse ring */}
                    <div className="absolute -bottom-1 h-4 w-4 rounded-full bg-blush-400/40 blur-sm" />
                  </div>
                </div>

                {/* Brand watermark */}
                <div className="absolute bottom-3 right-3 text-[10px] font-bold tracking-widest text-beige-400">
                  اسكربك
                </div>
              </div>

              {/* Address text */}
              <div className="mt-5 flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-beige-100/70 text-blush-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <p className="text-sm leading-relaxed text-beige-600" dir="auto">
                  {address || 'سيتم عرض العنوان قريباً'}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Social links */}
        <section className="mt-12" aria-label="روابط التواصل الاجتماعي">
          <div className="glass-card rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-lg font-bold text-beige-800">تابعنا على وسائل التواصل</h2>
            <p className="mt-1.5 text-xs text-beige-500">
              كن أول من يعرف عن أحدث تشكيلاتنا وعروضنا الحصرية
            </p>

            <div className="mt-6">
              {loadingSocial ? (
                <SocialSkeleton />
              ) : socialLinks.length === 0 ? (
                <p className="text-sm text-beige-400">لا توجد روابط متاحة حالياً</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label_ar || link.platform}
                      title={link.label_ar || link.platform}
                      className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-beige-600 shadow-sm ring-1 ring-beige-200/60 transition-all duration-300 hover:scale-110 hover:shadow-glow"
                      style={{ color: link.color_hex || undefined }}
                      onMouseEnter={(e) => {
                        if (link.color_hex) {
                          e.currentTarget.style.backgroundColor = link.color_hex;
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = link.color_hex || '';
                      }}
                    >
                      {renderSocialIcon(link.icon || link.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
