import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

export default function Login() {
    const { isAuthenticated, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/admin" replace />;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setSubmitting(false);
        if (error) setError("Email ou mot de passe incorrect.");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-pacifique-offwhite px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
            >
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
                        <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
                    </span>
                    <div>
                        <h1 className="font-display text-lg font-bold text-pacifique-navy-900 leading-tight">
                            PACIFIQUE
                        </h1>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-pacifique-blue-600">
                            Espace Administration
                        </p>
                    </div>
                </div>

                <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                />

                <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">
                    Mot de passe
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                />

                {error && <p className="mb-4 text-sm text-pacifique-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-pacifique-navy-900 py-2.5 font-medium text-white transition hover:bg-pacifique-navy-700 disabled:opacity-60"
                >
                    {submitting ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
}