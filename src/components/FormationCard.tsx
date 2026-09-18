import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Formation } from '@/lib/database.types';
import { reductionActive } from '@/lib/useSiteData';
import PermisIcon, { getPermisCategory } from '@/components/ui/PermisIcon';

type FormationCardProps = {
  formation: Formation;
  categoryTitle?: string;
  href: string;
  buttonLabel?: string;
};

function fallbackBackground(type: ReturnType<typeof getPermisCategory>['type']) {
  switch (type) {
    case 'A':
      return 'bg-gradient-to-br from-amber-500 to-orange-700';
    case 'C':
      return 'bg-gradient-to-br from-orange-500 to-red-700';
    case 'D':
      return 'bg-gradient-to-br from-purple-500 to-indigo-800';
    case 'G':
      return 'bg-gradient-to-br from-emerald-500 to-teal-800';
    case 'CODE':
      return 'bg-gradient-to-br from-indigo-500 to-blue-900';
    case 'B':
    default:
      return 'bg-gradient-to-br from-pacifique-blue-500 to-pacifique-navy-900';
  }
}

export default function FormationCard({
  formation,
  categoryTitle,
  href,
  buttonLabel = "S'inscrire",
}: FormationCardProps) {
  const visualCategory = getPermisCategory(formation.titre);
  const priceLabel = formation.prix != null
    ? `${formation.prix.toLocaleString('fr-FR')} ${formation.devise}`
    : null;

  return (
    <article className="group relative min-h-[360px] overflow-hidden rounded-3xl bg-pacifique-navy-900 shadow-lg shadow-pacifique-navy-900/15 transition-transform duration-300 hover:-translate-y-1">
      {formation.image_url ? (
        <img
          src={formation.image_url}
          alt={formation.titre}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${fallbackBackground(visualCategory.type)}`}>
          <PermisIcon titre={formation.titre} className="h-20 w-20 text-white/90" size={80} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative flex min-h-[360px] flex-col justify-end p-6 text-white">
        <span className="mb-3 w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {categoryTitle || visualCategory.label.split('•')[0].trim()}
        </span>
        <h3 className="font-display text-xl font-bold leading-snug">{formation.titre}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {priceLabel && (
            reductionActive(formation) ? (
              <>
                <span className="text-xs text-white/60 line-through">{priceLabel}</span>
                <span className="text-base font-bold text-white">
                  {formation.prix_reduit?.toLocaleString('fr-FR')} {formation.devise}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-white">{priceLabel}</span>
            )
          )}
          {formation.duree && <span className="text-xs text-white/75">{formation.duree}</span>}
        </div>

        <Link
          to={href}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-3 text-xs font-bold text-pacifique-navy-900 transition-colors hover:bg-white active:scale-[0.98]"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
