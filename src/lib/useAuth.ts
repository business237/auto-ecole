import { useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from './database.types';

export function getInitials(name?: string | null, email?: string | null): string {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.trim().slice(0, 2).toUpperCase();
    }
    if (email) {
        const handle = email.split('@')[0] || '';
        return handle.slice(0, 2).toUpperCase();
    }
    return 'PA';
}

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<'client' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (userId: string) => {
        try {
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            if (data) {
                setProfile(data as Profile);
                setRole((data.role as 'client' | 'admin') ?? 'client');
            } else {
                setRole('client');
            }
        } catch {
            setRole('client');
        }
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            setSession(data.session);
            if (data.session) {
                await loadProfile(data.session.user.id);
            }
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
            if (newSession) {
                await loadProfile(newSession.user.id);
            } else {
                setProfile(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => listener.subscription.unsubscribe();
    }, [loadProfile]);

    const user: User | null = session?.user ?? null;
    const nomComplet =
        profile?.nom_complet ||
        (user?.user_metadata?.nom_complet as string | undefined) ||
        (user?.email ? user.email.split('@')[0] : '');

    const initials = getInitials(nomComplet, user?.email);

    return {
        session,
        user,
        profile,
        role,
        loading,
        isAuthenticated: !!session,
        isAdmin: role === 'admin',
        nomComplet,
        initials,
        refreshProfile: () => (session ? loadProfile(session.user.id) : Promise.resolve()),
    };
}