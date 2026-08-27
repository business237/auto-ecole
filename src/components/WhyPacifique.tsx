import { Globe, Award, ShieldCheck, Car, Clock, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';

const REASONS = [
  {
    icon: Globe,
    title: 'Formation Bilingue',
    description: 'Cours théoriques et pratiques dispensés en Français et en Anglais pour s’adapter aux besoins de chaque apprenant.',
    highlight: 'Français & English',
  },
  {
    icon: Award,
    title: 'Excellence & Taux de Réussite',
    description: 'Une préparation rigoureuse à l’examen du permis de conduire grâce à une méthodologie axée sur les questions officielles.',
    highlight: 'Haut niveau de réussite',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité & Conduite Responsable',
    description: 'Sensibilisation constante au civisme routier, au respect de la vie humaine et à l’anticipation des dangers de la route.',
    highlight: 'Priorité sécurité',
  },
  {
    icon: Car,
    title: 'Véhicules Récents & Entretenus',
    description: 'Apprentissage sur des véhicules modernes et régulièrement contrôlés pour votre sécurité et votre confort de conduite.',
    highlight: 'Confort & Sécurité',
  },
  {
    icon: Clock,
    title: 'Horaires Souples & Adaptables',
    description: 'Des sessions du matin, du soir ou du week-end pour s’adapter au rythme de travail des étudiants et des professionnels.',
    highlight: 'Emploi du temps flexible',
  },
  {
    icon: CheckCircle2,
    title: 'Moniteurs Certifiés & Pédagogues',
    description: 'Une équipe d’instructeurs expérimentés, patients et à l’écoute de votre progression pas à pas.',
    highlight: 'Accompagnement humain',
  },
];

export default function WhyPacifique() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="bg-pacifique-offwhite py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Pourquoi nous choisir"
            title="Pourquoi choisir Auto-École Pacifique ?"
            subtitle="Nous ne formons pas seulement des conducteurs pour réussir un examen, nous vous apprenons à maîtriser le volant en toute sérénité."
            centered
          />
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`reveal group relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-pacifique-navy-900/5 ${
                  visible ? 'is-visible' : ''
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pacifique-blue-50 text-pacifique-blue-600 transition-colors group-hover:bg-pacifique-blue-600 group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-pacifique-offwhite px-3 py-1 text-xs font-semibold text-pacifique-navy-800">
                      {item.highlight}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-bold text-pacifique-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-pacifique-navy-700/75">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-pacifique-blue-600 group-hover:text-pacifique-red-500 transition-colors">
                  <span>En savoir plus</span>
                  <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
