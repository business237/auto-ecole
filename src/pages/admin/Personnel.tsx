import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Personnel } from '@/lib/database.types';

type FormState = Omit<Personnel, 'id' | 'created_at'>;

const EMPTY_FORM: FormState = { nom: '', role: '', photo_url: null, bio: '', ordre: 0, actif: true };

export default function PersonnelAdmin() {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        const { data } = await supabase.from('personnel').select('*').order('ordre', { ascending: true });
        setPersonnel(data ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    }

    function openEdit(p: Personnel) {
        setEditingId(p.id);
        setForm({ nom: p.nom, role: p.role, photo_url: p.photo_url, bio: p.bio, ordre: p.ordre, actif: p.actif });
        setShowForm(true);
    }

    async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('personnel').upload(fileName, file);

        if (uploadError) {
            alert("Erreur lors de l'envoi de la photo : " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('personnel').getPublicUrl(fileName);
        setForm((f) => ({ ...f, photo_url: data.publicUrl }));
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit() {
        setSaving(true);
        if (editingId) {
            await supabase.from('personnel').update(form).eq('id', editingId);
        } else {
            await supabase.from('personnel').insert(form);
        }
        setSaving(false);
        setShowForm(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette personne ?')) return;
        await supabase.from('personnel').delete().eq('id', id);
        load();
    }

    async function toggleActif(p: Personnel) {
        await supabase.from('personnel').update({ actif: !p.actif }).eq('id', p.id);
        load();
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Personnel</h2>
                <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700">
                    <Plus size={16} /> Ajouter
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : personnel.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucun membre pour l'instant.</p>
            ) : (
                <div className="space-y-3">
                    {personnel.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                    {p.photo_url && <img src={p.photo_url} alt={p.nom} className="h-full w-full object-cover" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-pacifique-navy-900">{p.nom}</h3>
                                        {!p.actif && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Masqué</span>}
                                    </div>
                                    <p className="text-sm text-pacifique-navy-700/60">{p.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleActif(p)} className="rounded-lg px-3 py-1.5 text-sm text-pacifique-navy-700 hover:bg-gray-100">
                                    {p.actif ? 'Masquer' : 'Afficher'}
                                </button>
                                <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-pacifique-navy-700 hover:bg-gray-100">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-pacifique-red-500 hover:bg-pacifique-red-100">
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
                            <h3 className="font-semibold text-pacifique-navy-900">{editingId ? 'Modifier' : 'Nouveau membre'}</h3>
                            <button onClick={() => setShowForm(false)}><X size={18} /></button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                    {form.photo_url && <img src={form.photo_url} alt="" className="h-full w-full object-cover" />}
                                </div>
                                <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm text-pacifique-navy-700 hover:bg-gray-50">
                                    {uploading ? 'Envoi...' : 'Choisir une photo'}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="hidden" />
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Nom complet</label>
                                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Rôle</label>
                                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Moniteur, Directrice..." className="w-full rounded-lg border px-3 py-2" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Bio (optionnel)</label>
                                <textarea value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Ordre d'affichage</label>
                                <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2" />
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={saving || !form.nom} className="mt-5 w-full rounded-lg bg-pacifique-navy-900 py-2.5 font-medium text-white disabled:opacity-60">
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}