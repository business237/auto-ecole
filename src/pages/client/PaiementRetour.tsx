import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function PaiementRetour() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // K-Pay renvoie dossier + token directement dans l'URL
    const urlDossier = searchParams.get('dossier')
        || searchParams.get('numero_dossier')
        || searchParams.get('ref')
        || sessionStorage.getItem('kpay_dossier')
        || '';
    const urlToken = searchParams.get('token')
        || sessionStorage.getItem('kpay_token')
        || '';
    const urlRef = searchParams.get('transaction_id')
        || searchParams.get('kpay_ref')
        || searchParams.get('status')
        || 'KPAY_ONLINE';

    const [dossier] = useState(urlDossier);
    const [token] = useState(urlToken);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(4);
    const confirmedRef = useRef(false);

    useEffect(() => {
        if (!dossier) {
            setLoading(false);
            return;
        }

        // Éviter double exécution en StrictMode
        if (confirmedRef.current) return;
        confirmedRef.current = true;

        // Sauvegarder en sessionStorage comme filet de sécurité pour SuiviDossier
        sessionStorage.setItem('kpay_dossier', dossier);
        if (token) sessionStorage.setItem('kpay_token', token);

        async function confirmPayment() {
            try {
                // Utilise l'RPC (SECURITY DEFINER) pour vérifier l'existence du dossier
                // bypass RLS sans requête directe à la table applications
                const { data: rpcData } = await supabase.rpc('suivre_dossier_par_token', {
                    p_numero_dossier: dossier,
                    p_token: token,
                });

                if (rpcData && rpcData.length > 0) {
                    const { data: appRows } = await supabase
                        .from('applications')
                        .select('id, statut')
                        .eq('numero_dossier', dossier)
                        .limit(1);

                    if (appRows && appRows.length > 0) {
                        const app = appRows[0];

                        // Met à jour le paiement
                        await supabase
                            .from('payments')
                            .update({
                                statut: 'confirme',
                                confirme_at: new Date().toISOString(),
                                reference_transaction: urlRef,
                            })
                            .eq('application_id', app.id)
                            .in('statut', ['en_attente']);

                        // Met à jour le statut de la candidature si nécessaire
                        if (app.statut === 'nouveau' || app.statut === 'a_verifier') {
                            await supabase
                                .from('applications')
                                .update({ statut: 'valide', updated_at: new Date().toISOString() })
                                .eq('id', app.id);
                        }
                    }
                }
            } catch (err) {
                console.error('Erreur de confirmation (non bloquante):', err);
            } finally {
                setLoading(false);
            }
        }

        confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Compte à rebours + redirection automatique vers suivi
    useEffect(() => {
        if (loading || !dossier) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate(`/suivi/${encodeURIComponent(dossier)}?token=${encodeURIComponent(token)}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [loading, dossier, token, navigate]);

    const suiviUrl = dossier
        ? `/suivi/${encodeURIComponent(dossier)}?token=${encodeURIComponent(token)}`
        : '/suivre-demande';

    return (
        <div className="mx-auto flex min-h-screen max-w-lg items-center bg-gradient-to-br from-pacifique-blue-50 via-white to-pacifique-offwhite px-4 py-16">
            <div className="w-full rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-100">
                {loading ? (
                    <div className="py-8 flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-pacifique-blue-600 mb-4" />
                        <h2 className="text-lg font-semibold text-pacifique-navy-900">Confirmation du paiement…</h2>
                        <p className="mt-2 text-sm text-pacifique-navy-700/70">
                            Veuillez patienter pendant que nous finalisons votre dossier.
                        </p>
                    </div>
                ) : (
                    <div className="py-4">
                        {/* Icône succès */}
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50 mb-5">
                            <CheckCircle2 className="h-11 w-11 text-emerald-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-pacifique-navy-900">Paiement confirmé !</h1>

                        {dossier && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-pacifique-offwhite px-3 py-1.5">
                                <span className="text-xs text-pacifique-navy-700/60">Dossier</span>
                                <span className="font-mono text-sm font-bold text-pacifique-navy-900">{dossier}</span>
                            </div>
                        )}

                        <p className="mt-4 text-sm text-pacifique-navy-700/70 leading-relaxed">
                            Votre paiement en ligne a bien été reçu et validé.
                            Votre dossier est désormais actif et vous pouvez suivre son avancement.
                        </p>

                        {/* Barre de compte à rebours */}
                        <div className="mt-6 rounded-lg bg-pacifique-blue-50 px-4 py-3">
                            <p className="text-sm text-pacifique-blue-700">
                                Redirection automatique dans <span className="font-bold">{countdown}s</span>…
                            </p>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pacifique-blue-100">
                                <div
                                    className="h-full rounded-full bg-pacifique-blue-500 transition-all duration-1000"
                                    style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                                />
                            </div>
                        </div>

                        <Link
                            to={suiviUrl}
                            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pacifique-navy-900 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-pacifique-navy-800 hover:shadow-lg active:scale-95"
                        >
                            Accéder à mon suivi de dossier
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
