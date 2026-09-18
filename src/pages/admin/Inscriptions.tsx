import { useEffect, useState } from 'react';
import { IdCard, Phone, Calendar, MapPin, Trash2, X, Check, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Application, Candidate, Payment } from '@/lib/database.types';
import PermisIcon from '@/components/ui/PermisIcon';

type ApplicationAvecRelations = Application & {
    candidate: Candidate | null;
    formation: { titre: string } | null;
    payments: Payment[];
};

const FILTER_OPTIONS = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'valide', label: 'Validé' },
    { value: 'termine', label: 'Terminé' },
    { value: 'refuse', label: 'Refusé' },
] as const;

type FilterValue = typeof FILTER_OPTIONS[number]['value'];

const PAIEMENT_LABELS: Record<Payment['statut'], string> = {
    confirme: 'Confirmé',
    en_attente: 'En attente',
    rejete: 'Rejeté',
};

const PAIEMENT_CLASSES: Record<Payment['statut'] | 'aucun', string> = {
    confirme: 'bg-green-100 text-green-700 border border-green-200',
    en_attente: 'bg-amber-100 text-amber-700 border border-amber-200',
    rejete: 'bg-red-100 text-red-700 border border-red-200',
    aucun: 'bg-gray-100 text-gray-600',
};

function cls(...args: (string | false | null | undefined)[]) {
    return args.filter(Boolean).join(' ');
}

