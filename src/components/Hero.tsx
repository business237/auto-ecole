import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { SITE } from '@/lib/site';
import { useInfosSite, buildTelLink } from '@/lib/useSiteData';
import HeroSlider3D from './HeroSlider3D';

export default function Hero() {
  const { infos } = useInfosSite();
  const phone = infos?.telephone || SITE.phone;
  const telLink = buildTelLink(phone);

  return (
    <section id="accueil" className="relative overflow-hidden bg-pacifique-offwhite pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pacifique-blue-100/60 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-pacifique-red-100/50 blur-3xl" />
        {/* Faint road grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0d1f38" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Left — copy */}
        <div className="max-w-xl">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-pacifique-blue-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pacifique-blue-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-pacifique-red-500" />
            Auto-École Pacifique Bilingue • Kribi
          </span>

          <h1 className="animate-fade-up mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance [animation-delay:80ms] sm:text-5xl lg:text-[3.5rem]">
            <span className="text-pacifique-navy-900">Conduire, c'est un art.</span>
            <span className="block bg-gradient-to-r from-pacifique-blue-600 via-pacifique-blue-500 to-pacifique-red-500 bg-clip-text text-transparent">
              On vous l'enseigne.
            </span>
          </h1>

          {/* Highlighted keywords */}
          <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 [animation-delay:160ms]">
            {['Conduite', 'Sécurité', 'Confiance'].map((word, i) => (
              <span key={word} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-pacifique-red-500' : 'bg-pacifique-blue-500'}`} />
                <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-pacifique-navy-800">{word}</span>
              </span>
            ))}
          </div>

          <p className="animate-fade-up mt-6 text-base leading-relaxed text-pacifique-navy-700/75 [animation-delay:240ms] sm:text-lg">
            Formation théorique et pratique pour vous accompagner vers une conduite maîtrisée,
            responsable et adaptée aux exigences de la circulation.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:320ms] sm:flex-row sm:items-center">
            <Link
              to="/inscription"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-pacifique-red-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-pacifique-red-500/25 transition-all duration-300 hover:bg-pacifique-red-600 hover:shadow-pacifique-red-500/40 active:scale-95"
            >
              Commencer ma formation
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#apropos"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pacifique-navy-900/15 bg-white/60 px-7 py-3.5 text-sm font-bold text-pacifique-navy-900 transition-all duration-300 hover:border-pacifique-navy-900/30 hover:bg-white active:scale-95"
            >
              Découvrir Pacifique
            </a>
          </div>

          {/* Quick info */}
          <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-pacifique-navy-700/70 [animation-delay:400ms]">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pacifique-blue-600" />
              {infos?.adresse || SITE.address}
            </span>
            <a href={telLink} className="flex items-center gap-2 font-semibold transition-colors hover:text-pacifique-blue-600">
              <Phone className="h-4 w-4 text-pacifique-blue-600" />
              {phone}
            </a>
          </div>
        </div>

        {/* Right — 3D Visual Slider */}
        <div className="animate-fade-in relative [animation-delay:300ms]">
          <HeroSlider3D />
        </div>
      </div>

      {/* Animated road divider */}
      <div className="relative mx-auto mt-14 max-w-7xl px-5 lg:px-8" aria-hidden="true">
        <div className="relative h-px w-full bg-gradient-to-r from-transparent via-pacifique-navy-900/15 to-transparent">
          <div className="absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-pacifique-blue-500" />
          <div className="absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full bg-pacifique-red-500" />
        </div>
      </div>
    </section>
  );
}
