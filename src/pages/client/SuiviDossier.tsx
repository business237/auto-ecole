import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
    Bell,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Copy,
    CreditCard,
    FileText,
    GraduationCap,
    Home,
    Menu,
    MessageCircle,
    Phone,
    PlayCircle,
    Shield,
    X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildWhatsappLink, useInfosSite } from '@/lib/useSiteData';
import type { Formation } from '@/lib/database.types';
import PermisIcon, { getPermisCategory } from '@/components/ui/PermisIcon';

/* ─── Types ──────────────────────────────────────────────── */

type Resultat = {
    numero_dossier: string;
    token_acces: string;
    telephone: string;
    nom: string;
    prenom: string;
    statut: string;
    formation_id: string | null;
    formation_titre: string | null;
    created_at: string;
    paiement_statut: string | null;
    paiement_reference: string | null;
};

/* ─── Constants ──────────────────────────────────────────── */

type NavItem = { label: string; icon: typeof Home; active?: boolean };

const NAVIGATION: NavItem[] = [
    { label: 'Mon dossier', icon: Home, active: true },
    { label: 'Ma formation', icon: GraduationCap },
    { label: 'Mes paiements', icon: CreditCard },
    { label: 'Mes documents', icon: FileText },
    { label: 'Mon planning', icon: CalendarDays },
    { label: 'Contacter Pacifique', icon: MessageCircle },
];

/* ─── Helpers ────────────────────────────────────────────── */

type EtapeConfig = {
    num: number;
    title: string;
    sub: string;
    state: 'completed' | 'active' | 'pending';
};

function get4Etapes(r: Resultat, dateLabel: string): EtapeConfig[] {
    const isPaiementConfirme = r.paiement_statut === 'confirme';
    const isTermine = r.statut === 'termine';
    const isValid = r.statut === 'valide' || r.statut === 'formation_en_cours';

    return [
        {
            num: 1,
            title: 'Inscription effectuée',
            sub: dateLabel,
            state: 'completed',
        },
        {
            num: 2,
            title: isPaiementConfirme ? 'Paiement confirmé' : 'En attente',
            sub: isPaiementConfirme ? dateLabel : 'En attente',
            state: isPaiementConfirme ? 'completed' : 'active',
        },
        {
            num: 3,
            title: (isTermine || isValid) ? 'Formation en cours' : 'À venir',
            sub: isTermine ? dateLabel : (isValid ? 'En cours' : 'À venir'),
            state: isTermine ? 'completed' : (isValid ? 'active' : 'pending'),
        },
        {
            num: 4,
            title: 'Dossier terminé',
            sub: isTermine ? dateLabel : 'À venir',
            state: isTermine ? 'completed' : 'pending',
        },
    ];
}

function paymentLabel(status: string | null): string {
    if (status === 'confirme') return 'Payé';
    if (status === 'rejete') return 'Rejeté';
    if (status) return 'En attente';
    return 'Aucun paiement';
}

function paymentBadge(status: string | null): string {
    if (status === 'confirme') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejete') return 'bg-pacifique-red-100 text-pacifique-red-600';
    if (status) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-500';
}

function paymentDot(status: string | null): string {
    if (status === 'confirme') return 'bg-emerald-500';
    if (status === 'rejete') return 'bg-pacifique-red-500';
    if (status) return 'bg-orange-400';
    return 'bg-gray-400';
}

function fallbackGradient(titre: string): string {
    const { type } = getPermisCategory(titre);
    switch (type) {
        case 'A': return 'bg-gradient-to-br from-amber-500 to-orange-700';
        case 'C': return 'bg-gradient-to-br from-orange-500 to-red-700';
        case 'D': return 'bg-gradient-to-br from-purple-500 to-indigo-800';
        case 'G': return 'bg-gradient-to-br from-emerald-500 to-teal-800';
        case 'CODE': return 'bg-gradient-to-br from-indigo-500 to-blue-900';
        default: return 'bg-gradient-to-br from-pacifique-blue-500 to-pacifique-navy-900';
    }
}

/* ─── Sub-components ─────────────────────────────────────── */

function FormationVisual({ formation, className = '' }: { formation: Formation; className?: string }) {
    return formation.image_url ? (
        <img src={formation.image_url} alt={formation.titre} className={`h-full w-full object-cover ${className}`} />
    ) : (
        <div className={`flex h-full w-full items-center justify-center ${fallbackGradient(formation.titre)} ${className}`}>
            <PermisIcon titre={formation.titre} className="h-10 w-10 text-white/90" size={40} />
        </div>
    );
}

