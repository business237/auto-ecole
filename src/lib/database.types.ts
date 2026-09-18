export interface Formation {
    id: string;
    titre: string;
    categorie_id: string | null;
    image_url: string | null;
    mis_en_avant: boolean;
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

export interface CategorieFormation {
    id: string;
    titre: string;
    slug: string;
    description: string | null;
    ordre: number;
    actif: boolean;
    created_at: string;
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
    numero_momo: string | null;
    numero_om: string | null;
}
export interface Profile {
    id: string;
    nom_complet: string | null;
    telephone: string | null;
    role: 'client' | 'admin';
    created_at: string;
}

export interface Candidate {
    id: string;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    lieu_naissance: string | null;
    telephone: string;
    numero_cni: string | null;
    date_delivrance: string | null;
    created_at: string;
}

export type ApplicationStatut =
    | 'nouveau' | 'a_verifier' | 'valide' | 'formation_en_cours' | 'termine' | 'incomplet' | 'refuse';

export interface Application {
    id: string;
    candidate_id: string;
    formation_id: string | null;
    numero_dossier: string;
    statut: ApplicationStatut;
    created_at: string;
    updated_at: string;
}

export type PaymentStatut = 'en_attente' | 'confirme' | 'rejete';
export type PaymentMethode = 'mtn_momo' | 'orange_money' | 'sur_place';

export interface Payment {
    id: string;
    application_id: string;
    montant: number | null;
    methode: PaymentMethode | null;
    reference_transaction: string | null;
    statut: PaymentStatut;
    created_at: string;
    confirme_at: string | null;
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