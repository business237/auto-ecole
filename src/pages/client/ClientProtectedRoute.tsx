import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';

export default function ClientProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return null;
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (!isAuthenticated) return <Navigate to="/connexion" replace />;

    return <>{children}</>;
}