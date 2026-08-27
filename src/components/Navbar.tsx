import { useEffect, useState } from 'react';
import { Menu, X, Phone, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';
import { useScrolled } from '@/lib/hooks';
import { useInfosSite, buildWhatsappLink, buildTelLink } from '@/lib/useSiteData';
import { useAuth } from '@/lib/useAuth';

const NAV_LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#apropos', label: 'À propos' },
  { href: '#formations', label: 'Formations' },
  { href: '#approche', label: 'Notre approche' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const { infos } = useInfosSite();
  const { isAuthenticated, initials } = useAuth();

  const phone = infos?.telephone || SITE.phone;
  const telHref = buildTelLink(phone);
  const whatsappHref = buildWhatsappLink(
    infos?.whatsapp || SITE.phoneRaw,
    "Bonjour Auto-École Pacifique, je souhaite m'informer sur vos formations."
  );

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_24px_rgba(13,31,56,0.08)]'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 lg:px-8 ${
            scrolled ? 'py-2.5' : 'py-4'
          }`}
        >
          {/* Logo */}
          <a href="#accueil" className="group flex items-center gap-3" aria-label="Auto-École Pacifique — accueil">
            <span className="relative flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold tracking-tight text-pacifique-navy-900">
                PACIFIQUE
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pacifique-blue-600">
                Auto-École Bilingue
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-pacifique-navy-800 transition-colors hover:text-pacifique-blue-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <Link
                to="/mon-compte"
                className="group flex items-center gap-2.5 rounded-full border border-pacifique-navy-900/15 bg-white px-4 py-2 text-sm font-bold text-pacifique-navy-900 shadow-sm transition hover:border-pacifique-blue-500 hover:bg-pacifique-blue-50/50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pacifique-navy-900 to-pacifique-blue-600 text-xs font-bold text-white shadow-inner">
                  {initials}
                </span>
                <span>Mon Espace</span>
              </Link>
            ) : (
              <Link
                to="/inscription"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-pacifique-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 transition-all duration-300 hover:bg-pacifique-red-600 hover:shadow-pacifique-red-500/40 active:scale-95"
              >
                S'inscrire
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-pacifique-navy-900 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-pacifique-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-400 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">
                <img src="/images/logo.jpg" alt="Logo Pacifique" className="h-full w-full object-contain" />
              </span>
              <span className="font-display text-lg font-extrabold text-pacifique-navy-900">PACIFIQUE</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-pacifique-navy-900"
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <ul className="flex flex-col gap-1 px-3 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-pacifique-navy-800 transition-colors hover:bg-pacifique-blue-50 hover:text-pacifique-blue-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 border-t border-gray-100 p-5">
            {isAuthenticated ? (
              <Link
                to="/mon-compte"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2.5 rounded-full border border-pacifique-navy-900/15 bg-pacifique-navy-900 px-5 py-3 text-sm font-bold text-white shadow-md"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pacifique-blue-500 text-xs font-bold text-white">
                  {initials}
                </span>
                Mon Espace Candidat
              </Link>
            ) : (
              <Link
                to="/inscription"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-pacifique-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 transition-transform active:scale-95"
              >
                S'inscrire / Connexion
              </Link>
            )}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-transform active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              Écrire sur WhatsApp
            </a>
            <a
              href={telHref}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-pacifique-navy-800"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
