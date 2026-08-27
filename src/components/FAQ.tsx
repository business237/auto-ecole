import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { whatsappLink } from '@/lib/site';
import { useReveal } from '@/lib/hooks';

const FAQS = [
  {
    question: 'Quelles sont les pièces nécessaires pour s’inscrire ?',
    answer: 'Pour constituer votre dossier d’inscription, vous devez fournir : une photocopie de votre CNI ou passeport valide, 4 photos d’identité récentes sur fond blanc, un certificat médical d’aptitude à la conduite et le formulaire d’inscription complété à l’agence.',
  },
  {
    question: 'Comment se déroule la formation bilingue (Français / English) ?',
    answer: 'Tous nos cours théoriques (Code de la route) et nos supports didactiques sont disponibles en Français et en Anglais. De plus, nos moniteurs sont parfaitement bilingues pour vous expliquer les règles de conduite dans la langue de votre choix.',
  },
  {
    question: 'Est-il possible de payer les frais de formation en plusieurs tranches ?',
    answer: 'Oui tout à fait ! Auto-École Pacifique propose des facilités de paiement échelonné en plusieurs tranches adaptées à votre budget, pour vous permettre de débuter votre apprentissage sans contrainte financière.',
  },
  {
    question: 'Quelle est la durée moyenne pour obtenir le permis B ?',
    answer: 'En formule classique, la formation dure généralement entre 4 et 8 semaines selon votre rythme de présence. En formule accélérée / stage intensif, il est possible d’effectuer le cursus théorique et pratique en 2 à 3 semaines.',
  },
  {
    question: 'Où se déroulent les cours et les leçons de conduite à Kribi ?',
    answer: 'Les cours théoriques ont lieu dans nos salles aménagées à Kribi (Quartier Dombe). Les leçons pratiques s’effectuent sur nos pistes d’entraînement puis sur le réseau routier de Kribi et ses grands axes.',
  },
  {
    question: 'Proposez-vous des cours le week-end ou en soirée ?',
    answer: 'Oui, nous proposons des créneaux flexibles du matin, de l’après-midi, en soirée ainsi que des sessions spéciales le samedi pour s’adapter aux contraintes de travail des professionnels et étudiants.',
  },
];

export default function FAQ() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section id="faq" className="bg-pacifique-offwhite py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Questions Fréquentes"
            title="Tout ce que vous devez savoir"
            subtitle="Vous avez des questions sur le déroulement de la formation ou les pièces d'inscription ? Retrouvez les réponses ci-dessous."
            centered
          />
        </div>

        <div className="mt-14 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`reveal overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-sm transition-all duration-200 ${
                  visible ? 'is-visible' : ''
                }`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left focus:outline-none"
                >
                  <span className="flex items-center gap-3 font-display text-base font-bold text-pacifique-navy-900">
                    <HelpCircle className="h-5 w-5 flex-shrink-0 text-pacifique-blue-600" />
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pacifique-offwhite text-pacifique-navy-900 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-pacifique-blue-50 text-pacifique-blue-600' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm leading-relaxed text-pacifique-navy-700/80 border-t border-gray-100 mt-1">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`reveal mt-12 text-center ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: '500ms' }}>
          <p className="text-xs text-pacifique-navy-700/70">
            Vous avez une question spécifique ?{' '}
            <a
              href={whatsappLink('Bonjour, j’ai une question à vous poser concernant vos formations.')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-pacifique-blue-600 underline hover:text-pacifique-red-500 transition-colors"
            >
              Contactez-nous directement sur WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
