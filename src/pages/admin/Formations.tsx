import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Formation } from '@/lib/database.types';
import PermisIcon from '@/components/ui/PermisIcon';

type FormState = Omit<Formation, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_FORM: FormState = {
    titre: '',
    description: '',
    prix: null,
    devise: 'FCFA',
    duree: '',
    inclus: [],
    ordre: 0,
    actif: true,
    prix_reduit: null,
    motif_reduction: '',
    reduction_debut: null,
    reduction_fin: null,
};

export default function Formations() {
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [inclusText, setInclusText] = useState('');
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('formations')
            .select('*')
            .order('ordre', { ascending: true });
        setFormations(data ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setInclusText('');
        setShowForm(true);
    }

    function openEdit(f: Formation) {
        setEditingId(f.id);
        setForm({
            titre: f.titre,
            description: f.description,
            prix: f.prix,
            devise: f.devise,
            duree: f.duree,
            inclus: f.inclus,
            ordre: f.ordre,
            actif: f.actif,
            prix_reduit: f.prix_reduit,
            motif_reduction: f.motif_reduction,
            reduction_debut: f.reduction_debut,
            reduction_fin: f.reduction_fin,
        });
        setInclusText((f.inclus ?? []).join(', '));
        setShowForm(true);
    }

    async function handleSubmit() {
        setSaving(true);
        const payload = {
            ...form,
            inclus: inclusText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        };

        if (editingId) {
            await supabase.from('formations').update(payload).eq('id', editingId);
        } else {
            await supabase.from('formations').insert(payload);
        }

        setSaving(false);
        setShowForm(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette formation ?')) return;
        await supabase.from('formations').delete().eq('id', id);
        load();
    }

    async function toggleActif(f: Formation) {
        await supabase.from('formations').update({ actif: !f.actif }).eq('id', f.id);
        load();
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Formations & tarifs</h2>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700"
                >
                    <Plus size={16} /> Ajouter
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : formations.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune formation pour l'instant.</p>
            ) : (
                <div className="space-y-3">
                    {formations.map((f) => (
                        <div
                            key={f.id}
                            className="flex items-center justify-between rounded-xl border bg-white p-4"
                        >
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pacifique-navy-900 text-white flex-shrink-0">
                                        <PermisIcon titre={f.titre} size={16} className="h-4 w-4" />
                                    </span>
                                    <h3 className="font-medium text-pacifique-navy-900">{f.titre}</h3>
                                    {!f.actif && (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                            Masqué
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-pacifique-navy-700/60">
                                    {f.prix?.toLocaleString('fr-FR')} {f.devise} · {f.duree}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActif(f)}
                                    className="rounded-lg px-3 py-1.5 text-sm text-pacifique-navy-700 hover:bg-gray-100"
                                >
                                    {f.actif ? 'Masquer' : 'Afficher'}
                                </button>
                                <button
                                    onClick={() => openEdit(f)}
                                    className="rounded-lg p-2 text-pacifique-navy-700 hover:bg-gray-100"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(f.id)}
                                    className="rounded-lg p-2 text-pacifique-red-500 hover:bg-pacifique-red-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">
                                {editingId ? 'Modifier la formation' : 'Nouvelle formation'}
                            </h3>
                            <button onClick={() => setShowForm(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Titre</label>
                                <input
                                    value={form.titre}
                                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Description</label>
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Prix</label>
                                    <input
                                        type="number"
                                        value={form.prix ?? ''}
                                        onChange={(e) =>
                                            setForm({ ...form, prix: e.target.value ? Number(e.target.value) : null })
                                        }
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Durée</label>
                                    <input
                                        value={form.duree ?? ''}
                                        onChange={(e) => setForm({ ...form, duree: e.target.value })}
                                        placeholder="ex: 1 mois"
                                        className="w-full rounded-lg border px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Inclus (séparés par des virgules)
                                </label>
                                <input
                                    value={inclusText}
                                    onChange={(e) => setInclusText(e.target.value)}
                                    placeholder="Code, Conduite, Examen blanc"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={form.ordre}
                                    onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div className="mt-4 rounded-xl border border-pacifique-red-100 bg-pacifique-red-50/40 p-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-pacifique-red-600">
                                    Réduction (optionnel)
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Prix réduit</label>
                                        <input
                                            type="number"
                                            value={form.prix_reduit ?? ''}
                                            onChange={(e) =>
                                                setForm({ ...form, prix_reduit: e.target.value ? Number(e.target.value) : null })
                                            }
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Motif</label>
                                        <input
                                            value={form.motif_reduction ?? ''}
                                            onChange={(e) => setForm({ ...form, motif_reduction: e.target.value })}
                                            placeholder="Ex: Rentrée scolaire"
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Début</label>
                                        <input
                                            type="date"
                                            value={form.reduction_debut ?? ''}
                                            onChange={(e) => setForm({ ...form, reduction_debut: e.target.value || null })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Fin</label>
                                        <input
                                            type="date"
                                            value={form.reduction_fin ?? ''}
                                            onChange={(e) => setForm({ ...form, reduction_fin: e.target.value || null })}
                                            className="w-full rounded-lg border px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <p className="mt-2 text-xs text-pacifique-navy-700/50">
                                    Laisse "Prix réduit" vide pour ne pas afficher de réduction sur cette formation.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving || !form.titre}
                            className="mt-5 w-full rounded-lg bg-pacifique-navy-900 py-2.5 font-medium text-white disabled:opacity-60"
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}