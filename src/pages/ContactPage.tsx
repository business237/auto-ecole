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
                            title="Localisation Auto-École Pacifique"
                            src={`https://www.google.com/maps?q=${query}&output=embed`}
                            width="100%"
                            height="420"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </section>
        </>
    );
}