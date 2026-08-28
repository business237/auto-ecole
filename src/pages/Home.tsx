import { ArrowRight, GraduationCap, ClipboardList, Images, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import WhyPacifique from '@/components/WhyPacifique';
import FAQ from '@/components/FAQ';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';

const TEASERS = [
    { to: '/a-propos', icon: GraduationCap, title: 'À propos', desc: "Pacifique, l'écosystème AFJANES et notre équipe." },
    { to: '/formations', icon: ClipboardList, title: 'Nos formations', desc: 'Permis, tarifs détaillés et notre méthode.' },
    { to: '/galerie', icon: Images, title: 'Galerie', desc: 'La vie chez Pacifique en images.' },
    { to: '/contact', icon: PhoneCall, title: 'Contact', desc: 'Adresse, horaires et formulaire de contact.' },
];

export default function Home() {
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
        <>
            <Hero />
            <WhyPacifique />

            <section className="bg-white py-20 lg:py-28">
                <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className={`reveal ${visible ? 'is-visible' : ''}`}>
                        <SectionHeading eyebrow="Explorer" title="Tout savoir sur Pacifique" centered />
                    </div>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {TEASERS.map((t) => {
                            const Icon = t.icon;
                            return (
                                <Link
                                    key={t.to}
                                    to={t.to}
                                    className="group flex flex-col rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pacifique-offwhite text-pacifique-navy-900 transition-colors group-hover:bg-pacifique-navy-900 group-hover:text-white">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 font-display text-lg font-bold text-pacifique-navy-900">{t.title}</h3>
                                    <p className="mt-2 text-sm text-pacifique-navy-700/70">{t.desc}</p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pacifique-blue-600">
                                        Découvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <FAQ />
        </>
    );
}