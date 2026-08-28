import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffreActive } from '@/lib/useSiteData';

function getTimeLeft(dateFin: string) {
    const diff = new Date(dateFin).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
        jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
        heures: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        secondes: Math.floor((diff / 1000) % 60),
    };
}

export default function PromoBanner() {
    const { offre } = useOffreActive();
    const [dismissed, setDismissed] = useState(false);
    const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);

    useEffect(() => {
        if (!offre) return;
        if (sessionStorage.getItem(`offre_dismissed_${offre.id}`) === '1') {
            setDismissed(true);
        }
    }, [offre]);

    useEffect(() => {
        if (!offre) return;
        setTimeLeft(getTimeLeft(offre.date_fin));
        const interval = setInterval(() => {
            const t = getTimeLeft(offre.date_fin);
            setTimeLeft(t);
            if (!t) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [offre]);

    if (!offre || dismissed || !timeLeft) return null;

    function handleDismiss() {
        sessionStorage.setItem(`offre_dismissed_${offre!.id}`, '1');
        setDismissed(true);
    }

    return (
        <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-xs animate-fade-up rounded-2xl bg-gradient-to-br from-pacifique-red-600 to-pacifique-red-500 p-4 pr-9 text-white shadow-2xl shadow-pacifique-red-500/30 sm:max-w-sm">
            <button
                onClick={handleDismiss}
                className="absolute right-2.5 top-2.5 text-white/70 transition hover:text-white"
                aria-label="Fermer"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 text-sm font-bold">
                <Sparkles className="h-4 w-4" />
                {offre.titre}
            </div>

            {offre.description && (
                <p className="mt-1 text-xs leading-relaxed text-white/85">{offre.description}</p>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold tabular-nums">
                    {timeLeft.jours > 0 && `${timeLeft.jours}j `}
                    {String(timeLeft.heures).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.secondes).padStart(2, '0')}
                </span>
                {offre.lien && (
                    <Link to={offre.lien} className="text-xs font-bold underline underline-offset-2 hover:text-white/90">
                        Voir l'offre →
                    </Link>
                )}
            </div>
        </div>
    );
}