import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return <>{children}</>;
}