// src/pages/admin/reviews/pending.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Trash2, Star } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface Review {
  id: number;
  rating: number;
  comment: string;
  client: {
    firstName: string;
    lastName: string;
  };
  product: {
    name: string;
  };
}

const PendingReviewsPage: React.FC = () => {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    const token = getToken();
    const res = await api.get("/admin/reviews/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews(res.data);
    setLoading(false);
  };

  const approve = async (id: number) => {
    const token = getToken();
    await api.put(
      `/admin/reviews/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setReviews((r) => r.filter((rev) => rev.id !== id));
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette review ?")) return;
    const token = getToken();
    await api.delete(`/admin/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews((r) => r.filter((rev) => rev.id !== id));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) return <AdminRoute>Chargement…</AdminRoute>;

  return (
    <AdminRoute>
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">
          Avis en attente d’approbation
        </h1>

        {reviews.length === 0 ? (
          <p>Aucune review en attente 🎉</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {r.client.firstName} {r.client.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Produit : {r.product.name}
                  </p>
                  <p className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-yellow-500" />
                    {r.rating}/5
                  </p>
                  <p className="mt-2 text-gray-700">{r.comment}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => approve(r.id)}
                    className="text-green-600"
                  >
                    <CheckCircle size={20} />
                  </button>

                  <button
                    onClick={() => remove(r.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
};

export default PendingReviewsPage;
