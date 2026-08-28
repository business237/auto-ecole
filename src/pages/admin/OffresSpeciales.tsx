import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OffreSpeciale } from '@/lib/database.types';

type FormState = Omit<OffreSpeciale, 'id' | 'created_at'>;

const EMPTY_FORM: FormState = { titre: '', description: '', lien: '', date_fin: '', actif: true };

function toDatetimeLocal(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OffresSpeciales() {
    const [offres, setOffres] = useState<OffreSpeciale[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        const { data } = await supabase.from('offres_speciales').select('*').order('created_at', { ascending: false });
        setOffres(data ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    }

    function openEdit(o: OffreSpeciale) {
        setEditingId(o.id);
        setForm({
            titre: o.titre,
            description: o.description,
            lien: o.lien,
            date_fin: toDatetimeLocal(o.date_fin),
            actif: o.actif,
        });
        setShowForm(true);
    }

    async function handleSubmit() {
        setSaving(true);
        const payload = { ...form, date_fin: new Date(form.date_fin).toISOString() };

        if (editingId) {
            await supabase.from('offres_speciales').update(payload).eq('id', editingId);
        } else {
            await supabase.from('offres_speciales').insert(payload);
        }

        setSaving(false);
        setShowForm(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette offre ?')) return;
        await supabase.from('offres_speciales').delete().eq('id', id);
        load();
    }

    async function toggleActif(o: OffreSpeciale) {
        await supabase.from('offres_speciales').update({ actif: !o.actif }).eq('id', o.id);
        load();
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Offres spéciales</h2>
                <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700">
                    <Plus size={16} /> Ajouter
                </button>
            </div>

            <p className="mb-4 text-xs text-pacifique-navy-700/50">
                La dernière offre active dont la date de fin n'est pas dépassée s'affiche automatiquement en carte flottante sur tout le site.
            </p>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : offres.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune offre pour l'instant.</p>
            ) : (
                <div className="space-y-3">
                    {offres.map((o) => {
                        const expiree = new Date(o.date_fin) < new Date();
                        return (
                            <div key={o.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-pacifique-navy-900">{o.titre}</h3>
                                        {!o.actif && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Désactivée</span>}
                                        {expiree && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Expirée</span>}
                                    </div>
                                    <p className="text-sm text-pacifique-navy-700/60">
                                        Jusqu'au {new Date(o.date_fin).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleActif(o)} className="rounded-lg px-3 py-1.5 text-sm text-pacifique-navy-700 hover:bg-gray-100">
                                        {o.actif ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button onClick={() => openEdit(o)} className="rounded-lg p-2 text-pacifique-navy-700 hover:bg-gray-100">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(o.id)} className="rounded-lg p-2 text-pacifique-red-500 hover:bg-pacifique-red-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">{editingId ? "Modifier l'offre" : 'Nouvelle offre'}</h3>
                            <button onClick={() => setShowForm(false)}><X size={18} /></button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Titre</label>
                                <input
                                    value={form.titre}
                                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                    placeholder="Ex: Promo rentrée scolaire"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Description</label>
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    placeholder="Ex: -15% sur toutes les formations jusqu'au 15 septembre"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Lien (optionnel)</label>
                                <input
                                    value={form.lien ?? ''}
                                    onChange={(e) => setForm({ ...form, lien: e.target.value })}
                                    placeholder="/formations"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Expire le</label>
                                <input
                                    type="datetime-local"
                                    value={form.date_fin}
                                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving || !form.titre || !form.date_fin}
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