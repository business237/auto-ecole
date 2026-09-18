import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { CategorieFormation, Formation, GalerieImage, InfosSite, Personnel, OffreSpeciale } from './database.types';

export function useFormations() {
    const [data, setData] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('formations')
            .select('*')
            .eq('actif', true)
            .order('ordre', { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erreur lors du chargement des formations :', error);
                    setData([]);
                    setLoading(false);
                    return;
                }
                setData(data ?? []);
                setLoading(false);
            });
    }, []);

    return { formations: data, loading };
}

export function useFormationsParCategorie() {
    const [data, setData] = useState<(CategorieFormation & { formations: Formation[] })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('categories_formation')
            .select('*, formations(*)')
            .eq('actif', true)
            .order('ordre')
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erreur lors du chargement des catégories de formations :', error);
                    setData([]);
                    setLoading(false);
                    return;
                }

                const categories = (data ?? []).map((category) => ({
                    ...category,
                    formations: (category.formations as Formation[] ?? [])
                        .filter((formation: Formation) => formation.actif)
                        .sort((first: Formation, second: Formation) => first.ordre - second.ordre),
                }));
                setData(categories);
                setLoading(false);
            });
    }, []);

    return { categories: data, loading };
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

import { SITE } from './site';

export function useInfosSite() {
    const [data, setData] = useState<InfosSite | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('infos_site')
            .select('*')
            .eq('id', 1)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erreur lors du chargement des informations du site :', error);
                    setData(null);
                    setLoading(false);
                    return;
                }
                if (data) {
                    if (!data.adresse || data.adresse.trim().toLowerCase() === 'kribi' || data.adresse.includes('Cameroun')) {
                        data.adresse = SITE.address;
                    }
                    if (!data.telephone || data.telephone.includes('658583938') || data.telephone.includes('699000000')) {
                        data.telephone = SITE.phone;
                    }
                    if (!data.whatsapp || data.whatsapp.includes('658583938') || data.whatsapp.includes('699000000')) {
                        data.whatsapp = SITE.phoneRaw;
                    }
                }
                setData(data);
                setLoading(false);
            });
    }, []);

    return { infos: data, loading };
}

export function buildWhatsappLink(phone: string | null | undefined, message?: string) {
    let digits = (phone ?? '').replace(/[^\d]/g, '');
    if (!digits || digits === '237699000000' || digits === '699000000' || digits === '658583938' || digits === '237658583938') {
        digits = '237658118380';
    } else if (digits.length === 9) {
        digits = `237${digits}`;
    }
    const base = `https://wa.me/${digits}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildTelLink(phone: string | null | undefined) {
    let raw = (phone ?? '').replace(/\s+/g, '');
    if (!raw || raw.includes('658583938') || raw.includes('699000000')) {
        raw = SITE.phone;
    }
    return `tel:${raw.replace(/\s+/g, '')}`;
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