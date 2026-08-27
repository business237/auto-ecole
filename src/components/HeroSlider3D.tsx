import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Navigation } from 'lucide-react';

const HERO_SLIDES = [
  {
    src: '/images/hero1.jpg',
    alt: "Leçon de conduite pratique avec moniteur Auto-École Pacifique",
    tag: "Formation Pratique",
    title: "Maîtrise & Sérénité au Volant",
  },
  {
    src: '/images/hero2.jpg',
    alt: "Élève au volant en situation réelle de conduite à Kribi",
    tag: "Circulation Réelle",
    title: "Conduite en Ville et Autoroute",
  },
  {
    src: '/images/hero3.jpg',
    alt: "Séance de code de la route et sécurité routière bilingue",
    tag: "Sécurité Routière",
    title: "Code Bilingue Français & Anglais",
  },
  {
    src: '/images/hero4.jpg',
    alt: "Parc de véhicules modernes de l'Auto-École Pacifique",
    tag: "Véhicules Récents",
    title: "Confort & Climatisation",
  },
  {
    src: '/images/hero5.jpg',
    alt: "Moniteurs diplômés et accompagnement personnalisé",
    tag: "Pédagogie Positive",
    title: "Moniteurs Certifiés & Patients",
  },
];

export default function HeroSlider3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const total = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  // Interactive 3D tilt effect on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 6; // max 6 deg
    const rotateX = -(y / (rect.height / 2)) * 6; // max 6 deg
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Main Stage Container */}
      <div
        className="relative aspect-[4/3] w-full rounded-3xl transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background 3D Depth Card Shadows */}
        <div
          className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-pacifique-navy-900/30 via-pacifique-blue-500/20 to-pacifique-red-500/20 blur-xl opacity-75 -z-10 transition-all duration-500"
          style={{ transform: 'translateZ(-40px)' }}
        />

        {/* Slides Stack */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/20 bg-pacifique-navy-950 shadow-2xl shadow-pacifique-navy-950/40">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const isPrev = idx === (currentIndex - 1 + total) % total;
            const isNext = idx === (currentIndex + 1) % total;

            let transformClass = 'opacity-0 scale-95 pointer-events-none translate-x-full';
            if (isActive) {
              transformClass = 'opacity-100 scale-100 z-20 translate-x-0';
            } else if (isPrev) {
              transformClass = 'opacity-0 scale-95 -translate-x-full z-10';
            } else if (isNext) {
              transformClass = 'opacity-0 scale-95 translate-x-full z-10';
            }

            return (
              <div
                key={slide.src}
                className={`absolute inset-0 transition-all duration-700 ease-out ${transformClass}`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-pacifique-navy-950/80 via-pacifique-navy-950/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-pacifique-navy-950/40 via-transparent to-transparent" />

                {/* Slide Caption Info */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pacifique-red-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {slide.tag}
                  </span>
                  <h3 className="font-display text-base font-bold sm:text-lg text-white drop-shadow-md">
                    {slide.title}
                  </h3>
                </div>
              </div>
            );
          })}

          {/* Top Progress Bar & Counter */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 bg-pacifique-navy-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold text-white shadow-lg">
              <span className="text-pacifique-blue-400 font-extrabold">
                0{currentIndex + 1}
              </span>
              <span className="text-white/40">/</span>
              <span className="text-white/70">0{total}</span>
            </div>

            {/* Progress Segment Bars */}
            <div className="flex items-center gap-1 bg-pacifique-navy-950/60 backdrop-blur-md p-1 rounded-full border border-white/10">
              {HERO_SLIDES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentIndex
                      ? 'w-6 bg-pacifique-red-500'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Aller au slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide précédent"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-pacifique-navy-950/60 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 hover:bg-pacifique-red-500 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide suivant"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-pacifique-navy-950/60 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 hover:bg-pacifique-red-500 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 3D Floating badge — Speedometer / Maîtrise */}
        <div
          className="absolute -left-5 top-10 hidden animate-float-soft rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-2xl shadow-pacifique-navy-900/20 border border-white/60 sm:block z-30 transition-transform duration-300"
          style={{ transform: 'translateZ(35px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
              <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
                <path d="M8 36a16 16 0 1 1 32 0" stroke="#1d6fe0" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M24 36l-6-10" stroke="#e83333" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="24" cy="36" r="2.5" fill="#0d1f38" />
              </svg>
            </div>
            <div>
              <p className="font-display text-xs font-extrabold text-pacifique-navy-900 leading-tight">Maîtrise</p>
              <p className="text-[10px] font-semibold text-pacifique-navy-700/70">au volant</p>
            </div>
          </div>
        </div>

        {/* 3D Floating badge — Safety */}
        <div
          className="absolute -right-4 bottom-8 hidden animate-float-soft rounded-2xl bg-pacifique-navy-900/95 backdrop-blur-md p-3.5 shadow-2xl shadow-pacifique-navy-950/40 border border-white/15 [animation-delay:1.2s] sm:block z-30 transition-transform duration-300"
          style={{ transform: 'translateZ(45px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pacifique-blue-500/20 text-pacifique-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xs font-extrabold text-white leading-tight">Sécurité</p>
              <p className="text-[10px] font-medium text-pacifique-blue-200/80">routière</p>
            </div>
          </div>
        </div>

        {/* 3D Floating badge — Navigation Kribi */}
        <div
          className="absolute right-6 -top-4 hidden animate-float-soft rounded-xl bg-gradient-to-r from-pacifique-red-500 to-pacifique-red-600 px-3.5 py-1.5 shadow-xl shadow-pacifique-red-500/35 border border-white/20 [animation-delay:2.2s] lg:flex lg:items-center lg:gap-1.5 z-30"
          style={{ transform: 'translateZ(50px)' }}
        >
          <Navigation className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-extrabold text-white">Kribi • Dombe</span>
        </div>
      </div>
    </div>
  );
}
