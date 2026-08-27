import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Plus, 
    LogOut, 
    Car, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Calendar, 
    Phone, 
    MapPin, 
    FileText, 
    MessageCircle, 
    RefreshCw, 
    ArrowLeft, 
    Sparkles,
    UserCheck,
    GraduationCap
} from 'lucide-react';
import PermisIcon from '@/components/ui/PermisIcon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { useInfosSite, buildWhatsappLink } from '@/lib/useSiteData';
import type { Inscription } from '@/lib/database.types';

type InscriptionWithFormation = Inscription & {
    formation?: {
        id: string;
        titre: string;
        prix: number | null;
        devise: string;
    } | null;
};

const STATUT_CONFIG: Record<
    Inscription['statut'], 
    { label: string; bg: string; text: string; border: string; stepIndex: number; desc: string }
> = {
    en_attente: {
        label: 'En attente de traitement',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        stepIndex: 0,
        desc: 'Votre demande a bien été reçue. Notre secrétariat vérifie vos éléments.',
    },
    dossier_incomplet: {
        label: 'Dossier incomplet',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        stepIndex: 0,
        desc: 'Des pièces ou informations complémentaires sont requises.',
    },
    valide: {
        label: 'Dossier validé',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        stepIndex: 1,
        desc: 'Dossier complet et validé. Votre session va bientôt débuter.',
    },
    formation_en_cours: {
        label: 'Formation en cours',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        stepIndex: 2,
        desc: 'Cours théoriques et/ou pratiques en cours avec votre moniteur.',
    },
    termine: {
        label: 'Formation terminée',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        stepIndex: 3,
        desc: 'Félicitations ! Votre parcours de formation est achevé.',
    },
    refusee: {
        label: 'Demande refusée',
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        stepIndex: -1,
        desc: 'Votre demande ne peut pas être traitée pour le moment.',
    },
};

const STEP_LABELS = [
    'Demande reçue',
    'Dossier validé',
    'Formation en cours',
    'Terminée',
];

