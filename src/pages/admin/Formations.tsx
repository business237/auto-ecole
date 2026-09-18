import { useEffect, useState } from 'react';
import { Eye, EyeOff, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CategorieFormation, Formation } from '@/lib/database.types';
import PermisIcon from '@/components/ui/PermisIcon';

type FormState = Omit<Formation, 'id' | 'created_at' | 'updated_at'>;
type CategoryWithFormations = CategorieFormation & { formations: Formation[] };

type CategoryFormState = Pick<CategorieFormation, 'titre' | 'ordre'>;

const EMPTY_FORM: FormState = {
    titre: '',
    categorie_id: '',
    image_url: null,
    mis_en_avant: false,
    description: '',
    prix: null,
    devise: 'FCFA',
    duree: '',
    inclus: [],
    ordre: 0,
    actif: true,
    prix_reduit: null,
    motif_reduction: '',
    reduction_debut: null,
    reduction_fin: null,
};

const EMPTY_CATEGORY_FORM: CategoryFormState = {
    titre: '',
    ordre: 0,
};

function slugify(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

export default function Formations() {
    const [categories, setCategories] = useState<CategoryWithFormations[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [inclusText, setInclusText] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryForm, setCategoryForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM);
    const [savingCategory, setSavingCategory] = useState(false);

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('categories_formation')
            .select('*, formations(*)')
            .order('ordre', { ascending: true });
        const grouped = ((data ?? []) as CategoryWithFormations[]).map((category) => ({
            ...category,
            formations: [...(category.formations ?? [])].sort((first, second) => first.ordre - second.ordre),
        }));
        setCategories(grouped);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, categorie_id: categories[0]?.id ?? '' });
        setInclusText('');
        setShowForm(true);
    }

    function openEdit(f: Formation) {
        setEditingId(f.id);
        setForm({
            titre: f.titre,
            categorie_id: f.categorie_id ?? categories[0]?.id ?? '',
            image_url: f.image_url,
            mis_en_avant: f.mis_en_avant,
            description: f.description,
            prix: f.prix,
            devise: f.devise,
            duree: f.duree,
            inclus: f.inclus,
            ordre: f.ordre,
            actif: f.actif,
            prix_reduit: f.prix_reduit,
            motif_reduction: f.motif_reduction,
            reduction_debut: f.reduction_debut,
            reduction_fin: f.reduction_fin,
        });
        setInclusText((f.inclus ?? []).join(', '));
        setShowForm(true);
    }

    async function handleSubmit() {
        setSaving(true);
        const payload = {
            ...form,
            inclus: inclusText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        };

        if (editingId) {
            await supabase.from('formations').update(payload).eq('id', editingId);
        } else {
            await supabase.from('formations').insert(payload);
        }

        setSaving(false);
        setShowForm(false);
        load();
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette formation ?')) return;
        await supabase.from('formations').delete().eq('id', id);
        load();
    }

    async function toggleActif(f: Formation) {
        await supabase.from('formations').update({ actif: !f.actif }).eq('id', f.id);
        load();
    }

    function openCreateCategory() {
        setEditingCategoryId(null);
        setCategoryForm(EMPTY_CATEGORY_FORM);
        setShowCategoryForm(true);
    }

    function openEditCategory(category: CategorieFormation) {
        setEditingCategoryId(category.id);
        setCategoryForm({ titre: category.titre, ordre: category.ordre });
        setShowCategoryForm(true);
    }

    async function handleCategorySubmit() {
        if (!categoryForm.titre.trim()) return;
        setSavingCategory(true);
        const payload = {
            titre: categoryForm.titre.trim(),
            slug: slugify(categoryForm.titre),
            ordre: categoryForm.ordre,
        };

        if (editingCategoryId) {
            await supabase.from('categories_formation').update(payload).eq('id', editingCategoryId);
        } else {
            await supabase.from('categories_formation').insert({ ...payload, description: null, actif: true });
        }

        setSavingCategory(false);
        setShowCategoryForm(false);
        load();
    }

    async function toggleCategoryActif(category: CategorieFormation) {
        await supabase.from('categories_formation').update({ actif: !category.actif }).eq('id', category.id);
        load();
    }

    return (
        <div>
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-pacifique-navy-900">Catégories</h3>
                    <button
                        onClick={openCreateCategory}
                        className="flex items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-3 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700"
                    >
                        <Plus size={15} /> Nouvelle catégorie
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.length === 0 ? (
                        <p className="text-sm text-pacifique-navy-700/60">Aucune catégorie pour l'instant.</p>
                    ) : (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${category.actif
                                    ? 'border-pacifique-blue-200 bg-pacifique-blue-50 text-pacifique-navy-900'
                                    : 'border-gray-200 bg-gray-100 text-gray-500'
                                    }`}
                            >
                                <span>{category.titre}</span>
                                <button
                                    onClick={() => openEditCategory(category)}
                                    className="rounded-full p-1 hover:bg-white/70"
                                    title="Modifier la catégorie"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    onClick={() => toggleCategoryActif(category)}
                                    className="rounded-full p-1 hover:bg-white/70"
                                    title={category.actif ? 'Désactiver la catégorie' : 'Activer la catégorie'}
                                >
                                    {category.actif ? <Eye size={13} /> : <EyeOff size={13} />}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Formations & tarifs</h2>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 rounded-lg bg-pacifique-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-pacifique-navy-700"
                >
                    <Plus size={16} /> Ajouter
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : categories.every((category) => category.formations.length === 0) ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune formation pour l'instant.</p>
            ) : (
                <div className="space-y-8">
                    {categories.map((category) => (
                        <section key={category.id}>
                            <h3 className="mb-3 text-base font-semibold text-pacifique-navy-900">{category.titre}</h3>
                            {category.formations.length === 0 ? (
                                <p className="text-sm text-pacifique-navy-700/60">Aucune formation dans cette catégorie.</p>
                            ) : (
                                <div className="space-y-3">
                                    {category.formations.map((f) => (
                                        <div
                                            key={f.id}
                                            className="flex items-center justify-between rounded-xl border bg-white p-4"
                                        >
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pacifique-navy-900 text-white flex-shrink-0">
                                        <PermisIcon titre={f.titre} size={16} className="h-4 w-4" />
                                    </span>
                                    <h3 className="font-medium text-pacifique-navy-900">{f.titre}</h3>
                                    {f.mis_en_avant && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            ★ À la une
                                        </span>
                                    )}
                                    {!f.actif && (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                            Masqué
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-pacifique-navy-700/60">
                                    {f.prix?.toLocaleString('fr-FR')} {f.devise} · {f.duree}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActif(f)}
                                    className="rounded-lg px-3 py-1.5 text-sm text-pacifique-navy-700 hover:bg-gray-100"
                                >
                                    {f.actif ? 'Masquer' : 'Afficher'}
                                </button>
                                <button
                                    onClick={() => openEdit(f)}
                                    className="rounded-lg p-2 text-pacifique-navy-700 hover:bg-gray-100"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(f.id)}
                                    className="rounded-lg p-2 text-pacifique-red-500 hover:bg-pacifique-red-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                    <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>

                        {/* ── Header sticky ── */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="font-display text-base font-bold text-pacifique-navy-900">
                                {editingId ? 'Modifier la formation' : 'Nouvelle formation'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-pacifique-navy-900"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Body scrollable ── */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Titre</label>
                                <input
                                    value={form.titre}
                                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                    placeholder="ex: Permis B"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">
                                    Photo (URL)
                                </label>
                                <input
                                    type="url"
                                    value={form.image_url ?? ''}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                />
                                {form.image_url && (
                                    <img
                                        src={form.image_url}
                                        alt="Aperçu de la formation"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        className="mt-3 h-20 w-20 rounded-lg object-cover"
                                    />
                                )}
                            </div>

                            <label className="flex items-center gap-2 text-sm text-pacifique-navy-700">
                                <input
                                    type="checkbox"
                                    checked={form.mis_en_avant}
                                    onChange={(e) => setForm({ ...form, mis_en_avant: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 accent-pacifique-blue-600"
                                />
                                Mettre en avant sur la page d'accueil
                            </label>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">
                                    Catégorie
                                </label>
                                <select
                                    value={form.categorie_id ?? ''}
                                    onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                                    required
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.titre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Description</label>
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={form.prix ?? ''}
                                        onChange={(e) =>
                                            setForm({ ...form, prix: e.target.value ? Number(e.target.value) : null })
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Durée</label>
                                    <input
                                        value={form.duree ?? ''}
                                        onChange={(e) => setForm({ ...form, duree: e.target.value })}
                                        placeholder="ex: 1 mois"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">
                                    Inclus <span className="normal-case font-normal text-pacifique-navy-700/40">(séparés par des virgules)</span>
                                </label>
                                <input
                                    value={inclusText}
                                    onChange={(e) => setInclusText(e.target.value)}
                                    placeholder="Code, Conduite, Examen blanc"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={form.ordre}
                                    onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                />
                            </div>

                            {/* Réduction */}
                            <div className="rounded-xl border border-pacifique-red-200 bg-pacifique-red-50/50 p-4">
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-pacifique-red-600">
                                    🏷️ Réduction (optionnel)
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Prix réduit</label>
                                        <input
                                            type="number"
                                            value={form.prix_reduit ?? ''}
                                            onChange={(e) =>
                                                setForm({ ...form, prix_reduit: e.target.value ? Number(e.target.value) : null })
                                            }
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-red-400 focus:ring-2 focus:ring-pacifique-red-400/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Motif</label>
                                        <input
                                            value={form.motif_reduction ?? ''}
                                            onChange={(e) => setForm({ ...form, motif_reduction: e.target.value })}
                                            placeholder="Ex: Rentrée scolaire"
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-red-400 focus:ring-2 focus:ring-pacifique-red-400/20"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Début</label>
                                        <input
                                            type="date"
                                            value={form.reduction_debut ?? ''}
                                            onChange={(e) => setForm({ ...form, reduction_debut: e.target.value || null })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-red-400 focus:ring-2 focus:ring-pacifique-red-400/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">Fin</label>
                                        <input
                                            type="date"
                                            value={form.reduction_fin ?? ''}
                                            onChange={(e) => setForm({ ...form, reduction_fin: e.target.value || null })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-red-400 focus:ring-2 focus:ring-pacifique-red-400/20"
                                        />
                                    </div>
                                </div>

                                <p className="mt-2 text-[11px] text-pacifique-navy-700/50">
                                    Laisse "Prix réduit" vide pour ne pas afficher de réduction.
                                </p>
                            </div>
                        </div>

                        {/* ── Footer sticky ── */}
                        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !form.titre}
                                className="w-full rounded-xl bg-pacifique-navy-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-pacifique-blue-600 disabled:opacity-60 active:scale-[0.98]"
                            >
                                {saving ? 'Enregistrement...' : '✓ Enregistrer la formation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                    <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="font-display text-base font-bold text-pacifique-navy-900">
                                {editingCategoryId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h3>
                            <button
                                onClick={() => setShowCategoryForm(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-pacifique-navy-900"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">
                                    Titre
                                </label>
                                <input
                                    value={categoryForm.titre}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, titre: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                    placeholder="ex: Permis particuliers"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-pacifique-navy-700/70">
                                    Ordre d'affichage
                                </label>
                                <input
                                    type="number"
                                    value={categoryForm.ordre}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, ordre: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-pacifique-blue-500 focus:ring-2 focus:ring-pacifique-blue-500/20"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4">
                            <button
                                onClick={handleCategorySubmit}
                                disabled={savingCategory || !categoryForm.titre.trim()}
                                className="w-full rounded-xl bg-pacifique-navy-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-pacifique-blue-600 disabled:opacity-60 active:scale-[0.98]"
                            >
                                {savingCategory ? 'Enregistrement...' : '✓ Enregistrer la catégorie'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}