import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GalerieImage } from '@/lib/database.types';

export default function Galerie() {
    const [images, setImages] = useState<GalerieImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState<GalerieImage | null>(null);
    const [descDraft, setDescDraft] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        const { data } = await supabase.from('galerie').select('*').order('ordre', { ascending: true });
        setImages(data ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('galerie').upload(fileName, file);

        if (uploadError) {
            alert("Erreur lors de l'envoi de l'image : " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: publicUrlData } = supabase.storage.from('galerie').getPublicUrl(fileName);
        await supabase.from('galerie').insert({ url: publicUrlData.publicUrl, alt: file.name, ordre: images.length });

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        load();
    }

    async function handleDelete(img: GalerieImage) {
        if (!confirm('Supprimer cette image ?')) return;
        const fileName = img.url.split('/').pop();
        if (fileName) await supabase.storage.from('galerie').remove([fileName]);
        await supabase.from('galerie').delete().eq('id', img.id);
        load();
    }

    function openEdit(img: GalerieImage) {
        setEditing(img);
        setDescDraft(img.description ?? '');
    }

    async function saveDescription() {
        if (!editing) return;
        await supabase.from('galerie').update({ description: descDraft }).eq('id', editing.id);
        setEditing(null);
        load();
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Galerie photos</h2>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700">
                    <Plus size={16} /> {uploading ? 'Envoi...' : 'Ajouter une photo'}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
                </label>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : images.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune photo pour l'instant.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative overflow-hidden rounded-xl border">
                            <img src={img.url} alt={img.alt ?? ''} className="aspect-square w-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                                <button onClick={() => openEdit(img)} className="rounded-lg bg-white/90 p-1.5 text-pacifique-navy-700 shadow">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(img)} className="rounded-lg bg-white/90 p-1.5 text-pacifique-red-500 shadow">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            {img.description && (
                                <p className="absolute inset-x-0 top-0 truncate bg-gradient-to-b from-black/50 to-transparent p-2 text-xs text-white">
                                    {img.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">Description de la photo</h3>
                            <button onClick={() => setEditing(null)}><X size={18} /></button>
                        </div>
                        <img src={editing.url} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />
                        <textarea
                            value={descDraft}
                            onChange={(e) => setDescDraft(e.target.value)}
                            rows={3}
                            placeholder="Ex: Séance de conduite pratique au quartier Dombe"
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        <button onClick={saveDescription} className="mt-4 w-full rounded-lg bg-pacifique-navy-900 py-2.5 font-medium text-white">
                            Enregistrer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}