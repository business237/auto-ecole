import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    CheckCircle2, 
    AlertCircle, 
    Phone, 
    Sparkles, 
    Loader2, 
    ArrowLeft 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

interface AuthFormProps {
    initialMode?: 'login' | 'signup';
}

export default function AuthForm({ initialMode = 'signup' }: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const { isAuthenticated, isAdmin, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // Form inputs
    const [nomComplet, setNomComplet] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // States
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // If already authenticated and not currently submitting a new action
    if (!loading && !submitting && !successMessage) {
        if (isAdmin) {
            navigate('/admin', { replace: true });
            return null;
        }
        if (isAuthenticated) {
            navigate('/mon-compte', { replace: true });
            return null;
        }
    }

    async function handleSignup(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!nomComplet.trim()) {
            setError('Veuillez saisir votre nom complet.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit comporter au moins 6 caractères.');
            return;
        }

        setSubmitting(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        nom_complet: nomComplet.trim(),
                        telephone: telephone.trim() || undefined,
                    },
                },
            });

            if (signUpError) {
                if (
                    signUpError.message.toLowerCase().includes('already') ||
                    signUpError.message.toLowerCase().includes('exists') ||
                    signUpError.status === 422
                ) {
                    setError('Cet email est déjà utilisé. Veuillez vous connecter.');
                } else {
                    setError(signUpError.message || "Une erreur est survenue lors de l'inscription.");
                }
                setSubmitting(false);
                return;
            }

            // If user was created, create/update profile record
            if (data.user) {
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    nom_complet: nomComplet.trim(),
                    telephone: telephone.trim() || null,
                    role: 'client',
                });
                await refreshProfile();
            }

            setSuccessMessage(`Bienvenue, ${nomComplet.trim()} ! Votre compte a été créé avec succès.`);
            setSubmitting(false);

            // Smooth redirect to dashboard
            setTimeout(() => {
                navigate('/mon-compte');
            }, 1200);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
            setError(errMsg);
            setSubmitting(false);
        }
    }

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (signInError) {
                if (signInError.message.toLowerCase().includes('invalid login credentials')) {
                    setError('Adresse email ou mot de passe incorrect.');
                } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
                    setError('Veuillez vérifier vos emails pour confirmer votre compte.');
                } else {
                    setError(signInError.message || 'Impossible de se connecter.');
                }
                setSubmitting(false);
                return;
            }

            if (data.user) {
                await refreshProfile();
            }

            setSuccessMessage('Connexion réussie ! Heureux de vous revoir.');
            setSubmitting(false);

            setTimeout(() => {
                navigate('/mon-compte');
            }, 1000);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
            setError(errMsg);
            setSubmitting(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-pacifique-navy-950 via-pacifique-navy-900 to-[#071322] px-4 py-12 sm:px-6 lg:px-8 text-white">
            {/* Ambient glowing circles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-pacifique-blue-500/20 blur-3xl animate-pulse" />
                <div className="absolute -right-28 -bottom-28 h-96 w-96 rounded-full bg-pacifique-red-500/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-72 w-72 rounded-full bg-pacifique-blue-600/10 blur-2xl" />

                {/* Subtle grid pattern */}
                <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#auth-grid)" />
                </svg>
            </div>

            {/* Back link */}
            <div className="relative z-10 w-full max-w-md mb-6 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-pacifique-blue-200/80 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour au site
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-pacifique-blue-200/60 font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-pacifique-blue-400" />
                    <span>Espace Candidat</span>
                </div>
            </div>

            {/* Card Container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-3xl bg-white/95 text-pacifique-navy-900 shadow-2xl shadow-pacifique-navy-950/50 backdrop-blur-xl border border-white/40 p-7 sm:p-9 transition-all">
                    {/* Brand header */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
                            <span className="flex h-11 w-11 overflow-hidden items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 group-hover:scale-105 transition-transform">
                                <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
                            </span>
                            <div className="text-left leading-none">
                                <span className="font-display text-lg font-extrabold tracking-tight text-pacifique-navy-900">
                                    PACIFIQUE
                                </span>
                                <span className="block text-[9px] font-bold uppercase tracking-widest text-pacifique-blue-600 mt-0.5">
                                    Auto-École Bilingue
                                </span>
                            </div>
                        </Link>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-pacifique-navy-900">
                            {mode === 'signup' ? 'Créer votre compte' : 'Bon retour parmi nous !'}
                        </h1>
                        <p className="mt-1.5 text-xs text-pacifique-navy-700/70">
                            {mode === 'signup'
                                ? 'Inscrivez-vous pour lancer votre formation et suivre votre dossier.'
                                : 'Accédez à votre tableau de bord et à vos demandes de formation.'}
                        </p>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100/90 p-1.5 border border-gray-200/70">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signup');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                                mode === 'signup'
                                    ? 'bg-pacifique-navy-900 text-white shadow-sm'
                                    : 'text-pacifique-navy-700/70 hover:text-pacifique-navy-900'
                            }`}
                        >
                            <User className="h-3.5 w-3.5" />
                            S'inscrire
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                                mode === 'login'
                                    ? 'bg-pacifique-navy-900 text-white shadow-sm'
                                    : 'text-pacifique-navy-700/70 hover:text-pacifique-navy-900'
                            }`}
                        >
                            <Lock className="h-3.5 w-3.5" />
                            Se connecter
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 animate-fade-in shadow-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-pacifique-red-500 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-semibold text-red-800">Attention</p>
                                <p className="mt-0.5 text-red-700/90">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Banner / Modal */}
                    {successMessage && (
                        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 animate-fade-in shadow-sm">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5 animate-bounce" />
                            <div className="text-xs">
                                <p className="font-bold text-emerald-900">Succès !</p>
                                <p className="mt-0.5 text-emerald-700">{successMessage}</p>
                                <p className="mt-1 font-medium text-emerald-600 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Redirection vers votre tableau de bord...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-pacifique-navy-800">
                                    Nom complet <span className="text-pacifique-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Jean Dupont"
                                        value={nomComplet}
                                        onChange={(e) => setNomComplet(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-pacifique-navy-900 placeholder:text-gray-400 focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20 transition"
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-pacifique-navy-800">
                                    Numéro de téléphone <span className="text-xs font-normal text-gray-500">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Ex: 6 99 00 00 00"
                                        value={telephone}
                                        onChange={(e) => setTelephone(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-pacifique-navy-900 placeholder:text-gray-400 focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20 transition"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-pacifique-navy-800">
                                Adresse email <span className="text-pacifique-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="nom@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-pacifique-navy-900 placeholder:text-gray-400 focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-pacifique-navy-800">
                                Mot de passe <span className="text-pacifique-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-11 py-3 text-sm text-pacifique-navy-900 placeholder:text-gray-400 focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-pacifique-navy-800 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p className="mt-1 text-[11px] text-gray-500">Au moins 6 caractères.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !!successMessage}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-pacifique-red-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 transition-all duration-300 hover:bg-pacifique-red-600 hover:shadow-pacifique-red-500/40 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {mode === 'signup' ? 'Création de votre compte...' : 'Connexion en cours...'}
                                </>
                            ) : mode === 'signup' ? (
                                <>
                                    <span>Créer mon compte</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom switch helper */}
                    <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-pacifique-navy-700/70">
                        {mode === 'signup' ? (
                            <p>
                                Vous possédez déjà un compte ?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('login');
                                        setError(null);
                                    }}
                                    className="font-bold text-pacifique-blue-600 hover:underline"
                                >
                                    Se connecter
                                </button>
                            </p>
                        ) : (
                            <p>
                                Nouveau chez Pacifique ?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('signup');
                                        setError(null);
                                    }}
                                    className="font-bold text-pacifique-red-500 hover:underline"
                                >
                                    Créer un compte candidat
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer security badge */}
                <div className="mt-6 text-center text-[11px] text-pacifique-blue-200/50 flex items-center justify-center gap-2">
                    <span>🔒 Données sécurisées • Auto-École Pacifique Bilingue Kribi</span>
                </div>
            </div>
        </div>
    );
}
