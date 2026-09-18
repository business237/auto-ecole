import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface Profile {
    nom_complet: string | null;
    telephone: string | null;
    role: 'client' | 'admin';
}

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadProfile(userId: string) {
        const { data } = await supabase
            .from('profiles')
            .select('nom_complet, telephone, role')
            .eq('id', userId)
            .single();
        setProfile(data as Profile | null);
    }

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            setSession(data.session);
            if (data.session) await loadProfile(data.session.user.id);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) await loadProfile(session.user.id);
            else setProfile(null);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const displayName = profile?.nom_complet?.trim() || null;
    const initials = displayName
        ? displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join('')
        : null;

    return {
        session,
        profile,
        role: profile?.role ?? null,
        loading,
        isAuthenticated: !!session,
        isAdmin: profile?.role === 'admin',
        displayName,
        initials,
        refreshProfile: () => (session ? loadProfile(session.user.id) : Promise.resolve()),
    };
}