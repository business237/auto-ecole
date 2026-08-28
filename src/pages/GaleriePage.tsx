import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useGalerie } from '@/lib/useSiteData';

export default function GaleriePage() {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const { images, loading } = useGalerie();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const close = () => setLightboxIndex(null);
    const prev = () => setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    const next = () => setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, images.length]);

    const current = lightboxIndex !== null ? images[lightboxIndex] : null;

    return (
        <section className="bg-pacifique-offwhite pt-32 pb-20 lg:pt-40 lg:pb-28">
            <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading
                    eyebrow="Galerie"
                    title="La vie chez Pacifique."
                    subtitle="Nos élèves, nos véhicules et nos sessions de formation en images."
                    centered
                />

                {loading ? (
                    <p className="mt-12 text-center text-sm text-pacifique-navy-700/60">Chargement des photos...</p>
                ) : images.length === 0 ? (
                    <p className="mt-12 text-center text-sm text-pacifique-navy-700/60">Aucune photo pour l'instant.</p>
                ) : (
                    <div className={`reveal mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${visible ? 'is-visible' : ''}`}>
                        {images.map((img, i) => (
                            <button key={img.id} onClick={() => setLightboxIndex(i)} className="group relative overflow-hidden rounded-2xl">
                                <img
                                    src={img.url}
                                    alt={img.alt ?? ''}
                                    loading="lazy"
                                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                {img.description && (
                                    <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        {img.description}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {current && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 px-4 py-6">
                    <button onClick={close} className="absolute right-5 top-5 text-white/80 hover:text-white">
                        <X size={28} />
                    </button>

                    <div className="flex flex-1 items-center justify-center gap-4">
                        <button onClick={prev} className="hidden text-white/70 hover:text-white sm:block">
                            <ChevronLeft size={36} />
                        </button>

                        <div className="flex max-h-[75vh] max-w-[85vw] flex-col items-center">
                            <img src={current.url} alt={current.alt ?? ''} className="max-h-[70vh] max-w-full rounded-lg object-contain" />
                            {current.description && (
                                <p className="mt-4 max-w-xl text-center text-sm text-white/80">{current.description}</p>
                            )}
                            <p className="mt-2 text-xs text-white/40">{lightboxIndex! + 1} / {images.length}</p>
                        </div>

                        <button onClick={next} className="hidden text-white/70 hover:text-white sm:block">
                            <ChevronRight size={36} />
                        </button>
                    </div>

                    <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                        {images.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => setLightboxIndex(i)}
                                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${i === lightboxIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
                                    }`}
                            >
                                <img src={img.url} alt="" className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 flex justify-center gap-8 sm:hidden">
                        <button onClick={prev} className="text-white/70 hover:text-white"><ChevronLeft size={28} /></button>
                        <button onClick={next} className="text-white/70 hover:text-white"><ChevronRight size={28} /></button>
                    </div>
                </div>
            )}
        </section>
    );
}