export default function Inscriptions() {
    const [applications, setApplications] = useState<ApplicationAvecRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState<FilterValue>('tous');
    const [recherche, setRecherche] = useState('');

    /* Modals / Action targets */
    const [deleteTarget, setDeleteTarget] = useState<ApplicationAvecRelations | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [finishTarget, setFinishTarget] = useState<ApplicationAvecRelations | null>(null);
    const [finishingId, setFinishingId] = useState<string | null>(null);

    const [confirmPaymentTarget, setConfirmPaymentTarget] = useState<{ paymentId: string; dossier: string; nom: string } | null>(null);
    const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('applications')
            .select('*, candidate:candidates(*), formation:formations(titre), payments(*)')
            .order('created_at', { ascending: false });
        setApplications((data as ApplicationAvecRelations[]) ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleFinishApplication() {
        if (!finishTarget) return;
        setFinishingId(finishTarget.id);
        const { error } = await supabase
            .from('applications')
            .update({ statut: 'termine' })
            .eq('id', finishTarget.id);
        setFinishingId(null);

        if (error) {
            setFinishTarget(null);
            return;
        }

        const targetDossier = finishTarget.numero_dossier;
        setFinishTarget(null);
        setSuccessMessage(`Dossier ${targetDossier} marqué comme terminé.`);
        setTimeout(() => setSuccessMessage(null), 3000);
        load();
    }

    async function handleConfirmPayment() {
        if (!confirmPaymentTarget) return;
        setConfirmingPaymentId(confirmPaymentTarget.paymentId);

        // 1. Confirm the payment
        const { error: payError } = await supabase
            .from('payments')
            .update({
                statut: 'confirme',
                confirme_at: new Date().toISOString(),
            })
            .eq('id', confirmPaymentTarget.paymentId);
        setConfirmingPaymentId(null);

        if (payError) {
            setConfirmPaymentTarget(null);
            return;
        }

        // 2. Retrieve application linked to this payment to update its status
        const { data: paymentRow } = await supabase
            .from('payments')
            .select('application_id')
            .eq('id', confirmPaymentTarget.paymentId)
            .single();

        if (paymentRow?.application_id) {
            const { data: appRow } = await supabase
                .from('applications')
                .select('id, statut')
                .eq('id', paymentRow.application_id)
                .single();

            if (appRow && (appRow.statut === 'nouveau' || appRow.statut === 'a_verifier')) {
                await supabase
                    .from('applications')
                    .update({
                        statut: 'valide',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', appRow.id);
            }
        }

        const dossier = confirmPaymentTarget.dossier;
        setConfirmPaymentTarget(null);
        setSuccessMessage(`Paiement du dossier ${dossier} confirmé — statut mis à jour en Validé.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        load();
    }


    async function deleteApplication() {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        const { error } = await supabase.from('applications').delete().eq('id', deleteTarget.id);
        setDeletingId(null);

        if (error) return;

        setApplications((current) => current.filter((app) => app.id !== deleteTarget.id));
        setDeleteTarget(null);
        setSuccessMessage(`Dossier ${deleteTarget.numero_dossier} supprimé définitivement.`);
        setTimeout(() => setSuccessMessage(null), 3000);
    }

    const terme = recherche.trim().toLocaleLowerCase();
    const filtered = applications.filter((application) => {
        const matchesStatus =
            filtre === 'tous' ||
            application.statut === filtre ||
            (filtre === 'nouveau' && (application.statut === 'a_verifier' || application.statut === 'incomplet')) ||
            (filtre === 'valide' && application.statut === 'formation_en_cours');

        const candidate = application.candidate;
        const matchesSearch =
            !terme ||
            [
                candidate?.nom,
                candidate?.prenom,
                candidate?.telephone,
                application.numero_dossier,
            ].some((value) => value?.toLocaleLowerCase().includes(terme));

        return matchesStatus && matchesSearch;
    });

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-pacifique-navy-900">Demandes d'inscription</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="search"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Rechercher un dossier..."
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-pacifique-blue-500"
                    />
                    <select
                        value={filtre}
                        onChange={(e) => setFiltre(e.target.value as FilterValue)}
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-pacifique-blue-500"
                    >
                        {FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucune demande.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((application) => {
                        const candidate = application.candidate;
                        const latestPayment = [...application.payments].sort(
                            (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
                        )[0];

                        const isPendingSurPlace =
                            latestPayment &&
                            latestPayment.statut === 'en_attente' &&
                            latestPayment.methode === 'sur_place';

                        const st = application.statut;
                        const isRefused = st === 'refuse';
                        const isTermine = st === 'termine';
                        const isValidated = st === 'valide' || st === 'formation_en_cours';
                        const isNouveau = st === 'nouveau' || st === 'a_verifier' || st === 'incomplet';

                        return (
                            <div key={application.id} className="rounded-xl border bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-pacifique-navy-900">
                                                {candidate?.nom} {candidate?.prenom}
                                            </h3>
                                            <span className="rounded-md bg-pacifique-offwhite px-2 py-0.5 font-mono text-xs font-medium text-pacifique-navy-700/70">
                                                {application.numero_dossier}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-pacifique-navy-700/70">
                                            <span className="flex items-center gap-1.5">
                                                <Phone size={14} className="flex-shrink-0 text-pacifique-navy-700/40" />
                                                {candidate?.telephone}
                                            </span>

                                            {(candidate?.date_naissance || candidate?.lieu_naissance) && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="flex-shrink-0 text-pacifique-navy-700/40" />
                                                    Né(e) {candidate.date_naissance && `le ${new Date(candidate.date_naissance).toLocaleDateString('fr-FR')}`}
                                                    {candidate.lieu_naissance && ` à ${candidate.lieu_naissance}`}
                                                </span>
                                            )}

                                            {candidate?.numero_cni && (
                                                <span className="flex items-center gap-1.5">
                                                    <IdCard size={14} className="flex-shrink-0 text-pacifique-navy-700/40" />
                                                    CNI {candidate.numero_cni}
                                                    {candidate.date_delivrance && ` — délivrée le ${new Date(candidate.date_delivrance).toLocaleDateString('fr-FR')}`}
                                                </span>
                                            )}

                                            <span className="flex items-center gap-1.5 font-medium text-pacifique-navy-800">
                                                <PermisIcon titre={application.formation?.titre} size={14} className="h-3.5 w-3.5 flex-shrink-0 text-pacifique-blue-600" />
                                                {application.formation?.titre ?? 'Formation non précisée'}
                                            </span>

                                            <span className="flex items-center gap-1.5 text-xs text-pacifique-navy-700/40">
                                                <Calendar size={12} className="flex-shrink-0" />
                                                Reçue le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        {/* Payment status & action */}
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-medium text-pacifique-navy-700/60">Paiement :</span>
                                            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${PAIEMENT_CLASSES[latestPayment?.statut ?? 'aucun']}`}>
                                                {latestPayment ? PAIEMENT_LABELS[latestPayment.statut] : 'Aucun paiement'}
                                                {latestPayment?.methode === 'sur_place' && ' (Sur place)'}
                                                {latestPayment?.methode === 'mtn_momo' && ' (MTN)'}
                                                {latestPayment?.methode === 'orange_money' && ' (Orange)'}
                                            </span>

                                            {isPendingSurPlace && (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmPaymentTarget({
                                                        paymentId: latestPayment.id,
                                                        dossier: application.numero_dossier,
                                                        nom: `${candidate?.prenom ?? ''} ${candidate?.nom ?? ''}`.trim()
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                                                >
                                                    <CheckCircle2 size={13} />
                                                    Confirmer le paiement reçu
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Pipeline / Status & Delete */}
                                    <div className="flex items-center gap-3">
                                        {isRefused ? (
                                            <span className="rounded-full border border-red-200 bg-red-100 px-3.5 py-1 text-xs font-bold text-red-700">
                                                Refusée
                                            </span>
                                        ) : (
                                            /* Pipeline Stepper */
                                            <div className="flex items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 p-1.5 sm:gap-2 sm:px-3">
                                                {/* Step 1: Nouveau */}
                                                <div className={cls(
                                                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
                                                    isNouveau && 'bg-pacifique-blue-100 text-pacifique-blue-700',
                                                    (isValidated || isTermine) && 'border border-emerald-200 bg-emerald-100 text-emerald-800',
                                                    (!isNouveau && !isValidated && !isTermine) && 'bg-gray-100 text-gray-400'
                                                )}>
                                                    {(isValidated || isTermine) ? (
                                                        <Check size={13} className="stroke-[3] text-emerald-700" />
                                                    ) : null}
                                                    <span>Nouveau</span>
                                                </div>

                                                <div className={cls(
                                                    'h-0.5 w-3 sm:w-4',
                                                    (isValidated || isTermine) ? 'bg-emerald-400' : 'bg-gray-200'
                                                )} />

                                                {/* Step 2: Validé */}
                                                <div className={cls(
                                                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
                                                    isValidated && 'bg-pacifique-blue-100 text-pacifique-blue-700',
                                                    isTermine && 'border border-emerald-200 bg-emerald-100 text-emerald-800',
                                                    isNouveau && 'bg-gray-100 text-gray-400'
                                                )}>
                                                    {isTermine ? (
                                                        <Check size={13} className="stroke-[3] text-emerald-700" />
                                                    ) : null}
                                                    <span>Validé</span>
                                                </div>

                                                <div className={cls(
                                                    'h-0.5 w-3 sm:w-4',
                                                    isTermine ? 'bg-emerald-400' : 'bg-gray-200'
                                                )} />

                                                {/* Step 3: Terminé */}
                                                {isTermine ? (
                                                    <div className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                                                        <Check size={13} className="stroke-[3]" />
                                                        <span>Terminé</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinishTarget(application)}
                                                        className="flex items-center gap-1 rounded-full border border-pacifique-navy-900/40 bg-white px-3 py-1 text-xs font-bold text-pacifique-navy-900 shadow-sm transition-all hover:border-pacifique-navy-900 hover:bg-pacifique-navy-900 hover:text-white active:scale-95"
                                                    >
                                                        <span>Terminer</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {(isTermine || isRefused) && (
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(application)}
                                                title="Supprimer définitivement ce dossier"
                                                aria-label="Supprimer définitivement ce dossier"
                                                className="rounded-lg p-2 text-pacifique-red-500 hover:bg-pacifique-red-100"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Confirm Finish Application */}
            {finishTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">Terminer la formation</h3>
                            <button type="button" onClick={() => setFinishTarget(null)} disabled={Boolean(finishingId)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm leading-relaxed text-pacifique-navy-700/80">
                            Marquer ce dossier (<strong>{finishTarget.numero_dossier}</strong> de {finishTarget.candidate?.prenom} {finishTarget.candidate?.nom}) comme terminé ?
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setFinishTarget(null)}
                                disabled={Boolean(finishingId)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleFinishApplication}
                                disabled={Boolean(finishingId)}
                                className="rounded-lg bg-pacifique-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-pacifique-navy-700 disabled:opacity-60"
                            >
                                {finishingId ? 'Mise à jour...' : 'Marquer comme terminé'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Payment Received (sur_place) */}
            {confirmPaymentTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">Confirmer le paiement reçu</h3>
                            <button type="button" onClick={() => setConfirmPaymentTarget(null)} disabled={Boolean(confirmingPaymentId)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm leading-relaxed text-pacifique-navy-700/80">
                            Confirmer que le paiement sur place (en agence) pour le dossier <strong>{confirmPaymentTarget.dossier}</strong> ({confirmPaymentTarget.nom}) a bien été reçu ?
                        </p>
                        <p className="mt-2 text-xs font-medium text-pacifique-blue-700">
                            Cette action validera automatiquement le dossier du candidat.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setConfirmPaymentTarget(null)}
                                disabled={Boolean(confirmingPaymentId)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={Boolean(confirmingPaymentId)}
                                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {confirmingPaymentId ? 'Confirmation...' : 'Confirmer le paiement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Delete Application */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-pacifique-navy-900">Supprimer le dossier</h3>
                            <button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(deletingId)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm leading-relaxed text-pacifique-navy-700/80">
                            Supprimer définitivement le dossier de {deleteTarget.candidate?.prenom} {deleteTarget.candidate?.nom} ({deleteTarget.numero_dossier}) ? Cette action est irréversible et supprimera aussi son historique de paiement.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={Boolean(deletingId)}
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-pacifique-navy-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={deleteApplication}
                                disabled={Boolean(deletingId)}
                                className="rounded-lg bg-pacifique-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-pacifique-red-600 disabled:opacity-60"
                            >
                                {deletingId ? 'Suppression...' : 'Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
                    {successMessage}
                </div>
            )}
        </div>
    );
}