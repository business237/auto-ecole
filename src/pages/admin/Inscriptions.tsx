import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Inscription } from '@/lib/database.types';
import PermisIcon from '@/components/ui/PermisIcon';

type InscriptionAvecFormation = Inscription & { formation: { titre: string } | null };

const STATUTS: Inscription['statut'][] = [
    'en_attente', 'dossier_incomplet', 'valide', 'formation_en_cours', 'termine', 'refusee',
];

const STATUT_LABELS: Record<Inscription['statut'], string> = {
    en_attente: 'En attente',
    dossier_incomplet: 'Dossier incomplet',
    valide: 'Validé',
    formation_en_cours: 'Formation en cours',
    termine: 'Terminé',
    refusee: 'Refusée',
};

export default function Inscriptions() {
    const [inscriptions, setInscriptions] = useState<InscriptionAvecFormation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState<Inscription['statut'] | 'tous'>('tous');

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('inscriptions')
            .select('*, formation:formations(titre)')
            .order('created_at', { ascending: false });
        setInscriptions((data as InscriptionAvecFormation[]) ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function updateStatut(id: string, statut: Inscription['statut']) {
        await supabase.from('inscriptions').update({ statut }).eq('id', id);
        load();
    }

    const filtered = filtre === 'tous' ? inscriptions : inscriptions.filter((i) => i.statut === filtre);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Demandes d'inscription</h2>
                <select
                    value={filtre}
                    onChange={(e) => setFiltre(e.target.value as Inscription['statut'] | 'tous')}
                    className="rounded-lg border px-3 py-2 text-sm"
                >
                    <option value="tous">Tous les statuts</option>
                    {STATUTS.map((s) => (
                        <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune demande.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ins) => (
                        <div key={ins.id} className="rounded-xl border bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-medium text-pacifique-navy-900">
                                        {ins.nom} {ins.prenom}
                                    </h3>
                                    <p className="text-sm text-pacifique-navy-700/60">
                                        {ins.telephone} · {ins.email} {ins.ville && `· ${ins.ville}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-sm text-pacifique-navy-800 font-medium mt-1">
                                        <PermisIcon titre={ins.formation?.titre} size={16} className="h-4 w-4 text-pacifique-blue-600 flex-shrink-0" />
                                        <span>Formation : {ins.formation?.titre ?? '—'}</span>
                                    </div>
                                    {ins.message && (
                                        <p className="mt-1 text-sm text-pacifique-navy-700/80">« {ins.message} »</p>
                                    )}
                                    <p className="mt-1 text-xs text-pacifique-navy-700/40">
                                        Reçue le {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <select
                                    value={ins.statut}
                                    onChange={(e) => updateStatut(ins.id, e.target.value as Inscription['statut'])}
                                    className="rounded-lg border px-3 py-2 text-sm"
                                >
                                    {STATUTS.map((s) => (
                                        <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}