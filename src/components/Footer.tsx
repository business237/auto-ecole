import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, MapPin, MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';
import { useInfosSite, buildWhatsappLink, buildTelLink } from '@/lib/useSiteData';

// TikTok icon — lucide doesn't ship one, so we use a small inline SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.73 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.12z" />
    </svg>
  );
}

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/formations', label: 'Formations' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/contact', label: 'Contact' },
  { to: '/suivre-ma-demande', label: 'Suivre ma demande' },
];

export default function Footer() {
  const { infos } = useInfosSite();

  const phone = infos?.telephone || SITE.phone;
  const address = infos?.adresse || SITE.address;
  const fbUrl = infos?.facebook || SITE.social.facebook;
  const instaUrl = infos?.instagram || SITE.social.instagram;
  const tiktokUrl = infos?.tiktok || SITE.social.tiktok;
  const waUrl = buildWhatsappLink(infos?.whatsapp || SITE.phoneRaw);

  const socials = [
    { href: fbUrl || '#', label: 'Facebook', icon: Facebook, available: !!fbUrl },
    { href: instaUrl || '#', label: 'Instagram', icon: Instagram, available: !!instaUrl },
    { href: tiktokUrl || '#', label: 'TikTok', icon: TikTokIcon, available: !!tiktokUrl },
    { href: waUrl, label: 'WhatsApp', icon: MessageCircle, available: true },
  ];

  return (
    <footer className="bg-pacifique-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm border border-white/20">
                <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
              </span>
              <div className="leading-none">
                <p className="font-display text-lg font-extrabold">PACIFIQUE</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pacifique-blue-300">Auto-École Bilingue</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pacifique-blue-100/60">
              Formation à la conduite et sensibilisation à la sécurité routière à Kribi.
            </p>

            {/* Social */}
            <div className="mt-5 flex gap-2.5">
              {socials.map((s) =>
                s.available ? (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.label === 'WhatsApp' || s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-pacifique-blue-200 transition-colors hover:bg-pacifique-blue-500 hover:text-white"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ) : (
                  <span
                    key={s.label}
                    aria-label={`${s.label} — bientôt disponible`}
                    className="flex h-9 w-9 cursor-default items-center justify-center rounded-lg bg-white/5 text-white/20"
                  >
                    <s.icon className="h-4 w-4" />
                  </span>
                )
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-sm text-pacifique-blue-100/60 transition-colors hover:text-pacifique-blue-400">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-pacifique-blue-100/60">
                <MapPin className="h-4 w-4 flex-shrink-0 text-pacifique-blue-400" />
                <span>{address}</span>
              </li>
              <li>
                <a href={buildTelLink(phone)} className="flex items-center gap-3 text-sm text-pacifique-blue-100/60 transition-colors hover:text-pacifique-blue-400">
                  <Phone className="h-4 w-4 flex-shrink-0 text-pacifique-blue-400" />
                  {phone}
                </a>
              </li>
            </ul>
          </div>

          {/* AFJANES Group */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">AFJANES Group</h4>
            <p className="mt-4 text-sm leading-relaxed text-pacifique-blue-100/60">
              Auto-École Pacifique est une entité d'AFJANES GROUP.
            </p>
            <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
              <p className="font-display text-sm font-bold text-white">{SITE.group}</p>
              <p className="mt-1 text-xs text-pacifique-blue-200/50">Écosystème de formation à la conduite</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-pacifique-blue-100/40">
            © 2026 Auto-École Pacifique — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
