import { Building2, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { SITE } from '@/lib/site';
import { useReveal } from '@/lib/hooks';

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="apropos" className="bg-white py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — About Pacifique */}
          <div className={`reveal ${visible ? 'is-visible' : ''}`}>
            <SectionHeading
              eyebrow="À propos"
              title="Pacifique, une école de conduite à Kribi."
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-pacifique-navy-700/80">
              <p>
                <strong className="font-semibold text-pacifique-navy-900">Auto-École Pacifique Bilingue</strong> est
                une école de conduite située à Kribi, au Cameroun. Elle propose une formation complète
                alliant apprentissage théorique du code de la route et pratique de la conduite.
              </p>
              <p>
                L'établissement place la <strong className="font-semibold text-pacifique-navy-900">sécurité routière</strong> et la
                <strong className="font-semibold text-pacifique-navy-900"> conduite responsable</strong> au cœur de son enseignement,
                afin de former des conducteurs conscients, vigilants et respectueux des autres usagers.
              </p>
            </div>

            {/* Key points */}
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'Formation théorique',
                'Formation pratique',
                'Sécurité routière',
                'Conduite responsable',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-xl bg-pacifique-offwhite px-4 py-3 text-sm font-medium text-pacifique-navy-800">
                  <span className="h-2 w-2 rounded-full bg-pacifique-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — AFJANES Group */}
          <div className={`reveal ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: '150ms' }}>
            <div className="rounded-3xl bg-gradient-to-br from-pacifique-navy-900 to-pacifique-navy-800 p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pacifique-blue-500/15 text-pacifique-blue-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-pacifique-blue-300">
                  Membre d'AFJANES Group
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-bold text-white">Un écosystème de formation</h3>
              <p className="mt-3 text-sm leading-relaxed text-pacifique-blue-100/80">
                Auto-École Pacifique s'inscrit dans l'écosystème d'AFJANES GROUP, une structure qui rassemble
                plusieurs activités et établissements, notamment dans le domaine de la formation à la conduite.
              </p>

              {/* Group structure diagram */}
              <div className="mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                {/* Parent */}
                <div className="mx-auto w-fit rounded-xl bg-pacifique-blue-500/20 px-5 py-3 text-center">
                  <p className="font-display text-base font-bold text-white">{SITE.group}</p>
                </div>

                {/* Connector */}
                <div className="mx-auto my-3 h-6 w-px bg-pacifique-blue-400/40" />

                {/* Children */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-pacifique-red-400/30 bg-pacifique-red-500/10 px-4 py-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-pacifique-red-300">Auto-École</p>
                    <p className="mt-0.5 font-display text-sm font-bold text-white">Pacifique</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-pacifique-blue-300">Auto-École</p>
                    <p className="mt-0.5 font-display text-sm font-medium text-pacifique-blue-200">{SITE.siblingSchool}</p>
                  </div>
                </div>
                <p className="mt-4 text-center text-[11px] text-pacifique-blue-200/50">
                  Le nom de la seconde auto-école sera renseigné dès confirmation.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-pacifique-blue-100/70">
                <MapPin className="h-4 w-4 text-pacifique-blue-400" />
                {SITE.address}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
