import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import WhyPacifique from '@/components/WhyPacifique';
import FAQ from '@/components/FAQ';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useFormationsParCategorie } from '@/lib/useSiteData';
import FormationCard from '@/components/FormationCard';

export default function Home() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const { categories = [], loading } = useFormationsParCategorie();
    const featuredFormations = categories
        .flatMap((category) => category.formations
            .filter((formation) => formation.mis_en_avant)
            .map((formation) => ({ formation, categoryTitle: category.titre })))
        .sort((first, second) => first.formation.ordre - second.formation.ordre);

    return (
        <>
            <Hero />
            <WhyPacifique />

            <section className="bg-pacifique-offwhite py-20 lg:py-28">
                <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className={`reveal ${visible ? 'is-visible' : ''}`}>
                        <SectionHeading
                            eyebrow="À la une"
                            title="Nos permis en vedette"
                            subtitle="Découvrez les formations que nous recommandons pour commencer votre parcours avec confiance."
                            centered
                        />
                    </div>

                    {loading ? (
                        <div className="mt-16 flex justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pacifique-blue-600 border-t-transparent" />
                        </div>
                    ) : featuredFormations.length === 0 ? (
                        <p className="mt-16 text-center text-sm text-pacifique-navy-700/60">
                            Les formations seront bientôt disponibles.
                        </p>
                    ) : (
                        <div className="mt-16 flex gap-6 overflow-x-auto pb-4">
                            {featuredFormations.map(({ formation, categoryTitle }, idx) => {
                                return (
                                    <div
                                        key={formation.id}
                                        className={`reveal min-w-[280px] flex-[0_0_280px] sm:min-w-[310px] sm:flex-[0_0_310px] lg:min-w-[300px] lg:flex-[0_0_300px] ${visible ? 'is-visible' : ''}`}
                                        style={{ transitionDelay: `${idx * 80}ms` }}
                                    >
                                        <FormationCard
                                            formation={formation}
                                            categoryTitle={categoryTitle}
                                            href={`/inscription?formation=${formation.id}`}
                                            buttonLabel="S'inscrire"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={`reveal mt-12 flex justify-center ${visible ? 'is-visible' : ''}`}>
                        <Link
                            to="/permis"
                            className="inline-flex items-center gap-2 rounded-2xl bg-pacifique-navy-900 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-pacifique-navy-900/20 transition-all hover:-translate-y-0.5 hover:bg-pacifique-blue-600 hover:shadow-pacifique-blue-600/30 active:scale-[0.98]"
                        >
                            Voir tous nos permis
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <FAQ />
        </>
    );
}