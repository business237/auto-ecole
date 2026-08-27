import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useFormations, useInfosSite, buildWhatsappLink } from '@/lib/useSiteData';
import { useAuth } from '@/lib/useAuth';
import PermisIcon, { getPermisCategory } from '@/components/ui/PermisIcon';

export default function Formation() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { formations, loading } = useFormations();
  const { infos } = useInfosSite();
  const { isAuthenticated } = useAuth();

  return (
    <section id="formations" className="bg-white py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Nos Formations"
            title="Des formules adaptées à tous vos besoins"
            subtitle="Découvrez nos programmes d'apprentissage conçus pour vous mener au succès avec sérénité."
            centered
          />
        </div>

        {loading ? (
          <p className="mt-16 text-center text-sm text-pacifique-navy-700/60">
            Chargement des formations...
          </p>
        ) : formations.length === 0 ? (
          <p className="mt-16 text-center text-sm text-pacifique-navy-700/60">
            Les formations seront bientôt disponibles.
          </p>
        ) : (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {formations.map((f, idx) => {
              const popular = idx === 0;
              const priceLabel =
                f.prix != null ? `${f.prix.toLocaleString('fr-FR')} ${f.devise}` : null;
              const category = getPermisCategory(f.titre);

              // Target link depending on authentication
              const targetLink = isAuthenticated
                ? `/mon-compte/nouvelle-demande?formation=${f.id}`
                : `/inscription?formation=${f.id}`;

              const buttonLabel = isAuthenticated ? 'Se former' : "S'inscrire";

              return (
                <div
                  key={f.id}
                  className={`reveal relative flex flex-col justify-between rounded-3xl border ${
                    popular
                      ? 'border-pacifique-blue-500 bg-gradient-to-b from-pacifique-blue-50/40 to-white shadow-xl shadow-pacifique-blue-500/10'
                      : 'border-gray-200/80 bg-white shadow-sm hover:shadow-lg'
                  } p-7 transition-all duration-300 ${visible ? 'is-visible' : ''}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-pacifique-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="h-3 w-3" />
                      Le plus populaire
                    </div>
                  )}

                  <div>
                    {/* Top Row: Specific Permis Icon + Duration Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-2xl p-2.5 transition-transform hover:scale-105 shadow-sm ${
                          popular
                            ? 'bg-pacifique-blue-600 text-white shadow-pacifique-blue-600/30'
                            : 'bg-pacifique-navy-900 text-white shadow-pacifique-navy-900/20'
                        }`}
                        title={category.label}
                      >
                        <PermisIcon titre={f.titre} className="h-7 w-7" size={28} />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${category.badgeBg} ${category.badgeText}`}>
                          {category.label.split('•')[0]}
                        </span>
                        {f.duree && (
                          <span className="text-[11px] font-semibold text-pacifique-navy-700/70 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {f.duree}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-pacifique-navy-900 leading-snug">
                      {f.titre}
                    </h3>

                    {priceLabel && (
                      <p className="mt-1 text-sm font-extrabold text-pacifique-blue-600">
                        {priceLabel}
                      </p>
                    )}

                    {f.description && (
                      <p className="mt-2 text-xs leading-relaxed text-pacifique-navy-700/70">
                        {f.description}
                      </p>
                    )}

                    {f.inclus && f.inclus.length > 0 && (
                      <ul className="mt-6 space-y-2.5">
                        {f.inclus.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs text-pacifique-navy-800">
                            <Check className="h-4 w-4 flex-shrink-0 text-pacifique-blue-600 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Bottom Action Section */}
                  <div className="mt-8 pt-4 border-t border-gray-100 space-y-2.5">
                    <Link
                      to={targetLink}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
                        popular
                          ? 'bg-pacifique-red-500 text-white hover:bg-pacifique-red-600 shadow-md shadow-pacifique-red-500/25'
                          : 'bg-pacifique-navy-900 text-white hover:bg-pacifique-navy-800'
                      }`}
                    >
                      <span>{buttonLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <a
                      href={buildWhatsappLink(
                        infos?.whatsapp,
                        `Bonjour, je souhaite obtenir plus d'informations sur la formation : ${f.titre}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-pacifique-navy-700/60 hover:text-emerald-700 py-1 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Renseignements WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}