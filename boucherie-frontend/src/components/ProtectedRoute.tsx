// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    // Ce composant peut envelopper d'autres enfants si l'on veut l'utiliser comme HOC,
    // mais dans notre cas, il est utilisé seul pour gérer la redirection.
    children?: React.ReactNode; 
}

/**
 * Composant de garde de route.
 * Redirige l'utilisateur vers la page de connexion s'il n'est pas authentifié.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    
    // État local pour gérer l'affichage pendant la vérification
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Exécuté uniquement côté client
        if (typeof window !== 'undefined') {
            // Si la vérification est terminée (isAuthenticated est chargé)
            if (!isAuthenticated && !user && !loading) {
                // Redirection vers la page de connexion, en conservant la page d'origine
                // dans le paramètre 'redirect' pour y revenir après connexion.
                router.replace(`/connexion?redirect=${router.asPath}`);
            } else {
                // L'utilisateur est authentifié, on autorise l'affichage.
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, user, router]);

    // Si on est en train de vérifier l'état ou si l'utilisateur n'est pas encore autorisé,
    // on affiche un écran de chargement (ou rien).
    if (isChecking && !isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-primary-red">Vérification de l&apos;authentification...</p>
            </div>
        );
    }

    // Si l'utilisateur est authentifié, on affiche le contenu enfant
    // (ou on retourne null si le composant est utilisé sans children,
    // comme dans `checkout.tsx` et `support.tsx`).
    return children ? <>{children}</> : null; 
};

export default ProtectedRoute;