function InfoCard({ icon: Icon, label, children }: { icon: typeof ClipboardList; label: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                <Icon size={19} />
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-pacifique-navy-700/55">{label}</p>
                <div className="mt-0.5 flex min-w-0 items-center text-sm font-semibold text-pacifique-navy-900">{children}</div>
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────── */

export default function SuiviDossier() {
    const { numeroDossier } = useParams<{ numeroDossier: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const { infos } = useInfosSite();

    const [resultat, setResultat] = useState<Resultat | null>(null);
    const [formation, setFormation] = useState<Formation | null>(null);
    const [suggestions, setSuggestions] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [formationLoading, setFormationLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    /* Load dossier */
    useEffect(() => {
        let active = true;
        setLoading(true);
        setNotFound(false);
        setResultat(null);

        supabase
            .rpc('suivre_dossier_par_token', {
                p_numero_dossier: numeroDossier ?? '',
                p_token: token,
            })
            .then(async ({ data, error }) => {
                if (!active) return;
                setLoading(false);
                if (error || !data || data.length === 0) {
                    setNotFound(true);
                    return;
                }

                const dossierData = data[0] as Resultat;
                const pendingKpayDossier = sessionStorage.getItem('kpay_dossier');

                // If payment is pending but user just returned from K-Pay
                if (dossierData.paiement_statut === 'en_attente' && pendingKpayDossier === dossierData.numero_dossier) {
                    sessionStorage.removeItem('kpay_dossier');
                    sessionStorage.removeItem('kpay_token');

                    // Confirm payment in Supabase
                    const { data: apps } = await supabase
                        .from('applications')
                        .select('id, statut')
                        .eq('numero_dossier', dossierData.numero_dossier);

                    if (apps && apps.length > 0) {
                        const app = apps[0];
                        await supabase
                            .from('payments')
                            .update({
                                statut: 'confirme',
                                confirme_at: new Date().toISOString(),
                                reference_transaction: 'KPAY_ONLINE',
                            })
                            .eq('application_id', app.id);

                        if (app.statut === 'nouveau' || app.statut === 'a_verifier') {
                            await supabase
                                .from('applications')
                                .update({
                                    statut: 'valide',
                                    updated_at: new Date().toISOString(),
                                })
                                .eq('id', app.id);
                        }

                        // Re-fetch updated dossier info
                        const { data: updatedData } = await supabase.rpc('suivre_dossier_par_token', {
                            p_numero_dossier: numeroDossier ?? '',
                            p_token: token,
                        });
                        if (active && updatedData && updatedData.length > 0) {
                            setResultat(updatedData[0] as Resultat);
                            return;
                        }
                    }
                }

                setResultat(dossierData);
            });

        return () => {
            active = false;
        };
    }, [numeroDossier, token]);

    /* Load formation + suggestions */
    useEffect(() => {
        if (!resultat?.formation_id) {
            setFormation(null);
            setSuggestions([]);
            return;
        }

        let active = true;
        setFormationLoading(true);

        Promise.all([
            supabase.from('formations').select('*').eq('id', resultat.formation_id).single(),
            supabase
                .from('formations')
                .select('*')
                .eq('actif', true)
                .neq('id', resultat.formation_id)
                .order('ordre')
                .limit(2),
        ]).then(([{ data: f }, { data: s }]) => {
            if (!active) return;
            setFormation(f as Formation | null);
            setSuggestions((s ?? []) as Formation[]);
            setFormationLoading(false);
        });

        return () => {
            active = false;
        };
    }, [resultat]);

    /* Payment */
    async function handlePayment() {
        if (!resultat || paymentLoading) return;
        setPaymentLoading(true);
        sessionStorage.setItem('kpay_dossier', resultat.numero_dossier);
        if (token) sessionStorage.setItem('kpay_token', token);

        const { data, error } = await supabase.functions.invoke('kpay-initiate', {
            body: {
                numero_dossier: resultat.numero_dossier,
                token,
                amount: formation?.prix ?? null,
            },
        });
        if (error || !data?.gatewayUrl) {
            setPaymentLoading(false);
            return;
        }
        window.location.href = data.gatewayUrl;
    }

    function copyDossier() {
        if (!resultat) return;
        navigator.clipboard.writeText(resultat.numero_dossier);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-pacifique-offwhite">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-pacifique-blue-200 border-t-pacifique-blue-600" />
                    <p className="text-sm text-pacifique-navy-700/60">Chargement de votre dossier…</p>
                </div>
            </div>
        );
    }

    /* ── Not found state ── */
    if (notFound || !resultat) {
        return (
            <div className="mx-auto flex min-h-screen max-w-lg items-center bg-pacifique-offwhite px-4 py-16">
                <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-pacifique-navy-900">Lien invalide ou expiré</h1>
                    <p className="mt-2 text-sm text-pacifique-navy-700/60">
                        Ce lien ne permet pas d'accéder à un dossier. Vous pouvez effectuer une recherche avec votre téléphone.
                    </p>
                    <Link
                        to="/suivre-ma-demande"
                        className="mt-6 inline-block rounded-lg bg-pacifique-navy-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-pacifique-navy-700"
                    >
                        Rechercher mon dossier
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Derived values ── */
    const dateLabel = new Date(resultat.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const etapes = get4Etapes(resultat, dateLabel);
    const amount = formation?.prix ?? null;
    const whatsappLink = buildWhatsappLink(
        infos?.whatsapp,
        `Bonjour Auto-École Pacifique, voici mon numéro de dossier ${resultat.numero_dossier}.`,
    );
    const isPaid = resultat.paiement_statut === 'confirme';

    /* ─────────────────────────── Render ─────────────────────────── */
    return (
        <div className="min-h-screen bg-[#F4F6FA] text-pacifique-navy-900">

            {/* Mobile overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 md:hidden"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ══ Sidebar ══ */}
            <aside
                className={[
                    'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-pacifique-navy-900 text-white shadow-2xl transition-transform duration-300',
                    menuOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:translate-x-0',
                ].join(' ')}
            >
                {/* Logo + name */}
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                    <img
                        src="/images/logo.jpg"
                        alt="Auto-École Pacifique"
                        className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Auto-École</p>
                        <p className="font-display text-base font-extrabold leading-tight tracking-wide">PACIFIQUE</p>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="ml-auto rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
                        aria-label="Fermer le menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
                    {NAVIGATION.map(({ label, icon: Icon, active }) => (
                        <a
                            key={label}
                            href="#dossier"
                            onClick={() => setMenuOpen(false)}
                            className={[
                                'flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-pacifique-blue-600 text-white shadow-lg shadow-pacifique-blue-900/30'
                                    : 'text-white/65 hover:bg-white/10 hover:text-white',
                            ].join(' ')}
                        >
                            <Icon size={18} className={active ? 'text-white' : 'text-white/50'} />
                            {label}
                        </a>
                    ))}
                </nav>

                {/* Tagline */}
                <div className="px-5 pb-8 text-center">
                    <p className="text-xs italic leading-relaxed text-white/40">
                        Votre réussite
                        <br />
                        est notre priorité !
                    </p>
                </div>
            </aside>

            {/* ══ Main area (offset by sidebar) ══ */}
            <div className="md:ml-64">

                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur md:px-7">
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="rounded-lg p-2 text-pacifique-navy-700 hover:bg-pacifique-blue-50 md:hidden"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="ml-auto flex items-center gap-4 text-pacifique-navy-700">
                        <button className="relative rounded-lg p-1.5 hover:bg-gray-100" aria-label="Notifications">
                            <Bell size={18} />
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-pacifique-red-500" />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pacifique-navy-900 text-xs font-bold text-white">
                                {resultat.prenom.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden sm:inline">Mon espace</span>
                            <ChevronDown size={14} className="text-pacifique-navy-700/50" />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main id="dossier" className="mx-auto max-w-[1400px] p-4 md:p-7">
                    <div className="flex gap-6 xl:items-start">

                        {/* ════ Center column ════ */}
                        <section className="min-w-0 flex-1 space-y-5">

                            {/* Greeting */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pacifique-blue-600 via-pacifique-blue-500 to-pacifique-navy-700 px-6 py-5 text-white shadow-lg">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl sm:flex">
                                        👋
                                    </div>
                                    <div>
                                        <h1 className="font-display text-xl font-bold sm:text-2xl">
                                            Bonjour {resultat.prenom} 👋
                                        </h1>
                                        <p className="mt-0.5 text-sm text-white/75">
                                            Voici l'état de votre dossier et les prochaines étapes.
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative circles */}
                                <span className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
                                <span className="pointer-events-none absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-white/5" />
                            </div>

                            {/* Info cards */}
                            <div className="grid gap-3 sm:grid-cols-3">
                                <InfoCard icon={ClipboardList} label="Numéro de dossier">
                                    <span className="truncate font-mono">{resultat.numero_dossier}</span>
                                    <button
                                        onClick={copyDossier}
                                        className="ml-2 shrink-0 text-pacifique-blue-600 hover:text-pacifique-blue-800"
                                        aria-label="Copier le numéro de dossier"
                                    >
                                        {copied
                                            ? <Check size={14} className="text-emerald-600" />
                                            : <Copy size={14} />
                                        }
                                    </button>
                                </InfoCard>

                                <InfoCard icon={Phone} label="Téléphone">
                                    {resultat.telephone}
                                </InfoCard>

                                <InfoCard icon={GraduationCap} label="Formation en cours">
                                    <span className="truncate">
                                        {resultat.formation_titre ?? formation?.titre ?? 'À définir'}
                                    </span>
                                    <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                        En cours
                                    </span>
                                </InfoCard>
                            </div>

                            {/* Ma progression */}
                            <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="flex items-center gap-2 font-display text-base font-bold text-pacifique-navy-900">
                                            <PlayCircle size={18} className="text-pacifique-blue-600" />
                                            Ma progression
                                        </h2>
                                        <p className="mt-0.5 text-xs text-pacifique-navy-700/55">
                                            Suivez l'avancement de votre dossier pas à pas.
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-pacifique-blue-50 px-3 py-1 text-xs font-semibold text-pacifique-blue-700">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-pacifique-blue-500" />
                                        En cours
                                    </span>
                                </div>

                                {/* Stepper */}
                                <div className="mt-8 grid grid-cols-4">
                                    {etapes.map((etape, index) => {
                                        const completed = etape.state === 'completed';
                                        const active = etape.state === 'active';
                                        const isLast = index === etapes.length - 1;

                                        return (
                                            <div key={etape.num} className="relative text-center">
                                                {/* Left line */}
                                                {index > 0 && (
                                                    <span
                                                        className={[
                                                            'absolute left-0 right-1/2 top-[11px] h-0.5',
                                                            completed || active ? 'bg-emerald-400' : 'bg-gray-200',
                                                        ].join(' ')}
                                                    />
                                                )}
                                                {/* Right line */}
                                                {!isLast && (
                                                    <span
                                                        className={[
                                                            'absolute left-1/2 right-0 top-[11px] h-0.5',
                                                            completed ? 'bg-emerald-400' : 'bg-gray-200',
                                                        ].join(' ')}
                                                    />
                                                )}
                                                {/* Circle */}
                                                <span
                                                    className={[
                                                        'relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                                                        completed
                                                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                                                            : active
                                                            ? 'bg-pacifique-blue-600 text-white ring-4 ring-pacifique-blue-100'
                                                            : 'bg-gray-200 text-gray-400',
                                                    ].join(' ')}
                                                >
                                                    {completed ? <Check size={12} strokeWidth={3} /> : etape.num}
                                                </span>
                                                {/* Step label */}
                                                <p
                                                    className={[
                                                        'mt-2.5 px-0.5 text-[9px] leading-tight sm:text-[11px]',
                                                        active
                                                            ? 'font-bold text-pacifique-blue-700'
                                                            : completed
                                                            ? 'font-semibold text-pacifique-navy-700'
                                                            : 'text-pacifique-navy-700/40',
                                                    ].join(' ')}
                                                >
                                                    {etape.num}. {etape.title}
                                                </p>
                                                {/* Date / status */}
                                                <p
                                                    className={[
                                                        'mt-1 text-[9px] sm:text-[10px]',
                                                        active
                                                            ? 'font-medium text-pacifique-blue-500'
                                                            : completed
                                                            ? 'font-medium text-emerald-600'
                                                            : 'text-pacifique-navy-700/40',
                                                    ].join(' ')}
                                                >
                                                    {etape.sub}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Formation + Payment side by side */}
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)]">

                                {/* Ma formation actuelle */}
                                <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
                                    <h2 className="flex items-center gap-2 font-display text-base font-bold text-pacifique-navy-900">
                                        <GraduationCap size={18} className="text-pacifique-blue-600" />
                                        Ma formation actuelle
                                    </h2>

                                    {formationLoading ? (
                                        <p className="mt-5 text-sm text-pacifique-navy-700/55">Chargement…</p>
                                    ) : formation ? (
                                        <>
                                            <div className="mt-4 flex gap-4">
                                                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                                                    <FormationVisual formation={formation} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-display text-lg font-bold text-pacifique-navy-900">
                                                        {formation.titre}
                                                    </h3>
                                                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-pacifique-navy-700/60">
                                                        {formation.description ?? 'Formation automobile adaptée à votre parcours.'}
                                                    </p>
                                                    {formation.prix != null && (
                                                        <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-pacifique-navy-900">
                                                            <span className="text-pacifique-blue-600">●</span>
                                                            {formation.prix.toLocaleString('fr-FR')} {formation.devise ?? 'FCFA'}
                                                        </p>
                                                    )}
                                                    {formation.duree && (
                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-pacifique-navy-700/55">
                                                            <span className="text-pacifique-blue-400">●</span>
                                                            Durée estimée : {formation.duree}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-start gap-2 rounded-xl bg-pacifique-blue-50 px-4 py-3">
                                                <Shield size={15} className="mt-0.5 shrink-0 text-pacifique-blue-600" />
                                                <p className="text-xs text-pacifique-blue-800">
                                                    Votre dossier est actuellement en cours de vérification par notre équipe.
                                                    Vous serez notifié dès qu'une nouvelle étape sera disponible.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-5 text-sm text-pacifique-navy-700/55">
                                            Les informations de votre formation seront bientôt disponibles.
                                        </p>
                                    )}
                                </div>

                                {/* Mon paiement */}
                                <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
                                    <h2 className="flex items-center gap-2 font-display text-base font-bold text-pacifique-navy-900">
                                        <CreditCard size={18} className="text-pacifique-blue-600" />
                                        Mon paiement
                                    </h2>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3">
                                            <div>
                                                <p className="text-[11px] text-pacifique-navy-700/55">Frais d'inscription</p>
                                                {amount != null && (
                                                    <p className="mt-0.5 text-lg font-bold text-pacifique-navy-900">
                                                        {amount.toLocaleString('fr-FR')} FCFA
                                                    </p>
                                                )}
                                                <p className="mt-0.5 text-[10px] text-pacifique-navy-700/45">{dateLabel}</p>
                                            </div>
                                            <span
                                                className={[
                                                    'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                                                    paymentBadge(resultat.paiement_statut),
                                                ].join(' ')}
                                            >
                                                <span className={['h-1.5 w-1.5 rounded-full', paymentDot(resultat.paiement_statut)].join(' ')} />
                                                {paymentLabel(resultat.paiement_statut)}
                                            </span>
                                        </div>

                                        {resultat.paiement_reference && (
                                            <p className="px-1 text-[11px] text-pacifique-navy-700/55">
                                                Réf. : {resultat.paiement_reference}
                                            </p>
                                        )}
                                    </div>

                                    {!isPaid && (
                                        <button
                                            onClick={handlePayment}
                                            disabled={paymentLoading || !formation}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pacifique-blue-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <CreditCard size={15} />
                                            {paymentLoading ? 'Redirection…' : 'Effectuer un nouveau paiement'}
                                        </button>
                                    )}

                                    <a
                                        href="#"
                                        className="mt-3 block text-center text-[11px] font-medium text-pacifique-blue-600 hover:underline"
                                    >
                                        Voir l'historique des paiements →
                                    </a>
                                </div>
                            </div>

                            {/* Contact footer */}
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm md:px-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                                        <MessageCircle size={20} />
                                    </span>
                                    <div>
                                        <h2 className="text-sm font-bold text-pacifique-navy-900">Une question ?</h2>
                                        <p className="text-xs text-pacifique-navy-700/55">
                                            Notre équipe est disponible pour vous accompagner.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-xl border border-pacifique-blue-200 bg-white px-5 py-2 text-sm font-bold text-pacifique-blue-700 hover:bg-pacifique-blue-50"
                                >
                                    <MessageCircle size={15} />
                                    Nous contacter
                                </a>
                            </div>
                        </section>

                        {/* ════ Right column (xl only) ════ */}
                        <aside className="hidden w-[340px] shrink-0 space-y-5 xl:block">

                            {/* Payment suggestion */}
                            {!isPaid && (
                                <div className="overflow-hidden rounded-2xl border border-pacifique-blue-100 bg-white shadow-sm">
                                    {/* Hero */}
                                    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-pacifique-navy-700 to-pacifique-blue-800">
                                        <img
                                            src="/images/logo.jpg"
                                            alt="Pacifique"
                                            className="h-full w-full object-cover opacity-20"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-start justify-end p-4">
                                            <p className="font-display text-lg font-extrabold leading-tight text-white drop-shadow">
                                                Ensemble vers
                                                <br />
                                                votre permis !
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={16} className="text-pacifique-blue-600" />
                                            <h2 className="font-display text-sm font-bold text-pacifique-navy-900">
                                                Suggestion de paiement
                                            </h2>
                                        </div>
                                        <p className="mt-0.5 text-xs text-pacifique-navy-700/55">
                                            Réservez votre place dès maintenant !
                                        </p>

                                        <div className="mt-4 rounded-xl bg-[#F7F9FF] p-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                                                ✦ Recommandé
                                            </span>
                                            <h3 className="mt-3 font-display text-sm font-bold text-pacifique-navy-900">
                                                Payer les frais d'inscription
                                            </h3>
                                            <p className="mt-1 text-xs leading-relaxed text-pacifique-navy-700/55">
                                                Réservez votre place et poursuivez votre démarche en toute sérénité.
                                            </p>
                                            {amount != null && (
                                                <p className="mt-3 text-2xl font-extrabold text-pacifique-navy-900">
                                                    {amount.toLocaleString('fr-FR')}{' '}
                                                    <span className="text-base font-bold">FCFA</span>
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={handlePayment}
                                            disabled={paymentLoading || !formation}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pacifique-navy-900 py-3 text-sm font-bold text-white hover:bg-pacifique-navy-700 disabled:opacity-60"
                                        >
                                            <CreditCard size={15} />
                                            {paymentLoading ? 'Redirection…' : 'Payer maintenant'}
                                            <ChevronRight size={15} />
                                        </button>

                                        <button className="mt-2.5 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50">
                                            Payer plus tard
                                        </button>

                                        {/* K-PAY badges */}
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <div className="flex items-center gap-2 text-[10px] text-pacifique-navy-700/50">
                                                <Shield size={12} />
                                                Paiement sécurisé via K-PAY ou Orange Money
                                            </div>
                                            <div className="mt-2.5 flex gap-2">
                                                <span className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2.5 py-1.5 text-[10px] font-bold text-yellow-800 ring-1 ring-yellow-200">
                                                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                                                    MTN Mobile Money
                                                </span>
                                                <span className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[10px] font-bold text-orange-700 ring-1 ring-orange-200">
                                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                                    Orange Money
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other formations */}
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <h2 className="font-display text-sm font-bold text-pacifique-navy-900">
                                    Autres formations qui pourraient vous intéresser
                                </h2>

                                <div className="mt-4 divide-y divide-gray-100">
                                    {suggestions.length > 0
                                        ? suggestions.map((s) => (
                                            <Link
                                                key={s.id}
                                                to="/permis"
                                                className="flex items-center gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-pacifique-blue-50/40 first:pt-0 last:pb-0"
                                            >
                                                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                                                    <FormationVisual formation={s} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-pacifique-navy-900">{s.titre}</p>
                                                    <p className="mt-0.5 text-xs text-pacifique-navy-700/55">
                                                        À partir de {s.prix?.toLocaleString('fr-FR') ?? '…'} FCFA
                                                    </p>
                                                </div>
                                                <ChevronRight size={16} className="shrink-0 text-pacifique-blue-500" />
                                            </Link>
                                        ))
                                        : (
                                            <p className="py-3 text-xs text-pacifique-navy-700/50">
                                                Aucune autre formation disponible.
                                            </p>
                                        )
                                    }
                                </div>

                                <Link
                                    to="/permis"
                                    className="mt-4 flex items-center gap-1 text-xs font-bold text-pacifique-blue-700 hover:underline"
                                >
                                    Voir toutes nos formations <ChevronRight size={13} />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
