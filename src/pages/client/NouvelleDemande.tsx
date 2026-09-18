import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    Copy,
    CreditCard,
    GraduationCap,
    HelpCircle,
    Info,
    Lock,
    Mail,
    MapPin,
    MessageCircle,
    Pencil,
    Phone,
    Shield,
    User,
    UserCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFormationsParCategorie, reductionActive, useInfosSite, buildWhatsappLink } from '@/lib/useSiteData';
import type { Formation } from '@/lib/database.types';

/* ─────────────────────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────────────────────── */

type Step = 'infos' | 'formation' | 'recap' | 'paiement' | 'succes';

const STEP_META = [
    { key: 'infos',     num: 1, label: 'Informations personnelles', sub: 'Vos coordonnées' },
    { key: 'formation', num: 2, label: 'Choix de la formation',     sub: 'Type de permis' },
    { key: 'recap',     num: 3, label: 'Récapitulatif',             sub: 'Vérifiez vos informations' },
    { key: 'paiement',  num: 4, label: 'Paiement',                  sub: 'Finalisez votre inscription' },
] as const;

const STEP_ORDER: Step[] = ['infos', 'formation', 'recap', 'paiement', 'succes'];

function stepIndex(s: Step) { return STEP_ORDER.indexOf(s); }

/* ─────────────────────────────────────────────────────────────
   Helpers / sub-components
───────────────────────────────────────────────────────────── */

function cls(...args: (string | false | null | undefined)[]) {
    return args.filter(Boolean).join(' ');
}

function FormField({
    label, required, hint, children,
}: {
    label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-pacifique-navy-800">
                {label}
                {required && <span className="ml-0.5 text-pacifique-red-500"> *</span>}
            </label>
            {children}
            {hint && <p className="mt-1 text-[11px] text-pacifique-navy-700/55">{hint}</p>}
        </div>
    );
}

