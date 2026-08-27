import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { useFormations } from '@/lib/useSiteData';
import { ArrowLeft } from 'lucide-react';
import PermisIcon from '@/components/ui/PermisIcon';

export default function NouvelleDemande() {
    const { session, nomComplet, profile } = useAuth();
    const { formations } = useFormations();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paramFormation = searchParams.get('formation') || '';

    // Split nomComplet into default nom / prenom
    const nameParts = (nomComplet || '').trim().split(/\s+/);
    const defaultNom = nameParts[0] || '';
    const defaultPrenom = nameParts.slice(1).join(' ') || '';

    const [nom, setNom] = useState(defaultNom);
    const [prenom, setPrenom] = useState(defaultPrenom);
    const [dateNaissance, setDateNaissance] = useState('');
    const [sexe, setSexe] = useState<'M' | 'F' | ''>('');
    const [ville, setVille] = useState('Kribi');
    const [adresse, setAdresse] = useState('');
    const [telephone, setTelephone] = useState(profile?.telephone || '');
    const [formationId, setFormationId] = useState(paramFormation);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (paramFormation) {
            setFormationId(paramFormation);
        }
    }, [paramFormation]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!session) return;
        setError(null);
        setSubmitting(true);

        const { error } = await supabase.from('inscriptions').insert({
            user_id: session.user.id,
            nom,
            prenom,
            email: session.user.email,
            telephone,
            date_naissance: dateNaissance || null,
            sexe: sexe || null,
            ville,
            adresse,
            formation_id: formationId || null,
            message,
        });

        setSubmitting(false);
        if (error) {
            setError('Une erreur est survenue. Réessayez.');
            return;
        }
        navigate('/mon-compte');
    }

    return (
        <div className="mx-auto min-h-screen max-w-lg bg-pacifique-offwhite px-4 py-12">
            <Link
                to="/mon-compte"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-pacifique-navy-700/70 hover:text-pacifique-blue-600 mb-6 transition"
            >
                <ArrowLeft size={14} />
                Retour à mon espace
            </Link>

            <div className="rounded-3xl bg-white p-7 sm:p-8 shadow-sm border border-gray-100">
                <h1 className="mb-1 font-display text-2xl font-bold text-pacifique-navy-900">
                    Nouvelle demande d'inscription
                </h1>
                <p className="mb-6 text-sm text-pacifique-navy-700/60">
                    Renseignez vos informations, nous vous contacterons rapidement.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-pacifique-navy-700/60">
                        Informations personnelles
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Nom" value={nom} onChange={setNom} required />
                        <Field label="Prénom" value={prenom} onChange={setPrenom} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                value={dateNaissance}
                                onChange={(e) => setDateNaissance(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">Sexe</label>
                            <select
                                value={sexe}
                                onChange={(e) => setSexe(e.target.value as 'M' | 'F' | '')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                            >
                                <option value="">—</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                        </div>
                    </div>

                    <Field label="Téléphone" value={telephone} onChange={setTelephone} required type="tel" placeholder="Ex: 6 99 00 00 00" />

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Ville" value={ville} onChange={setVille} placeholder="Kribi" />
                        <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Quartier..." />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">Email</label>
                        <input
                            value={session?.user.email ?? ''}
                            disabled
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-pacifique-navy-700/60"
                        />
                    </div>

                    <h2 className="pt-2 text-xs font-bold uppercase tracking-wider text-pacifique-navy-700/60">
                        Formation souhaitée
                    </h2>

                    <div>
                        <select
                            value={formationId}
                            onChange={(e) => setFormationId(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                        >
                            <option value="">Sélectionnez une formation</option>
                            {formations.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.titre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">
                            Message (optionnel)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
                        />
                    </div>

                    {error && <p className="text-sm text-pacifique-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-pacifique-red-500 py-2.5 font-medium text-white hover:bg-pacifique-red-600 disabled:opacity-60"
                    >
                        {submitting ? 'Envoi...' : 'Envoyer ma demande'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    required,
    type = 'text',
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-pacifique-navy-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-pacifique-blue-500"
            />
        </div>
    );
}