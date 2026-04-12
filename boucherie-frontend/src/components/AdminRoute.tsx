// ==============================
// src/components/AdminRoute.tsx
// ==============================

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!loading) {
            // 1. Si pas connecté → redirection login
            if (!isAuthenticated) {
                router.replace('/connexion');
                return;
            }

            // 2. Si connecté mais pas admin → redirection accueil
            if (!isAdmin) {
                router.replace('/');
                return;
            }
        }
    }, [loading, isAuthenticated, isAdmin, router]);

    // ⏳ Pendant chargement → afficher loading propre
    if (loading) {
        return (
            <div className="text-center py-20 text-text-dark">
                Vérification des droits d&apos;accès...
            </div>
        );
    }

    // 🔐 Si pas admin ou pas connecté — ne rien afficher (redirection déjà faite)
    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    // 👑 ADMIN OK → afficher le contenu protégé
    return <>{children}</>;
};

export default AdminRoute;
