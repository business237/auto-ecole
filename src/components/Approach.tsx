import { BookCheck, MapPin, Trophy } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';

// Custom steering wheel fallback if needed
function SteeringWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0 0 20" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="15" x2="12" y2="22" />
      <line x1="9.5" y1="9.5" x2="3.5" y2="6.5" />
      <line x1="14.5" y1="9.5" x2="20.5" y2="6.5" />
    </svg>
  );
}

const STEPS = [
  {
    step: '01',
    title: 'Code de la Route Bilingue',
    icon: BookCheck,
    desc: 'Cours interactifs en Français et Anglais. Apprentissage approfondi des panneaux, de la priorité et du civisme routier.',
  },
  {
    step: '02',
    title: 'Maîtrise du Véhicule',
    icon: SteeringWheel,
    desc: 'Prise en main du poste de conduite, embrayage, passage de vitesses et manœuvres fondamentales sur terrain sécurisé.',
  },
  {
    step: '03',
    title: 'Circulation en Ville',
    icon: MapPin,
    desc: 'Mise en situation réelle dans les rues de Kribi, gestion des intersections, ronds-points et adaptation à la vitesse.',
  },
  {
    step: '04',
    title: 'Examens Blancs & Permis',
    icon: Trophy,
    desc: 'Tests en conditions réelles d’examen pour valider vos acquis et aborder l’épreuve officielle en toute sérénité.',
  },
];

export default function Approach() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="approche" className="bg-white py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Notre approche"
            title="Une méthode pédagogique structurée et progressive"
            subtitle="Chaque étape de votre apprentissage est pensée pour développer votre autonomie et votre assurance au volant."
            centered
          />
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className={`reveal group relative flex flex-col justify-between rounded-3xl bg-pacifique-offwhite p-8 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-pacifique-navy-900/5 ${
                  visible ? 'is-visible' : ''
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold text-pacifique-blue-600/30 group-hover:text-pacifique-blue-600 transition-colors">
                      {s.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-pacifique-navy-900 group-hover:bg-pacifique-navy-900 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="mt-6 font-display text-lg font-bold text-pacifique-navy-900">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-pacifique-navy-700/75">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-pacifique-blue-600">
                  <span>Étape {idx + 1} / 4</span>
                  <span className="h-2 w-2 rounded-full bg-pacifique-red-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
