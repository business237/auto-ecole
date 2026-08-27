import { useEffect, useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MessageContact } from '@/lib/database.types';

export default function Messages() {
    const [messages, setMessages] = useState<MessageContact[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from('messages_contact')
            .select('*')
            .order('created_at', { ascending: false });
        setMessages(data ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function toggleLu(m: MessageContact) {
        await supabase.from('messages_contact').update({ lu: !m.lu }).eq('id', m.id);
        load();
    }

    return (
        <div>
            <h2 className="mb-6 text-lg font-semibold text-pacifique-navy-900">Messages reçus</h2>

            {loading ? (
                <p className="text-sm text-pacifique-navy-700/60">Chargement...</p>
            ) : messages.length === 0 ? (
                <p className="text-sm text-pacifique-navy-700/60">Aucun message.</p>
            ) : (
                <div className="space-y-3">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`rounded-xl border p-4 ${m.lu ? 'bg-white' : 'bg-pacifique-blue-50/40 border-pacifique-blue-200'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-medium text-pacifique-navy-900">
                                        {m.nom} {m.sujet && `— ${m.sujet}`}
                                    </h3>
                                    <p className="text-sm text-pacifique-navy-700/60">
                                        {m.email} {m.telephone && `· ${m.telephone}`}
                                    </p>
                                    <p className="mt-2 text-sm text-pacifique-navy-800">{m.message}</p>
                                    <p className="mt-1 text-xs text-pacifique-navy-700/40">
                                        {new Date(m.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleLu(m)}
                                    className="flex-shrink-0 rounded-lg p-2 text-pacifique-navy-700 hover:bg-gray-100"
                                    title={m.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                >
                                    {m.lu ? <MailOpen size={18} /> : <Mail size={18} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}