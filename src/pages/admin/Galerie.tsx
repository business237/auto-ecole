import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GalerieImage } from '@/lib/database.types';

export default function Galerie() {
    const [images, setImages] = useState<GalerieImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('galerie')
            .select('*')
            .order('ordre', { ascending: true });
        setImages(data ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('galerie')
            .upload(fileName, file);

        if (uploadError) {
            alert("Erreur lors de l'envoi de l'image : " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: publicUrlData } = supabase.storage.from('galerie').getPublicUrl(fileName);

        await supabase.from('galerie').insert({
            url: publicUrlData.publicUrl,
            alt: file.name,
            ordre: images.length,
        });

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        load();
    }

    async function handleDelete(img: GalerieImage) {
        if (!confirm('Supprimer cette image ?')) return;

        // Extraire le nom de fichier depuis l'URL pour le supprimer du storage
        const fileName = img.url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('galerie').remove([fileName]);
        }
        await supabase.from('galerie').delete().eq('id', img.id);
        load();
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Galerie photos</h2>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700">
                    <Plus size={16} /> {uploading ? 'Envoi...' : 'Ajouter une photo'}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
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
                            <button
                                onClick={() => handleDelete(img)}
                                className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-pacifique-red-500 opacity-0 shadow transition group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}