function TextInput({
    value, onChange, placeholder, type = 'text', required, icon: Icon,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    icon?: typeof User;
}) {
    return (
        <div className="relative">
            {Icon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pacifique-navy-700/35">
                    <Icon size={16} />
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={cls(
                    'w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm text-pacifique-navy-900 outline-none transition-colors placeholder:text-pacifique-navy-700/35 focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-100',
                    Icon ? 'pl-9 pr-3' : 'px-3',
                )}
            />
        </div>
    );
}

function PrixDisplay({ formation }: { formation: Formation }) {
    const hasReduction = reductionActive(formation);
    const prix = hasReduction ? formation.prix_reduit : formation.prix;
    return (
        <span className="font-bold text-pacifique-navy-900">
            {hasReduction && (
                <span className="mr-2 text-xs font-normal text-pacifique-navy-700/40 line-through">
                    {formation.prix?.toLocaleString('fr-FR')} {formation.devise}
                </span>
            )}
            {prix?.toLocaleString('fr-FR')} {formation.devise}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────
   Shared Topbar (used here + on /suivi via props)
───────────────────────────────────────────────────────────── */

function InscriptionTopbar({ telephone }: { telephone?: string | null }) {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1300px] items-center gap-4 px-5 py-3">
                {/* Logo */}
                <Link to="/" className="flex shrink-0 items-center gap-2.5">
                    <img src="/images/logo.jpg" alt="Auto-École Pacifique" className="h-10 w-10 rounded-full object-cover" />
                    <div className="hidden sm:block">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-pacifique-navy-700/55">Auto-École</p>
                        <p className="font-display text-sm font-extrabold leading-none text-pacifique-navy-900">PACIFIQUE</p>
                    </div>
                </Link>

                {/* Slogan */}
                <p className="hidden flex-1 text-center text-sm italic text-pacifique-navy-700/50 md:block">
                    Votre avenir sur la route commence ici &nbsp;〜
                </p>

                {/* Right actions */}
                <div className="ml-auto flex items-center gap-4">
                    {telephone && (
                        <div className="hidden items-center gap-2 sm:flex">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pacifique-blue-50 text-pacifique-blue-600">
                                <HelpCircle size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] text-pacifique-navy-700/55">Besoin d'aide ?</p>
                                <p className="text-sm font-bold text-pacifique-navy-900">{telephone}</p>
                            </div>
                        </div>
                    )}
                    <Link
                        to="/suivre-ma-demande"
                        className="flex items-center gap-2 rounded-xl border border-pacifique-blue-200 px-4 py-2 text-xs font-bold text-pacifique-blue-700 hover:bg-pacifique-blue-50"
                    >
                        <UserCheck size={14} />
                        Suivre mon dossier
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────────────────────
   Left step sidebar
───────────────────────────────────────────────────────────── */

function StepSidebar({ current }: { current: Step }) {
    const currentIdx = STEP_META.findIndex((s) => s.key === current);
    return (
        <aside className="hidden w-56 shrink-0 md:block">
            <Link
                to="/"
                className="mb-6 flex items-center gap-1.5 text-sm text-pacifique-navy-700/55 hover:text-pacifique-navy-900"
            >
                <ArrowLeft size={14} />
                Retour au site
            </Link>

            <div className="space-y-1">
                {STEP_META.map((s, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                        <div
                            key={s.key}
                            className={cls(
                                'flex items-start gap-3 rounded-xl px-3 py-3 transition-colors',
                                active && 'bg-pacifique-blue-600 text-white shadow-md shadow-pacifique-blue-200',
                                !active && 'text-pacifique-navy-700/60',
                            )}
                        >
                            {/* Circle */}
                            <span
                                className={cls(
                                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    active && 'bg-white text-pacifique-blue-600',
                                    done && 'bg-emerald-100 text-emerald-700',
                                    !active && !done && 'bg-gray-100 text-gray-400',
                                )}
                            >
                                {done ? <Check size={12} strokeWidth={3} /> : s.num}
                            </span>
                            <div className="min-w-0">
                                <p className={cls('text-sm font-semibold leading-tight', active && 'text-white', done && 'text-pacifique-navy-800')}>
                                    {s.label}
                                </p>
                                <p className={cls('mt-0.5 text-[11px]', active ? 'text-white/70' : 'text-pacifique-navy-700/45')}>
                                    {s.sub}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tagline */}
            <div className="mt-8 text-center">
                <p className="text-xs italic leading-relaxed text-pacifique-navy-700/40">
                    Ensemble pour une conduite<br />plus sûre !
                </p>
            </div>
        </aside>
    );
}

/* ─────────────────────────────────────────────────────────────
   Top progress bar (mobile + desktop)
───────────────────────────────────────────────────────────── */

function ProgressBar({ step }: { step: Step }) {
    const idx = STEP_META.findIndex((s) => s.key === step);
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold text-pacifique-blue-700">
                Étape {idx + 1} sur 4
            </span>
            <div className="flex flex-1 gap-1">
                {STEP_META.map((_, i) => (
                    <div
                        key={i}
                        className={cls(
                            'h-1.5 flex-1 rounded-full transition-colors',
                            i <= idx ? 'bg-pacifique-blue-600' : 'bg-gray-200',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Right column
───────────────────────────────────────────────────────────── */

function RightColumn({
    formation, whatsappLink,
}: {
    formation: Formation | null | undefined;
    whatsappLink: string;
}) {
    const hasReduction = formation ? reductionActive(formation) : false;
    const prix = formation
        ? hasReduction ? formation.prix_reduit : formation.prix
        : null;

    return (
        <div className="hidden w-72 shrink-0 space-y-4 lg:block xl:w-80">
            {/* Hero image */}
            <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-pacifique-navy-700 to-pacifique-blue-800">
                <img
                    src="/images/hero2.jpg"
                    alt="Auto-École Pacifique"
                    className="h-full w-full object-cover opacity-60 mix-blend-multiply"
                />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-5">
                    <p className="font-display text-xl font-extrabold leading-tight text-white drop-shadow">
                        Votre permis,<br />notre priorité !
                    </p>
                </div>
            </div>

            {/* Récapitulatif */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-pacifique-blue-600" />
                        <h3 className="text-sm font-bold text-pacifique-navy-900">Récapitulatif</h3>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-pacifique-blue-600">
                        <Pencil size={12} />
                        Modifier
                    </span>
                </div>

                {formation ? (
                    <div className="mt-3">
                        <p className="text-[11px] text-pacifique-navy-700/55">Formation sélectionnée</p>
                        <div className="mt-1.5 flex items-start gap-2">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pacifique-blue-50 text-pacifique-blue-600">
                                <GraduationCap size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-pacifique-navy-900">{formation.titre}</p>
                                <p className="mt-0.5 line-clamp-2 text-[11px] text-pacifique-navy-700/55">
                                    {formation.description ?? 'Formation automobile (véhicule léger)'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-gray-100 pt-3">
                            <p className="text-[11px] text-pacifique-navy-700/55">Prix de la formation</p>
                            {hasReduction && (
                                <p className="mt-0.5 text-xs text-pacifique-navy-700/40 line-through">
                                    {formation.prix?.toLocaleString('fr-FR')} {formation.devise}
                                </p>
                            )}
                            <p className="text-xl font-extrabold text-pacifique-navy-900">
                                {prix?.toLocaleString('fr-FR')}{' '}
                                <span className="text-base font-bold">{formation.devise}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-xs text-pacifique-navy-700/50">
                        Sélectionnez une formation pour voir les détails.
                    </p>
                )}
            </div>

            {/* Paiement sécurisé */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Shield size={15} className="text-pacifique-blue-600" />
                    <h3 className="text-sm font-bold text-pacifique-navy-900">Paiement sécurisé</h3>
                </div>
                <p className="mt-1 text-[11px] text-pacifique-navy-700/55">
                    Vos transactions sont protégées par K-PAY
                </p>
                <div className="mt-3 flex gap-2">
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

            {/* Besoin d'aide */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <HelpCircle size={15} className="text-pacifique-blue-600" />
                    <h3 className="text-sm font-bold text-pacifique-navy-900">Besoin d'aide ?</h3>
                </div>
                <p className="mt-1 text-[11px] text-pacifique-navy-700/55">
                    Notre équipe est disponible pour vous accompagner.
                </p>
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                >
                    <MessageCircle size={14} />
                    Contacter l'auto-école
                </a>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Step header (icon + title + subtitle)
───────────────────────────────────────────────────────────── */

function StepHeader({ num, title, subtitle }: { num: number; title: string; subtitle: string }) {
    const icons = [User, GraduationCap, CheckCircle2, CreditCard];
    const Icon = icons[num - 1] ?? User;
    return (
        <div className="mb-7 flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                <Icon size={22} />
            </span>
            <div>
                <h1 className="font-display text-xl font-bold text-pacifique-navy-900">
                    {num}. {title}
                </h1>
                <p className="mt-0.5 text-sm text-pacifique-navy-700/60">{subtitle}</p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Shell layout wrapper (outside component to preserve focus)
───────────────────────────────────────────────────────────── */

function Shell({
    telephone,
    step,
    showSidebar = true,
    children,
}: {
    telephone?: string | null;
    step: Step;
    showSidebar?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-[#F4F6FA]">
            <InscriptionTopbar telephone={telephone} />
            <div className="mx-auto flex w-full max-w-[1300px] flex-1 gap-8 px-4 py-8 md:px-6 md:py-10">
                {showSidebar && step !== 'succes' && <StepSidebar current={step} />}
                {children}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */

export default function NouvelleDemande() {
    const { categories = [] } = useFormationsParCategorie();
    const { infos } = useInfosSite();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const formationFromUrl = searchParams.get('formation') ?? '';

    /* ── Form state ── */
    const [step, setStep] = useState<Step>('infos');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [lieuNaissance, setLieuNaissance] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [formationId, setFormationId] = useState(formationFromUrl);
    const [allowFormationChange, setAllowFormationChange] = useState(!formationFromUrl);

    /* ── Submission state ── */
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [dossier, setDossier] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showShareConfirmation, setShowShareConfirmation] = useState(false);

    /* ── Payment state ── */
    const [payError, setPayError] = useState<string | null>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [paySent, setPaySent] = useState(false);

    /* ── Derived ── */
    const allFormations = categories.flatMap((c) => c.formations);
    const formationChoisie = allFormations.find((f) => f.id === formationId) ?? null;
    const montant = formationChoisie
        ? reductionActive(formationChoisie)
            ? formationChoisie.prix_reduit
            : formationChoisie.prix
        : null;

    const whatsappLink = buildWhatsappLink(
        infos?.whatsapp,
        'Bonjour Auto-École Pacifique, j\'ai besoin d\'aide pour mon inscription.',
    );

    const whatsappDossierLink = buildWhatsappLink(
        infos?.whatsapp,
        `Bonjour Auto-École Pacifique, voici mon numéro de dossier ${dossier}.`,
    );

    /* ── Handlers ── */
    function goTo(s: Step) {
        setError(null);
        setStep(s);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleInfosSubmit(e: FormEvent) {
        e.preventDefault();
        if (!formationId) {
            setError('Veuillez sélectionner un permis ou une formation pour continuer.');
            return;
        }
        setError(null);
        goTo('recap');
    }

    function handleFormationNext() {
        if (!formationId) {
            setError('Sélectionnez une formation pour continuer.');
            return;
        }
        setError(null);
        goTo('recap');
    }

    async function handleSubmit() {
        setError(null);
        setSubmitting(true);

        const { data, error: rpcError } = await supabase.rpc('creer_candidature', {
            p_nom: nom,
            p_prenom: prenom,
            p_date_naissance: dateNaissance || null,
            p_lieu_naissance: lieuNaissance || null,
            p_numero_cni: null,
            p_date_delivrance: null,
            p_telephone: telephone,
            p_email: email || null,
            p_formation_id: formationId,
        });

        setSubmitting(false);
        if (rpcError || !data || data.length === 0) {
            setError('Une erreur est survenue. Réessayez.');
            return;
        }
        setDossier(data[0].numero_dossier);
        setToken(data[0].token_acces);
        goTo('paiement');
    }

    async function triggerKPayDirect() {
        if (!dossier) return;
        setPayError(null);
        setPayLoading(true);

        try {
            sessionStorage.setItem('kpay_dossier', dossier);
            if (token) sessionStorage.setItem('kpay_token', token);

            const { data, error: fnError } = await supabase.functions.invoke('kpay-initiate', {
                body: { numero_dossier: dossier, token, amount: montant },
            });

            if (fnError || !data?.gatewayUrl) {
                setPayLoading(false);
                setPayError('Une erreur est survenue lors de la redirection vers K-Pay.');
                return;
            }

            window.location.href = data.gatewayUrl;
        } catch {
            setPayLoading(false);
            setPayError('Une erreur est survenue lors de la connexion au serveur de paiement.');
        }
    }

    async function handlePaySurPlace() {
        if (!dossier) return;
        setPayError(null);
        setPayLoading(true);

        const { data, error: rpcError } = await supabase.rpc('enregistrer_paiement', {
            p_token: token,
            p_numero_dossier: dossier,
            p_montant: montant,
            p_methode: 'sur_place',
            p_reference: null,
        });
        setPayLoading(false);
        if (rpcError || !data) {
            setPayError('Une erreur est survenue lors de l\'enregistrement.');
            return;
        }
        setPaySent(true);
    }

    function copyDossier() {
        if (!dossier) return;
        navigator.clipboard.writeText(dossier);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    /* ────────────────────────────────────────────
       ÉTAPE SUCCÈS (after paiement)
    ──────────────────────────────────────────── */

    if (step === 'succes' && dossier) {
        /* Sub-state: payment flow */
        if (paySent) {
            return (
                <Shell telephone={infos?.telephone} step={step} showSidebar={false}>
                    <div className="mx-auto flex w-full max-w-lg flex-col items-center py-8">
                        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm">
                            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                            <h1 className="mt-4 text-xl font-bold text-pacifique-navy-900">
                                Paiement en attente de confirmation
                            </h1>
                            <p className="mt-2 text-sm text-pacifique-navy-700/65">
                                Notre équipe va vérifier votre paiement et valider votre dossier <strong>{dossier}</strong>.
                            </p>
                            <Link
                                to={`/suivi/${encodeURIComponent(dossier)}?token=${encodeURIComponent(token ?? '')}`}
                                className="mt-6 inline-block rounded-xl bg-pacifique-navy-900 px-6 py-3 text-sm font-bold text-white hover:bg-pacifique-navy-700"
                            >
                                Suivre mon dossier
                            </Link>
                        </div>
                    </div>
                </Shell>
            );
        }

        /* Default success screen */
        return (
            <Shell telephone={infos?.telephone} step={step} showSidebar={false}>
                <div className="mx-auto w-full max-w-lg">
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                        <h1 className="mt-4 text-xl font-bold text-pacifique-navy-900">Demande enregistrée !</h1>
                        <p className="mt-2 text-sm text-pacifique-navy-700/65">
                            Conservez précieusement ce numéro de dossier.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-pacifique-navy-900 to-pacifique-navy-700 px-4 py-4 text-white shadow-lg">
                            <span className="font-mono text-2xl font-bold tracking-wider">{dossier}</span>
                            <button onClick={copyDossier} className="rounded-lg p-2 text-white/70 hover:bg-white/10">
                                <Copy size={18} />
                            </button>
                        </div>
                        {copied && <p className="mt-2 text-xs text-emerald-600">Copié !</p>}

                        <a
                            href={whatsappDossierLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                            <MessageCircle size={18} /> Partager sur WhatsApp
                        </a>

                        <Link
                            to={`/suivi/${encodeURIComponent(dossier)}?token=${encodeURIComponent(token ?? '')}`}
                            className="mt-3 block rounded-xl bg-pacifique-navy-900 py-3 text-sm font-bold text-white hover:bg-pacifique-navy-700"
                        >
                            Accéder à mon dossier
                        </Link>

                        <p className="mt-7 text-sm font-medium text-pacifique-navy-800">
                            Souhaitez-vous finaliser votre inscription maintenant ?
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                            <button
                                onClick={triggerKPayDirect}
                                disabled={payLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pacifique-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700 disabled:opacity-60"
                            >
                                <CreditCard size={16} />
                                {payLoading ? 'Redirection vers K-Pay…' : '💳 Payer maintenant via K-Pay'}
                            </button>
                            {payError && <p className="mt-1 text-xs text-pacifique-red-500">{payError}</p>}
                            <button
                                onClick={handlePaySurPlace}
                                disabled={payLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-pacifique-navy-800 hover:bg-gray-50 disabled:opacity-60"
                            >
                                <Building2 size={16} />
                                Paiement sur place (en agence)
                            </button>
                            {!showShareConfirmation ? (
                                <button
                                    onClick={() => setShowShareConfirmation(true)}
                                    className="rounded-xl border border-gray-200 py-3 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50"
                                >
                                    Payer plus tard
                                </button>
                            ) : (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-left">
                                    <p className="text-sm text-pacifique-navy-800">
                                        Souhaitez-vous envoyer votre numéro de dossier sur WhatsApp à Auto-École Pacifique, pour qu'elle le retrouve facilement ?
                                    </p>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <a
                                            href={whatsappDossierLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => navigate('/suivre-ma-demande')}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                                        >
                                            <MessageCircle size={18} /> Partager sur WhatsApp
                                        </a>
                                        <button
                                            onClick={() => navigate('/suivre-ma-demande')}
                                            className="rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-white"
                                        >
                                            Continuer sans partager
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    /* ────────────────────────────────────────────
       ÉTAPE 1 : Informations personnelles
    ──────────────────────────────────────────── */

    if (step === 'infos') {
        return (
            <Shell telephone={infos?.telephone} step={step}>
                <div className="flex flex-1 gap-8">
                    {/* Form card */}
                    <div className="flex-1">
                        {/* Card header */}
                        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                                <User size={22} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-display text-base font-bold text-pacifique-navy-900">
                                            Inscription à la formation
                                        </h2>
                                        <p className="text-[11px] text-pacifique-navy-700/55">
                                            Remplissez vos informations en quelques minutes. C'est rapide et sécurisé.
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-pacifique-blue-50 px-3 py-1 text-xs font-semibold text-pacifique-blue-700">
                                        Étape 1 sur 4
                                    </span>
                                </div>
                                <ProgressBar step={step} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <StepHeader
                                num={1}
                                title="Informations personnelles"
                                subtitle="Veuillez renseigner vos informations exactes. Elles nous permettront de créer votre dossier."
                            />

                            <form onSubmit={handleInfosSubmit} className="space-y-5">
                                {/* Nom + Prénom */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <FormField label="Nom" required>
                                        <TextInput
                                            value={nom}
                                            onChange={setNom}
                                            placeholder="Ex : MBELE"
                                            required
                                            icon={User}
                                        />
                                    </FormField>
                                    <FormField label="Prénom" required>
                                        <TextInput
                                            value={prenom}
                                            onChange={setPrenom}
                                            placeholder="Ex : Jean"
                                            required
                                            icon={User}
                                        />
                                    </FormField>
                                </div>

                                {/* Date de naissance + Lieu */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <FormField label="Date de naissance" required>
                                        <TextInput
                                            value={dateNaissance}
                                            onChange={setDateNaissance}
                                            placeholder="JJ / MM / AAAA"
                                            type="date"
                                            required
                                            icon={CalendarDays}
                                        />
                                    </FormField>
                                    <FormField label="Lieu de naissance" required>
                                        <TextInput
                                            value={lieuNaissance}
                                            onChange={setLieuNaissance}
                                            placeholder="Ex : Kribi"
                                            required
                                            icon={MapPin}
                                        />
                                    </FormField>
                                </div>

                                {/* Téléphone + Email */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <FormField
                                        label="Téléphone"
                                        required
                                        hint="Votre numéro MTN ou Orange."
                                    >
                                        <TextInput
                                            value={telephone}
                                            onChange={setTelephone}
                                            placeholder="Ex : 6 99 00 00 00"
                                            type="tel"
                                            required
                                            icon={Phone}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Email (optionnel)"
                                        hint="Nous vous enverrons votre référence de dossier (facultatif)."
                                    >
                                        <TextInput
                                            value={email}
                                            onChange={setEmail}
                                            placeholder="jean@email.com"
                                            type="email"
                                            icon={Mail}
                                        />
                                    </FormField>
                                </div>

                                {/* Choix du Permis / Formation */}
                                <FormField
                                    label="Permis / Formation souhaité"
                                    required
                                    hint="Sélectionnez le type de permis ou formation pour lequel vous vous inscrivez."
                                >
                                    {formationChoisie && !allowFormationChange ? (
                                        <div className="flex items-center justify-between rounded-xl border border-pacifique-blue-200 bg-pacifique-blue-50/80 px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pacifique-blue-600 text-white">
                                                    <GraduationCap size={18} />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-bold text-pacifique-navy-900">{formationChoisie.titre}</p>
                                                    <p className="text-xs font-semibold text-pacifique-blue-700">
                                                        <PrixDisplay formation={formationChoisie} />
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setAllowFormationChange(true)}
                                                className="flex items-center gap-1 text-xs font-bold text-pacifique-blue-600 hover:text-pacifique-blue-800"
                                            >
                                                <Pencil size={12} /> Modifier
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {categories.map((cat) => (
                                                <div key={cat.id} className="space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-pacifique-navy-700/50">
                                                        {cat.titre}
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                        {cat.formations.map((f) => {
                                                            const selected = formationId === f.id;
                                                            const hasRed = reductionActive(f);
                                                            const px = hasRed ? f.prix_reduit : f.prix;
                                                            return (
                                                                <button
                                                                    key={f.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormationId(f.id);
                                                                        setAllowFormationChange(false);
                                                                        setError(null);
                                                                    }}
                                                                    className={cls(
                                                                        'relative flex items-center justify-between rounded-xl border p-3 text-left transition-all',
                                                                        selected
                                                                            ? 'border-pacifique-blue-500 bg-pacifique-blue-50/90 ring-2 ring-pacifique-blue-400 shadow-sm'
                                                                            : 'border-gray-200 bg-white hover:border-pacifique-blue-200 hover:bg-gray-50',
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                                        <span className={cls(
                                                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                                                                            selected ? 'bg-pacifique-blue-600 text-white' : 'bg-gray-100 text-pacifique-navy-700/60'
                                                                        )}>
                                                                            {selected ? <Check size={12} strokeWidth={3} /> : <GraduationCap size={14} />}
                                                                        </span>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-bold text-pacifique-navy-900 truncate">{f.titre}</p>
                                                                            {f.duree && (
                                                                                <p className="text-[10px] text-pacifique-navy-700/45">{f.duree}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="shrink-0 text-right">
                                                                        {hasRed && (
                                                                            <p className="text-[10px] text-pacifique-navy-700/40 line-through">
                                                                                {f.prix?.toLocaleString('fr-FR')} {f.devise}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-xs font-extrabold text-pacifique-navy-900">
                                                                            {px?.toLocaleString('fr-FR')} {f.devise}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </FormField>

                                {/* RGPD notice */}
                                <div className="flex items-start gap-3 rounded-xl bg-pacifique-blue-50 px-4 py-3">
                                    <Info size={16} className="mt-0.5 shrink-0 text-pacifique-blue-600" />
                                    <p className="text-[11px] leading-relaxed text-pacifique-blue-800">
                                        Vos informations sont sécurisées et ne seront utilisées que pour la gestion de votre dossier
                                        à l'Auto-École Pacifique.
                                    </p>
                                </div>

                                {error && (
                                    <p className="rounded-xl bg-pacifique-red-100/60 p-3 text-xs font-semibold text-pacifique-red-600">
                                        ⚠️ {error}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-1.5 text-[11px] text-pacifique-navy-700/45">
                                        <Lock size={12} />
                                        Connexion sécurisée • Données protégées
                                    </div>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 rounded-xl bg-pacifique-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700"
                                    >
                                        Continuer vers le récapitulatif →
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <RightColumn formation={formationChoisie} whatsappLink={whatsappLink} />
                </div>
            </Shell>
        );
    }

    /* ────────────────────────────────────────────
       ÉTAPE 2 : Choix de la formation
    ──────────────────────────────────────────── */

    if (step === 'formation') {
        return (
            <Shell telephone={infos?.telephone} step={step}>
                <div className="flex flex-1 gap-8">
                    <div className="flex-1">
                        {/* Card header */}
                        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                                <GraduationCap size={22} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-display text-base font-bold text-pacifique-navy-900">
                                            Inscription à la formation
                                        </h2>
                                        <p className="text-[11px] text-pacifique-navy-700/55">
                                            Choisissez la formation qui correspond à votre projet.
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-pacifique-blue-50 px-3 py-1 text-xs font-semibold text-pacifique-blue-700">
                                        Étape 2 sur 4
                                    </span>
                                </div>
                                <ProgressBar step={step} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <button
                                onClick={() => goTo('infos')}
                                className="mb-5 flex items-center gap-1.5 text-sm text-pacifique-navy-700/55 hover:text-pacifique-navy-900"
                            >
                                <ArrowLeft size={14} /> Retour
                            </button>

                            <StepHeader
                                num={2}
                                title="Choix de la formation"
                                subtitle="Sélectionnez le type de permis ou de formation que vous souhaitez obtenir."
                            />

                            {/* Pre-selected from URL */}
                            {formationChoisie && !allowFormationChange ? (
                                <div className="mb-5 flex items-center justify-between rounded-xl border border-pacifique-blue-200 bg-pacifique-blue-50 px-4 py-3">
                                    <div>
                                        <p className="text-[11px] text-pacifique-blue-700/70">Formation sélectionnée</p>
                                        <p className="font-semibold text-pacifique-navy-900">{formationChoisie.titre}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAllowFormationChange(true)}
                                        className="flex items-center gap-1 text-xs font-bold text-pacifique-blue-600 hover:text-pacifique-blue-800"
                                    >
                                        <Pencil size={12} /> Modifier
                                    </button>
                                </div>
                            ) : (
                                /* Formation cards by category */
                                <div className="space-y-6">
                                    {categories.map((cat) => (
                                        <div key={cat.id}>
                                            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-pacifique-navy-700/55">
                                                {cat.titre}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {cat.formations.map((f) => {
                                                    const selected = formationId === f.id;
                                                    const hasRed = reductionActive(f);
                                                    const px = hasRed ? f.prix_reduit : f.prix;
                                                    return (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            onClick={() => setFormationId(f.id)}
                                                            className={cls(
                                                                'relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                                                                selected
                                                                    ? 'border-pacifique-blue-500 bg-pacifique-blue-50 shadow-md shadow-pacifique-blue-100'
                                                                    : 'border-gray-200 bg-white hover:border-pacifique-blue-200 hover:shadow-sm',
                                                            )}
                                                        >
                                                            {selected && (
                                                                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-pacifique-blue-600 text-white">
                                                                    <Check size={11} strokeWidth={3} />
                                                                </span>
                                                            )}
                                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pacifique-blue-50 text-pacifique-blue-600">
                                                                <GraduationCap size={18} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-pacifique-navy-900">{f.titre}</p>
                                                                {f.description && (
                                                                    <p className="mt-0.5 line-clamp-2 text-[11px] text-pacifique-navy-700/55">
                                                                        {f.description}
                                                                    </p>
                                                                )}
                                                                <div className="mt-1.5 flex items-center gap-2">
                                                                    {hasRed && (
                                                                        <span className="text-[11px] text-pacifique-navy-700/40 line-through">
                                                                            {f.prix?.toLocaleString('fr-FR')} {f.devise}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-sm font-bold text-pacifique-navy-900">
                                                                        {px?.toLocaleString('fr-FR')} {f.devise}
                                                                    </span>
                                                                    {hasRed && f.motif_reduction && (
                                                                        <span className="rounded-full bg-pacifique-red-100 px-2 py-0.5 text-[10px] font-bold text-pacifique-red-600">
                                                                            {f.motif_reduction}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="mt-4 text-sm text-pacifique-red-500">{error}</p>}

                            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-pacifique-navy-700/45">
                                    <Lock size={12} />
                                    Connexion sécurisée
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFormationNext}
                                    className="flex items-center gap-2 rounded-xl bg-pacifique-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700"
                                >
                                    Voir le récapitulatif →
                                </button>
                            </div>
                        </div>
                    </div>

                    <RightColumn formation={formationChoisie} whatsappLink={whatsappLink} />
                </div>
            </Shell>
        );
    }

    /* ────────────────────────────────────────────
       ÉTAPE 3 : Récapitulatif
    ──────────────────────────────────────────── */

    if (step === 'recap') {
        return (
            <Shell telephone={infos?.telephone} step={step}>
                <div className="flex flex-1 gap-8">
                    <div className="flex-1">
                        {/* Card header */}
                        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                                <CheckCircle2 size={22} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-display text-base font-bold text-pacifique-navy-900">
                                            Inscription à la formation
                                        </h2>
                                        <p className="text-[11px] text-pacifique-navy-700/55">
                                            Vérifiez vos informations avant de valider.
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-pacifique-blue-50 px-3 py-1 text-xs font-semibold text-pacifique-blue-700">
                                        Étape 3 sur 4
                                    </span>
                                </div>
                                <ProgressBar step={step} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <button
                                onClick={() => goTo('formation')}
                                className="mb-5 flex items-center gap-1.5 text-sm text-pacifique-navy-700/55 hover:text-pacifique-navy-900"
                            >
                                <ArrowLeft size={14} /> Retour
                            </button>

                            <StepHeader
                                num={3}
                                title="Récapitulatif"
                                subtitle="Vérifiez que toutes vos informations sont correctes avant de soumettre votre demande."
                            />

                            <div className="space-y-5">
                                {/* Personal infos recap */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-pacifique-navy-900">
                                            <User size={15} className="text-pacifique-blue-600" />
                                            Informations personnelles
                                        </h3>
                                        <button
                                            onClick={() => goTo('infos')}
                                            className="flex items-center gap-1 text-xs font-bold text-pacifique-blue-600 hover:text-pacifique-blue-800"
                                        >
                                            <Pencil size={11} /> Modifier
                                        </button>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <RecapField label="Nom" value={nom} />
                                        <RecapField label="Prénom" value={prenom} />
                                        <RecapField label="Date de naissance" value={dateNaissance
                                            ? new Date(dateNaissance).toLocaleDateString('fr-FR')
                                            : '—'} />
                                        <RecapField label="Lieu de naissance" value={lieuNaissance || '—'} />
                                        <RecapField label="Téléphone" value={telephone} />
                                        <RecapField label="Email" value={email || '—'} />
                                    </div>
                                </div>

                                {/* Formation recap */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-pacifique-navy-900">
                                            <GraduationCap size={15} className="text-pacifique-blue-600" />
                                            Formation choisie
                                        </h3>
                                        <button
                                            onClick={() => goTo('formation')}
                                            className="flex items-center gap-1 text-xs font-bold text-pacifique-blue-600 hover:text-pacifique-blue-800"
                                        >
                                            <Pencil size={11} /> Modifier
                                        </button>
                                    </div>
                                    {formationChoisie ? (
                                        <div className="mt-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-pacifique-navy-900">{formationChoisie.titre}</p>
                                                {formationChoisie.description && (
                                                    <p className="mt-0.5 text-[11px] text-pacifique-navy-700/55">
                                                        {formationChoisie.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                {reductionActive(formationChoisie) && (
                                                    <p className="text-xs text-pacifique-navy-700/40 line-through">
                                                        {formationChoisie.prix?.toLocaleString('fr-FR')} {formationChoisie.devise}
                                                    </p>
                                                )}
                                                <p className="text-lg font-extrabold text-pacifique-navy-900">
                                                    <PrixDisplay formation={formationChoisie} />
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-pacifique-red-500">Aucune formation sélectionnée.</p>
                                    )}
                                </div>
                            </div>

                            {error && <p className="mt-4 text-sm text-pacifique-red-500">{error}</p>}

                            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-pacifique-navy-700/45">
                                    <Lock size={12} />
                                    Vos données sont protégées
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting || !formationChoisie}
                                    className="flex items-center gap-2 rounded-xl bg-pacifique-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700 disabled:opacity-60"
                                >
                                    {submitting ? 'Enregistrement…' : 'Confirmer et continuer →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <RightColumn formation={formationChoisie} whatsappLink={whatsappLink} />
                </div>
            </Shell>
        );
    }

    /* ────────────────────────────────────────────
       ÉTAPE 4 : Paiement (après soumission RPC)
    ──────────────────────────────────────────── */

    return (
        <Shell telephone={infos?.telephone} step={step}>
            <div className="flex flex-1 gap-8">
                <div className="flex-1">
                    {/* Card header */}
                    <div className="mb-5 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-50 text-pacifique-blue-600">
                            <CreditCard size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-display text-base font-bold text-pacifique-navy-900">
                                        Inscription à la formation
                                    </h2>
                                    <p className="text-[11px] text-pacifique-navy-700/55">
                                        Finalisez votre inscription en réglant les frais.
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-pacifique-blue-50 px-3 py-1 text-xs font-semibold text-pacifique-blue-700">
                                    Étape 4 sur 4
                                </span>
                            </div>
                            <ProgressBar step={step} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <StepHeader
                            num={4}
                            title="Paiement"
                            subtitle="Choisissez votre mode de paiement pour finaliser votre inscription."
                        />

                        {/* Dossier number display */}
                        {dossier && (
                            <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                    <div>
                                        <p className="text-[11px] text-emerald-700/70">Dossier créé avec succès</p>
                                        <p className="font-mono text-sm font-bold text-emerald-800">{dossier}</p>
                                    </div>
                                </div>
                                <button onClick={copyDossier} className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100">
                                    <Copy size={16} />
                                </button>
                            </div>
                        )}

                        {/* Amount */}
                        {montant != null && (
                            <div className="mb-6 rounded-xl bg-pacifique-blue-50 px-4 py-3">
                                <p className="text-[11px] text-pacifique-blue-700/70">Montant à régler</p>
                                <p className="mt-0.5 text-2xl font-extrabold text-pacifique-navy-900">
                                    {montant.toLocaleString('fr-FR')}{' '}
                                    <span className="text-base font-bold">{formationChoisie?.devise}</span>
                                </p>
                            </div>
                        )}

                        <p className="mb-4 text-sm font-semibold text-pacifique-navy-800">
                            Souhaitez-vous finaliser votre inscription maintenant ?
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={triggerKPayDirect}
                                disabled={payLoading}
                                className="flex items-center justify-center gap-2 rounded-xl bg-pacifique-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-pacifique-blue-700 disabled:opacity-60"
                            >
                                <CreditCard size={16} />
                                {payLoading ? 'Redirection vers K-Pay…' : '💳 Payer maintenant via K-Pay'}
                            </button>
                            {payError && <p className="mt-1 text-xs text-pacifique-red-500">{payError}</p>}
                            <button
                                type="button"
                                onClick={handlePaySurPlace}
                                disabled={payLoading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-pacifique-navy-800 hover:bg-gray-50 disabled:opacity-60"
                            >
                                <Building2 size={16} />
                                Paiement sur place (en agence)
                            </button>
                            {!showShareConfirmation ? (
                                <button
                                    type="button"
                                    onClick={() => setShowShareConfirmation(true)}
                                    className="rounded-xl border border-gray-200 py-3 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50"
                                >
                                    Payer plus tard
                                </button>
                            ) : (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                    <p className="text-sm text-pacifique-navy-800">
                                        Souhaitez-vous envoyer votre numéro de dossier sur WhatsApp à Auto-École Pacifique ?
                                    </p>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <a
                                            href={whatsappDossierLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => navigate('/suivre-ma-demande')}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                                        >
                                            <MessageCircle size={16} /> Partager sur WhatsApp
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/suivre-ma-demande')}
                                            className="rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-white"
                                        >
                                            Continuer sans partager
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <RightColumn formation={formationChoisie} whatsappLink={whatsappLink} />
            </div>
        </Shell>
    );
}

/* ─── Helper sub-component ───────────────────────────────── */

function RecapField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-pacifique-navy-700/45">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-pacifique-navy-900">{value || '—'}</p>
        </div>
    );
}
