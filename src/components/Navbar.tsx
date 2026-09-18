import { useEffect, useState } from 'react';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';
import { useScrolled } from '@/lib/hooks';
import { useInfosSite, buildWhatsappLink, buildTelLink } from '@/lib/useSiteData';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/formations', label: 'Formations' },
  { to: '/permis', label: 'Tous les permis' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const { infos } = useInfosSite();

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
          <Link to="/" className="group flex items-center gap-3" aria-label="Auto-École Pacifique — accueil">
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
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-pacifique-navy-800 transition-colors hover:text-pacifique-blue-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/suivre-ma-demande"
              className="text-sm font-medium text-pacifique-navy-700 transition-colors hover:text-pacifique-blue-600"
            >
              Suivre ma demande
            </Link>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-pacifique-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 transition-all duration-300 hover:bg-pacifique-red-600 hover:shadow-pacifique-red-500/40 active:scale-95"
            >
              S'inscrire
            </Link>
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
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-pacifique-navy-800 transition-colors hover:bg-pacifique-blue-50 hover:text-pacifique-blue-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 border-t border-gray-100 p-5">
            <Link
              to="/suivre-ma-demande"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full border border-pacifique-navy-900/15 bg-pacifique-navy-50 px-5 py-3 text-sm font-semibold text-pacifique-navy-800 transition-transform active:scale-95"
            >
              Suivre ma demande
            </Link>
            <Link
              to="/inscription"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full bg-pacifique-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 transition-transform active:scale-95"
            >
              S'inscrire
            </Link>
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
