import { useState, type FormEvent } from 'react';
import { Phone, MessageCircle, Send, CheckCircle2, MapPin, Clock, Mail, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/ui';
import { useReveal } from '@/lib/hooks';
import { useAuth } from '@/lib/useAuth';
import { useInfosSite, buildWhatsappLink, buildTelLink } from '@/lib/useSiteData';
import { supabase } from '@/lib/supabase';

export default function Contact() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { infos } = useInfosSite();
  const { isAuthenticated, isAdmin } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: '', telephone: '', email: '', sujet: '', message: '' });

  const inscriptionLink = isAdmin ? null : isAuthenticated ? '/mon-compte/nouvelle-demande' : '/inscription';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('messages_contact').insert(formData);
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  const horaires = (infos?.horaires ?? {}) as Record<string, string>;

  return (
    <section id="contact" className="bg-white py-20 lg:py-28 relative">
      <div ref={ref} className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Contact"
            title="Une question ? Écrivez-nous"
            subtitle="Pour vous inscrire à une formation, utilisez plutôt le bouton d'inscription ci-dessous."
            centered
          />
        </div>

        {inscriptionLink && (
          <div className={`reveal mt-8 flex justify-center ${visible ? 'is-visible' : ''}`}>
            <Link
              to={inscriptionLink}
              className="flex items-center gap-2 rounded-full bg-pacifique-red-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pacifique-red-500/25 hover:bg-pacifique-red-600 transition"
            >
              <UserPlus className="h-4 w-4" />
              S'inscrire à une formation
            </Link>
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className={`reveal lg:col-span-5 rounded-3xl bg-gradient-to-br from-pacifique-navy-950 via-pacifique-navy-900 to-pacifique-navy-800 p-8 text-white shadow-xl ${visible ? 'is-visible' : ''}`}>
            <h3 className="font-display text-2xl font-bold">Informations Pratiques</h3>
            <p className="mt-3 text-xs leading-relaxed text-pacifique-blue-100/75">
              Notre équipe d'accueil vous reçoit du Lundi au Samedi.
            </p>

            <div className="mt-8 space-y-6">
              {infos?.adresse && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-500/20 text-pacifique-blue-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pacifique-blue-300">Adresse</h4>
                    <p className="mt-1 text-sm text-white font-medium">{infos.adresse}</p>
                  </div>
                </div>
              )}

              {infos?.telephone && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-500/20 text-pacifique-blue-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pacifique-blue-300">Téléphone</h4>
                    <a href={buildTelLink(infos.telephone)} className="mt-1 block text-sm font-semibold text-white hover:text-pacifique-blue-300">
                      {infos.telephone}
                    </a>
                  </div>
                </div>
              )}

              {infos?.email && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-500/20 text-pacifique-blue-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pacifique-blue-300">Email</h4>
                    <p className="mt-1 text-sm text-white font-medium">{infos.email}</p>
                  </div>
                </div>
              )}

              {(horaires.lun_ven || horaires.sam) && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pacifique-blue-500/20 text-pacifique-blue-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pacifique-blue-300">Horaires</h4>
                    {horaires.lun_ven && <p className="mt-1 text-xs text-pacifique-blue-100/80">Lun-Ven : {horaires.lun_ven}</p>}
                    {horaires.sam && <p className="text-[11px] text-pacifique-blue-200/60">Samedi : {horaires.sam}</p>}
                  </div>
                </div>
              )}
            </div>

            {infos?.whatsapp && (
              <div className="mt-10 pt-6 border-t border-white/10">
                <a
                  href={buildWhatsappLink(infos.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-[#20ba5a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuter sur WhatsApp
                </a>
              </div>
            )}
        </div>

        <div className={`reveal lg:col-span-7 rounded-3xl bg-pacifique-offwhite p-8 lg:p-10 border border-gray-100 ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: '150ms' }}>
          <h3 className="font-display text-2xl font-bold text-pacifique-navy-900">Envoyez-nous un message</h3>
          <p className="mt-2 text-xs text-pacifique-navy-700/70">
            Pour toute question générale. Nous vous répondrons rapidement.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h4 className="mt-3 font-display text-lg font-bold text-emerald-900">Message envoyé !</h4>
              <p className="mt-1 text-xs text-emerald-700">Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  required
                  placeholder="Nom complet *"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20"
                />
                <input
                  placeholder="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20"
              />
              <input
                placeholder="Sujet"
                value={formData.sujet}
                onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20"
              />
              <textarea
                required
                rows={4}
                placeholder="Votre message *"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pacifique-blue-500 focus:outline-none focus:ring-2 focus:ring-pacifique-blue-500/20"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-pacifique-navy-900 px-6 py-4 text-sm font-bold text-white hover:bg-pacifique-navy-800 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Envoi...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </section >
  );
}