export default function MonCompte() {
    const { session, user, nomComplet, initials, refreshProfile } = useAuth();
    const { infos } = useInfosSite();
    const navigate = useNavigate();

    const [inscriptions, setInscriptions] = useState<InscriptionWithFormation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function loadInscriptions() {
        if (!session?.user?.id) return;
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('inscriptions')
                .select(`
                    *,
                    formation:formations (
                        id,
                        titre,
                        prix,
                        devise
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setInscriptions(data as InscriptionWithFormation[]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (session) {
            loadInscriptions();
            refreshProfile();
        }
    }, [session]);

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/', { replace: true });
    }

    const displayName = nomComplet || user?.email?.split('@')[0] || 'Candidat';

    // Stats
    const totalDemandes = inscriptions.length;
    const enCoursCount = inscriptions.filter((i) =>
        ['en_attente', 'dossier_incomplet', 'valide', 'formation_en_cours'].includes(i.statut)
    ).length;
    const termineesCount = inscriptions.filter((i) => i.statut === 'termine').length;

    const whatsappSupportUrl = buildWhatsappLink(
        infos?.whatsapp || '699000000',
        `Bonjour Auto-École Pacifique, je suis ${displayName} et j'ai une question concernant mon dossier de formation.`
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Left: Brand + Back */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="group flex items-center gap-2.5">
                            <span className="flex h-9 w-9 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 transition-transform group-hover:scale-105">
                                <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
                            </span>
                            <div className="hidden sm:block leading-none">
                                <span className="font-display text-base font-extrabold tracking-tight text-pacifique-navy-900">
                                    PACIFIQUE
                                </span>
                                <span className="block text-[8px] font-bold uppercase tracking-wider text-pacifique-blue-600">
                                    Espace Candidat
                                </span>
                            </div>
                        </Link>

                        <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pacifique-navy-700/70 hover:text-pacifique-blue-600 transition"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Retour au site
                        </Link>
                    </div>

                    {/* Right: User Profile & Logout */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 rounded-full bg-pacifique-offwhite py-1.5 pl-2 pr-3 border border-gray-200/60">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pacifique-navy-900 via-pacifique-blue-700 to-pacifique-blue-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                                {initials}
                            </span>
                            <div className="hidden md:block text-left leading-none">
                                <p className="text-xs font-bold text-pacifique-navy-900 truncate max-w-[140px]">
                                    {displayName}
                                </p>
                                <span className="text-[10px] font-medium text-pacifique-navy-700/60">
                                    {user?.email}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                            title="Se déconnecter"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
                {/* Hero Greeting Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pacifique-navy-950 via-pacifique-navy-900 to-pacifique-navy-800 p-6 sm:p-8 text-white shadow-xl mb-8">
                    {/* Ambient circles */}
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-pacifique-blue-500/20 blur-3xl" />
                        <div className="absolute right-32 bottom-0 h-48 w-48 rounded-full bg-pacifique-red-500/20 blur-2xl" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
                                <span className="font-display text-xl font-extrabold tracking-wider text-pacifique-blue-300">
                                    {initials}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                        <Sparkles size={11} /> Compte actif
                                    </span>
                                </div>
                                <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                                    Bonjour, {displayName} 👋
                                </h1>
                                <p className="mt-1 text-xs text-pacifique-blue-100/75 max-w-xl">
                                    Bienvenue sur votre espace candidat Auto-École Pacifique. Suivez vos demandes d'inscription et l'avancement de votre formation au permis.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/mon-compte/nouvelle-demande"
                                className="inline-flex items-center gap-2 rounded-xl bg-pacifique-red-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-pacifique-red-500/30 hover:bg-pacifique-red-600 active:scale-95 transition"
                            >
                                <Plus size={16} />
                                Nouvelle demande
                            </Link>

                            <button
                                onClick={loadInscriptions}
                                disabled={refreshing}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-3 text-xs font-semibold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
                                title="Actualiser les données"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                            <FileText size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-pacifique-navy-700/60 uppercase tracking-wider">
                                Total Demandes
                            </p>
                            <p className="text-2xl font-extrabold text-pacifique-navy-900">{totalDemandes}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-pacifique-navy-700/60 uppercase tracking-wider">
                                En cours / En attente
                            </p>
                            <p className="text-2xl font-extrabold text-amber-600">{enCoursCount}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-pacifique-navy-700/60 uppercase tracking-wider">
                                Formations terminées
                            </p>
                            <p className="text-2xl font-extrabold text-emerald-600">{termineesCount}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content: Inscriptions & Profile details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Cols: Inscriptions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-xl font-bold text-pacifique-navy-900">
                                    Mes dossiers d'inscription
                                </h2>
                                <p className="text-xs text-pacifique-navy-700/60 mt-0.5">
                                    Suivez l'état d'avancement de vos demandes
                                </p>
                            </div>

                            <Link
                                to="/mon-compte/nouvelle-demande"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-pacifique-blue-600 hover:text-pacifique-blue-700 hover:underline"
                            >
                                <Plus size={14} /> Faire une demande
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map((n) => (
                                    <div key={n} className="h-44 rounded-2xl bg-white p-6 border border-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : inscriptions.length === 0 ? (
                            /* Empty State */
                            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pacifique-blue-50 text-pacifique-blue-600 mb-4">
                                    <Car size={32} />
                                </div>
                                <h3 className="font-display text-lg font-bold text-pacifique-navy-900">
                                    Aucune demande d'inscription pour l'instant
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-xs text-pacifique-navy-700/70 leading-relaxed">
                                    Vous n'avez pas encore envoyé de dossier. Choisissez la formation de votre choix (Permis B, Perfectionnement, Code de la route...) et démarrez dès maintenant !
                                </p>
                                <Link
                                    to="/mon-compte/nouvelle-demande"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pacifique-red-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-pacifique-red-500/25 hover:bg-pacifique-red-600 transition"
                                >
                                    <Plus size={16} /> Faire ma première demande
                                </Link>
                            </div>
                        ) : (
                            /* Inscriptions Cards */
                            <div className="space-y-5">
                                {inscriptions.map((ins) => {
                                    const statutInfo = STATUT_CONFIG[ins.statut] || STATUT_CONFIG.en_attente;
                                    const dateStr = new Date(ins.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    });

                                    return (
                                        <div
                                            key={ins.id}
                                            className="rounded-3xl bg-white p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            {/* Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pacifique-navy-900 text-white shadow-sm">
                                                        <PermisIcon titre={ins.formation?.titre} size={22} className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display text-base font-bold text-pacifique-navy-900">
                                                            {ins.formation?.titre || 'Formation Conduite'}
                                                        </h3>
                                                        <p className="text-xs text-pacifique-navy-700/60 flex items-center gap-1.5 mt-0.5">
                                                            <Calendar size={12} /> Déposé le {dateStr}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border ${statutInfo.bg} ${statutInfo.text} ${statutInfo.border}`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {statutInfo.label}
                                                </span>
                                            </div>

                                            {/* Status description */}
                                            <div className="my-4 rounded-xl bg-gray-50/80 p-3.5 text-xs text-pacifique-navy-800 flex items-start gap-2.5">
                                                <AlertCircle size={16} className="text-pacifique-blue-600 flex-shrink-0 mt-0.5" />
                                                <p>{statutInfo.desc}</p>
                                            </div>

                                            {/* Visual Progress Stepper */}
                                            {ins.statut !== 'refusee' && (
                                                <div className="my-6">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {STEP_LABELS.map((stepLabel, idx) => {
                                                            const isCompleted = statutInfo.stepIndex > idx;
                                                            const isCurrent = statutInfo.stepIndex === idx;

                                                            return (
                                                                <div key={stepLabel} className="text-center">
                                                                    <div
                                                                        className={`h-2 rounded-full mb-2 transition-all ${
                                                                            isCompleted
                                                                                ? 'bg-emerald-500'
                                                                                : isCurrent
                                                                                ? 'bg-pacifique-blue-600 animate-pulse'
                                                                                : 'bg-gray-200'
                                                                        }`}
                                                                    />
                                                                    <span
                                                                        className={`text-[10px] font-semibold block leading-tight ${
                                                                            isCurrent
                                                                                ? 'text-pacifique-blue-700 font-bold'
                                                                                : isCompleted
                                                                                ? 'text-emerald-700'
                                                                                : 'text-gray-400'
                                                                        }`}
                                                                    >
                                                                        {stepLabel}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Details Info Grid */}
                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs text-pacifique-navy-700/80">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={14} className="text-gray-400" />
                                                    <span>Candidat : <strong className="text-pacifique-navy-900">{ins.nom} {ins.prenom}</strong></span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span>Téléphone : <strong>{ins.telephone || 'Non renseigné'}</strong></span>
                                                </div>

                                                {(ins.ville || ins.adresse) && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        <span>Adresse : <strong>{[ins.adresse, ins.ville].filter(Boolean).join(', ')}</strong></span>
                                                    </div>
                                                )}

                                                {ins.date_naissance && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span>Naissance : <strong>{new Date(ins.date_naissance).toLocaleDateString('fr-FR')}</strong></span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message */}
                                            {ins.message && (
                                                <div className="mt-3 rounded-xl bg-pacifique-blue-50/50 p-3 text-xs text-pacifique-navy-800">
                                                    <p className="font-semibold text-pacifique-blue-900 mb-0.5">Votre message joint :</p>
                                                    <p className="italic">{ins.message}</p>
                                                </div>
                                            )}

                                            {/* Quick CTA */}
                                            <div className="mt-5 flex justify-end">
                                                <a
                                                    href={whatsappSupportUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                                                >
                                                    <MessageCircle size={14} /> Poser une question sur ce dossier
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Candidate Profile Info & Assistance Card */}
                    <div className="space-y-6">
                        {/* Profile Details Card */}
                        <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-display text-base font-bold text-pacifique-navy-900 mb-4 pb-2 border-b border-gray-100">
                                Informations du compte
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <span className="block font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                                        Nom & Prénom
                                    </span>
                                    <p className="font-bold text-pacifique-navy-900 text-sm mt-0.5">
                                        {displayName}
                                    </p>
                                </div>

                                <div>
                                    <span className="block font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                                        Adresse Email
                                    </span>
                                    <p className="font-medium text-pacifique-navy-800 mt-0.5 break-all">
                                        {user?.email}
                                    </p>
                                </div>

                                <div>
                                    <span className="block font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                                        Statut du compte
                                    </span>
                                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                        <CheckCircle2 size={12} /> Candidat vérifié
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Direct WhatsApp Support */}
                        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-base">Besoin d'aide ?</h4>
                                    <p className="text-[11px] text-emerald-100">Secrétariat disponible</p>
                                </div>
                            </div>

                            <p className="text-xs text-emerald-50 leading-relaxed mb-4">
                                Des questions sur votre dossier, les horaires ou les documents à fournir ? Notre équipe vous répond rapidement sur WhatsApp.
                            </p>

                            <a
                                href={whatsappSupportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition"
                            >
                                <MessageCircle size={15} /> Discuter avec l'auto-école
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}