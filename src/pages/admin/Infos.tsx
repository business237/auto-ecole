import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { InfosSite } from '@/lib/database.types';

export default function Infos() {
    const [infos, setInfos] = useState<InfosSite | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        supabase
            .from('infos_site')
            .select('*')
            .eq('id', 1)
            .single()
            .then(({ data }) => {
                setInfos(data);
                setLoading(false);
            });
    }, []);

    function update<K extends keyof InfosSite>(key: K, value: InfosSite[K]) {
        if (!infos) return;
        setInfos({ ...infos, [key]: value });
        setSaved(false);
    }

    async function handleSave() {
        if (!infos) return;
        setSaving(true);
        await supabase.from('infos_site').update(infos).eq('id', 1);
        setSaving(false);
        setSaved(true);
    }

    if (loading || !infos) return <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>;

    const horaires = (infos.horaires ?? {}) as Record<string, string>;

    return (
        <div className="max-w-xl space-y-4">
            <h2 className="text-lg font-semibold text-pacifique-navy-900">Infos pratiques</h2>

            <Field label="Adresse" value={infos.adresse ?? ''} onChange={(v) => update('adresse', v)} />
            <Field label="Téléphone" value={infos.telephone ?? ''} onChange={(v) => update('telephone', v)} />
            <Field label="WhatsApp" value={infos.whatsapp ?? ''} onChange={(v) => update('whatsapp', v)} />
            <Field label="Numéro MTN Mobile Money" value={infos.numero_momo ?? ''} onChange={(v) => update('numero_momo', v)} />
            <Field label="Numéro Orange Money" value={infos.numero_om ?? ''} onChange={(v) => update('numero_om', v)} />
            <Field label="Email" value={infos.email ?? ''} onChange={(v) => update('email', v)} />

            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Horaires (Lun-Ven)"
                    value={horaires.lun_ven ?? ''}
                    onChange={(v) => update('horaires', { ...horaires, lun_ven: v })}
                    placeholder="8h - 18h"
                />
                <Field
                    label="Horaires (Samedi)"
                    value={horaires.sam ?? ''}
                    onChange={(v) => update('horaires', { ...horaires, sam: v })}
                    placeholder="8h - 13h"
                />
            </div>

            <Field label="Facebook (URL)" value={infos.facebook ?? ''} onChange={(v) => update('facebook', v)} />
            <Field label="Instagram (URL)" value={infos.instagram ?? ''} onChange={(v) => update('instagram', v)} />
            <Field label="TikTok (URL)" value={infos.tiktok ?? ''} onChange={(v) => update('tiktok', v)} />

            <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-pacifique-navy-900 px-5 py-2.5 font-medium text-white disabled:opacity-60"
            >
                {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
            </button>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border px-3 py-2"
            />
        </div>
    );
}