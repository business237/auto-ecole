import Contact from '@/components/Contact';
import { useInfosSite } from '@/lib/useSiteData';

export default function ContactPage() {
    const { infos } = useInfosSite();
    const query = encodeURIComponent(infos?.adresse || 'Kribi, Cameroun');

    return (
        <>
            <Contact />
            <section className="bg-pacifique-offwhite py-16 lg:py-20">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
                        <iframe
                            title="Localisation Auto-École Pacifique Bilingue — Kribi, Dombe - Derrière Bocom"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7969.042066210782!2d9.90363749889458!3d2.952812660318641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1062fd76f8bf1c87%3A0xe39c575223d74fb1!2sAuto%20Ecole%20Pacifique%20Bilingue!5e0!3m2!1sfr!2scm!4v1788619309038!5m2!1sfr!2scm"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                </div>
            </section>
        </>
    );
}