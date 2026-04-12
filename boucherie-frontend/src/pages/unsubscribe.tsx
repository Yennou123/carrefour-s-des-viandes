// pages/unsubscribe.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';

export default function Unsubscribe() {
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState("Traitement en cours...");

  useEffect(() => {
    if (token) {
      api.delete(`/newsletter/unsubscribe?token=${encodeURIComponent(String(token))}`)
        .then(() => setMessage("Vous avez été retiré de notre liste de diffusion."))
        .catch(() => setMessage("Une erreur est survenue ou vous êtes déjà désabonné."));
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100">
      <div className="p-8 bg-white shadow-xl rounded-lg text-center">
        <h1 className="text-2xl font-bold text-red-800 mb-4">Désabonnement</h1>
        <p className="text-stone-600">{message}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-6 px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-800"
        >
          Retour à la boutique
        </button>
      </div>
    </div>
  );
}