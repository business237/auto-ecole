export interface Formation {
    id: string;
    titre: string;
    description: string | null;
    prix: number | null;
    devise: string;
    duree: string | null;
    inclus: string[] | null;
    ordre: number;
    actif: boolean;
    prix_reduit: number | null;
    motif_reduction: string | null;
    reduction_debut: string | null;
    reduction_fin: string | null;
    created_at: string;
    updated_at: string;
}

export interface GalerieImage {
    id: string;
    url: string;
    alt: string | null;
    description: string | null;
    ordre: number;
    created_at: string;
}

export interface InfosSite {
    id: number;
    adresse: string | null;
    telephone: string | null;
    whatsapp: string | null;
    email: string | null;
    horaires: Record<string, string> | null;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
}
export interface Profile {
    id: string;
    nom_complet: string | null;
    telephone: string | null;
    role: 'client' | 'admin';
    created_at: string;
}

export interface Inscription {
    id: string;
    user_id: string;
    nom: string;
    prenom: string | null;
    email: string;
    telephone: string;
    date_naissance: string | null;
    sexe: 'M' | 'F' | null;
    ville: string | null;
    adresse: string | null;
    formation_id: string | null;
    message: string | null;
    statut: 'en_attente' | 'dossier_incomplet' | 'valide' | 'formation_en_cours' | 'termine' | 'refusee';
    created_at: string;
}

export interface MessageContact {
    id: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    sujet: string | null;
    message: string;
    lu: boolean;
    created_at: string;
}
export interface Personnel {
    id: string;
    nom: string;
    role: string;
    photo_url: string | null;
    bio: string | null;
    ordre: number;
    actif: boolean;
    created_at: string;
}
export interface OffreSpeciale {
    id: string;
    titre: string;
    description: string | null;
    lien: string | null;
    date_fin: string;
    actif: boolean;
    created_at: string;
}