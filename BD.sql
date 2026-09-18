-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.formations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  prix numeric,
  devise text DEFAULT 'FCFA'::text,
  duree text,
  inclus ARRAY,
  ordre integer DEFAULT 0,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  prix_reduit numeric,
  motif_reduction text,
  reduction_debut date,
  reduction_fin date,
  categorie_id uuid,
  image_url text,
  mis_en_avant boolean DEFAULT false,
  CONSTRAINT formations_pkey PRIMARY KEY (id),
  CONSTRAINT formations_categorie_id_fkey FOREIGN KEY (categorie_id) REFERENCES public.categories_formation(id)
);
CREATE TABLE public.galerie (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt text,
  ordre integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  CONSTRAINT galerie_pkey PRIMARY KEY (id)
);
CREATE TABLE public.infos_site (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  adresse text,
  telephone text,
  whatsapp text,
  email text,
  horaires jsonb,
  facebook text,
  instagram text,
  tiktok text,
  numero_momo text,
  numero_om text,
  CONSTRAINT infos_site_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nom_complet text,
  telephone text,
  role text NOT NULL DEFAULT 'client'::text CHECK (role = ANY (ARRAY['client'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.messages_contact (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  telephone text,
  email text,
  sujet text,
  message text NOT NULL,
  lu boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_contact_pkey PRIMARY KEY (id)
);
CREATE TABLE public.personnel (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  role text NOT NULL,
  photo_url text,
  bio text,
  ordre integer DEFAULT 0,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personnel_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offres_speciales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  lien text,
  date_fin timestamp with time zone NOT NULL,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT offres_speciales_pkey PRIMARY KEY (id)
);
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  date_naissance date,
  lieu_naissance text,
  telephone text NOT NULL UNIQUE,
  numero_cni text,
  date_delivrance date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  formation_id uuid,
  numero_dossier text UNIQUE,
  statut text NOT NULL DEFAULT 'nouveau'::text CHECK (statut = ANY (ARRAY['nouveau'::text, 'a_verifier'::text, 'valide'::text, 'formation_en_cours'::text, 'termine'::text, 'incomplet'::text, 'refuse'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  token_acces text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'::text) UNIQUE,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT applications_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  montant numeric,
  methode text CHECK (methode = ANY (ARRAY['mtn_momo'::text, 'orange_money'::text, 'sur_place'::text])),
  reference_transaction text,
  statut text NOT NULL DEFAULT 'en_attente'::text CHECK (statut = ANY (ARRAY['en_attente'::text, 'confirme'::text, 'rejete'::text])),
  created_at timestamp with time zone DEFAULT now(),
  confirme_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.categories_formation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  ordre integer DEFAULT 0,
  actif boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_formation_pkey PRIMARY KEY (id)
);