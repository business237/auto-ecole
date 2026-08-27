import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useGalerie } from '@/lib/useSiteData';

export default function Gallery() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { images, loading } = useGalerie();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));

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

  return (
    <section id="galerie" className="bg-pacifique-offwhite py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Galerie" title="La vie chez Pacifique." />

        {loading ? (
          <p className="mt-8 text-sm text-pacifique-navy-700/60">Chargement des photos...</p>
        ) : images.length === 0 ? (
          <p className="mt-8 text-sm text-pacifique-navy-700/60">Aucune photo pour l'instant.</p>
        ) : (
          <div
            className={`reveal mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${visible ? 'is-visible' : ''
              }`}
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                className="group overflow-hidden rounded-xl"
              >
                <img
                  src={img.url}
                  alt={img.alt ?? ''}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
          <button onClick={close} className="absolute right-5 top-5 text-white">
            <X size={28} />
          </button>
          <button onClick={prev} className="absolute left-4 text-white">
            <ChevronLeft size={32} />
          </button>
          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].alt ?? ''}
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
          />
          <button onClick={next} className="absolute right-4 text-white">
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}