import { Building2, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { SITE } from '@/lib/site';
import { useReveal } from '@/lib/hooks';
import { usePersonnel } from '@/lib/useSiteData';

export default function APropos() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const { personnel, loading } = usePersonnel();

    return (
        <>
            <section className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
                <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
                            <SectionHeading eyebrow="À propos" title="Pacifique, une école de conduite à Kribi." />
                            <div className="mt-6 space-y-4 text-base leading-relaxed text-pacifique-navy-700/80">
                                <p>
                                    <strong className="font-semibold text-pacifique-navy-900">Auto-École Pacifique Bilingue</strong> est
                                    une école de conduite située à Kribi, au Cameroun. Elle propose une formation complète
                                    alliant apprentissage théorique du code de la route et pratique de la conduite.
                                </p>
                                <p>
                                    L'établissement place la <strong className="font-semibold text-pacifique-navy-900">sécurité routière</strong> et
                                    la <strong className="font-semibold text-pacifique-navy-900">conduite responsable</strong> au cœur de
                                    son enseignement, afin de former des conducteurs conscients, vigilants et respectueux des autres usagers.
                                </p>
                            </div>

                            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                                {['Formation théorique', 'Formation pratique', 'Sécurité routière', 'Conduite responsable'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 rounded-xl bg-pacifique-offwhite px-4 py-3 text-sm font-medium text-pacifique-navy-800">
                                        <span className="h-2 w-2 rounded-full bg-pacifique-red-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

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

                                <div className="mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                                    <div className="mx-auto w-fit rounded-xl bg-pacifique-blue-500/20 px-5 py-3 text-center">
                                        <p className="font-display text-base font-bold text-white">{SITE.group}</p>
                                    </div>
                                    <div className="mx-auto my-3 h-6 w-px bg-pacifique-blue-400/40" />
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
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-sm text-pacifique-blue-100/70">
                                    <MapPin className="h-4 w-4 text-pacifique-blue-400 flex-shrink-0" />
                                    <span>{SITE.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Localisation & Google Maps */}
            <section className="bg-white py-12 border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <SectionHeading
                        eyebrow="Localisation"
                        title="Où nous trouver à Kribi"
                        subtitle={`Notre auto-école est située à ${SITE.address}. Retrouvez-nous facilement grâce au plan ci-dessous.`}
                    />
                    <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 shadow-md">
                        <iframe
                            title="Localisation Auto-École Pacifique Bilingue — Kribi, Dombe - Derrière Bocom"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7969.042066210782!2d9.90363749889458!3d2.952812660318641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1062fd76f8bf1c87%3A0xe39c575223d74fb1!2sAuto%20Ecole%20Pacifique%20Bilingue!5e0!3m2!1sfr!2scm!4v1788619309038!5m2!1sfr!2scm"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                </div>
            </section>

            <section className="bg-pacifique-offwhite py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <SectionHeading eyebrow="Notre équipe" title="Le personnel de Pacifique" centered />

                    {loading ? (
                        <p className="mt-12 text-center text-sm text-pacifique-navy-700/60">Chargement...</p>
                    ) : personnel.length === 0 ? (
                        <p className="mt-12 text-center text-sm text-pacifique-navy-700/60">L'équipe sera bientôt présentée ici.</p>
                    ) : (
                        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {personnel.map((p) => (
                                <div key={p.id} className="rounded-3xl bg-white p-6 text-center shadow-sm">
                                    <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-pacifique-navy-100">
                                        {p.photo_url ? (
                                            <img src={p.photo_url} alt={p.nom} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-pacifique-navy-400">
                                                {p.nom.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mt-4 font-display text-lg font-bold text-pacifique-navy-900">{p.nom}</h3>
                                    <p className="text-sm font-medium text-pacifique-blue-600">{p.role}</p>
                                    {p.bio && <p className="mt-3 text-sm text-pacifique-navy-700/70">{p.bio}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}