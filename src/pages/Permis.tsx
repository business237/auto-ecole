import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useFormationsParCategorie } from '@/lib/useSiteData';
import FormationCard from '@/components/FormationCard';

export default function Permis() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { categories = [], loading } = useFormationsParCategorie();
  const hasFormations = categories.some((category) => category.formations.length > 0);

  return (
    <main className="bg-pacifique-offwhite pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Catalogue"
            title="Tous nos permis"
            subtitle="Explorez toutes nos formations actives et choisissez le parcours adapté à votre projet."
            centered
          />
        </div>

        {loading ? (
          <p className="mt-16 text-center text-sm text-pacifique-navy-700/60">Chargement des formations...</p>
        ) : !hasFormations ? (
          <p className="mt-16 text-center text-sm text-pacifique-navy-700/60">Les formations seront bientôt disponibles.</p>
        ) : (
          <div className="mt-16 space-y-16">
            {categories.map((category) => {
              if (category.formations.length === 0) return null;

              return (
                <section key={category.id}>
                  <h2 className="mb-8 font-display text-2xl font-bold text-pacifique-navy-900">{category.titre}</h2>
                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {category.formations.map((formation, index) => (
                      <div
                        key={formation.id}
                        className={`reveal min-w-[280px] flex-[0_0_280px] sm:min-w-[310px] sm:flex-[0_0_310px] lg:min-w-[300px] lg:flex-[0_0_300px] ${visible ? 'is-visible' : ''}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <FormationCard
                          formation={formation}
                          categoryTitle={category.titre}
                          href={`/inscription?formation=${formation.id}`}
                          buttonLabel="S'inscrire"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
