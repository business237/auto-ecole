import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Formation, GalerieImage, InfosSite, Personnel, OffreSpeciale } from './database.types';

export function useFormations() {
    const [data, setData] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('formations')
            .select('*')
            .eq('actif', true)
            .order('ordre', { ascending: true })
            .then(({ data }) => {
                setData(data ?? []);
                setLoading(false);
            });
    }, []);

    return { formations: data, loading };
}

export function useGalerie() {
    const [data, setData] = useState<GalerieImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('galerie')
            .select('*')
            .order('ordre', { ascending: true })
            .then(({ data }) => {
                setData(data ?? []);
                setLoading(false);
            });
    }, []);

    return { images: data, loading };
}

export function useInfosSite() {
    const [data, setData] = useState<InfosSite | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('infos_site')
            .select('*')
            .eq('id', 1)
            .single()
            .then(({ data }) => {
                setData(data);
                setLoading(false);
            });
    }, []);

    return { infos: data, loading };
}

export function buildWhatsappLink(phone: string | null | undefined, message?: string) {
    const digits = (phone ?? '').replace(/[^\d]/g, '');
    const base = `https://wa.me/${digits}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildTelLink(phone: string | null | undefined) {
    return `tel:${(phone ?? '').replace(/\s+/g, '')}`;
}
export function usePersonnel() {
    const [data, setData] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('personnel')
            .select('*')
            .eq('actif', true)
            .order('ordre', { ascending: true })
            .then(({ data }) => {
                setData(data ?? []);
                setLoading(false);
            });
    }, []);

    return { personnel: data, loading };
}


export function useOffreActive() {
    const [offre, setOffre] = useState<OffreSpeciale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('offres_speciales')
            .select('*')
            .eq('actif', true)
            .gt('date_fin', new Date().toISOString())
            .order('date_fin', { ascending: true })
            .limit(1)
            .then(({ data }) => {
                setOffre(data?.[0] ?? null);
                setLoading(false);
            });
    }, []);

    return { offre, loading };
}

export function reductionActive(f: {
    prix_reduit: number | null;
    reduction_debut: string | null;
    reduction_fin: string | null;
}) {
    if (!f.prix_reduit) return false;
    const now = new Date();
    if (f.reduction_debut && new Date(f.reduction_debut) > now) return false;
    if (f.reduction_fin && new Date(f.reduction_fin) < now) return false;
    return true;
}