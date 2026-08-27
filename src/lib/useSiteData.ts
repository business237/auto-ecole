import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Formation, GalerieImage, InfosSite } from './database.types';

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