import useSWR, { SWRConfiguration } from 'swr';
import api from '@/lib/axios';

/**
 * Hook personnalisé pour le polling intelligent (Smart Refresh) avec SWR.
 * Évite les recharges complètes de pages tout en maintenant les données synchronisées.
 */
export function useSmartRefresh<T>(
  url: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url,
    url ? (path: string) => api.get(path).then(res => res.data) : null,
    {
      refreshInterval: 10000, // 10 secondes polling automatique (quand l'onglet est actif)
      revalidateOnFocus: true, // Rafraîchit quand l'utilisateur revient sur l'onglet
      revalidateIfStale: true,
      dedupingInterval: 2000, // Empêche les requêtes en double dans un délai de 2 sec
      errorRetryCount: 3, // Retry avec exponential backoff si erreur de réseau
      ...config,
    }
  );

  return {
    data,
    loading: isLoading,
    isValidating, // Utilisé pour afficher un indicateur de rafraîchissement sans bloquer l'UI
    error,
    mutate, // Permet de forcer le rafraîchissement après une action (create, update, delete)
  };
}
