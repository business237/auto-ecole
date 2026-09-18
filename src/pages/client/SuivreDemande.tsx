import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, GraduationCap, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Resultat = {
    numero_dossier: string;
    token_acces: string;
    telephone: string;
    nom: string;
    prenom: string;
    statut: string;
    formation_titre: string | null;
    created_at: string;
    paiement_statut: string | null;
    paiement_reference: string | null;
};

const STATUT_LABELS: Record<string, { label: string; className: string }> = {
    nouveau: { label: 'Nouveau', className: 'bg-amber-100 text-amber-700' },
    a_verifier: { label: 'À vérifier', className: 'bg-orange-100 text-orange-700' },
    incomplet: { label: 'Dossier incomplet', className: 'bg-orange-100 text-orange-700' },
    valide: { label: 'Dossier validé', className: 'bg-blue-100 text-blue-700' },
    formation_en_cours: { label: 'Formation en cours', className: 'bg-indigo-100 text-indigo-700' },
    termine: { label: 'Formation terminée', className: 'bg-emerald-100 text-emerald-700' },
    refuse: { label: 'Refusée', className: 'bg-gray-100 text-gray-600' },
};

export default function SuivreDemande() {
    const [telephone, setTelephone] = useState('');
    const [numeroDossier, setNumeroDossier] = useState('');
    const [resultat, setResultat] = useState<Resultat | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResultat(null);
        setNotFound(false);

        const { data, error } = await supabase.rpc('suivre_dossier', {
            p_telephone: telephone,
            p_numero_dossier: numeroDossier.trim().toUpperCase(),
        });

        setLoading(false);
        if (error || !data || data.length === 0) {
            setNotFound(true);
            return;
        }
        setResultat(data[0]);
    }

    return (
        <div className="mx-auto min-h-screen max-w-lg bg-pacifique-offwhite px-4 py-16">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="mb-1 text-xl font-semibold text-pacifique-navy-900">Suivre ma demande</h1>
                <p className="mb-6 text-sm text-pacifique-navy-700/60">
                    Entrez votre téléphone et votre numéro de dossier reçus lors de votre inscription.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">Téléphone</label>
                        <input
                            type="tel"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            required
                            placeholder="Ex: 6 99 00 00 00"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">
                            Numéro de dossier
                        </label>
                        <input
                            value={numeroDossier}
                            onChange={(e) => setNumeroDossier(e.target.value)}
                            required
                            placeholder="Ex: PAC-2026-00009"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono outline-none focus:border-pacifique-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-pacifique-navy-900 py-2.5 font-medium text-white hover:bg-pacifique-navy-700 disabled:opacity-60"
                    >
                        <Search size={16} />
                        {loading ? 'Recherche...' : 'Suivre ma demande'}
                    </button>
                </form>

                {notFound && (
                    <p className="mt-5 rounded-lg bg-pacifique-red-100 px-4 py-3 text-sm text-pacifique-red-600">
                        Aucune demande trouvée avec ce téléphone et ce numéro de dossier. Vérifiez vos informations.
                    </p>
                )}

                {resultat && (
                    <div className="mt-6 rounded-xl border bg-pacifique-offwhite p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-pacifique-navy-900">
                                {resultat.prenom} {resultat.nom}
                            </h3>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_LABELS[resultat.statut]?.className ?? 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {STATUT_LABELS[resultat.statut]?.label ?? resultat.statut}
                            </span>
                        </div>

                        <p className="mt-3 flex items-center gap-2 text-sm text-pacifique-navy-700/80">
                            <Phone size={14} className="text-pacifique-navy-700/40" />
                            {resultat.telephone}
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-pacifique-navy-700/80">
                            <p className="flex items-center gap-2">
                                <Phone size={14} className="text-pacifique-navy-700/40" />
                                Dossier {resultat.numero_dossier}
                            </p>
                            {resultat.formation_titre && (
                                <p className="flex items-center gap-2">
                                    <GraduationCap size={14} className="text-pacifique-navy-700/40" />
                                    {resultat.formation_titre}
                                </p>
                            )}
                            <p className="flex items-center gap-2">
                                <Calendar size={14} className="text-pacifique-navy-700/40" />
                                Déposée le {new Date(resultat.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>

                        {resultat.paiement_statut && (
                            <p className="mt-3 flex items-center gap-2 text-sm">
                                <span className="text-pacifique-navy-700/60">Paiement :</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        resultat.paiement_statut === 'confirme'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : resultat.paiement_statut === 'rejete'
                                            ? 'bg-pacifique-red-100 text-pacifique-red-600'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {resultat.paiement_statut === 'confirme'
                                        ? 'Confirmé'
                                        : resultat.paiement_statut === 'rejete'
                                        ? 'Rejeté'
                                        : 'En attente'}
                                </span>
                            </p>
                        )}

                        <Link
                            to={`/suivi/${resultat.numero_dossier}?token=${resultat.token_acces}`}
                            className="mt-4 block w-full rounded-lg bg-pacifique-navy-900 py-2.5 text-center font-medium text-white hover:bg-pacifique-navy-700"
                        >
                            Accéder à mon dossier complet
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}