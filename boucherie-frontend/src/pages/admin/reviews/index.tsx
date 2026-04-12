// src/pages/admin/reviews/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2} from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface Review {
  id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    name: string;
  };
}

const AdminReviewsPage: React.FC = () => {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const token = getToken();
    const res = await api.get("/admin/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews(res.data);
    setLoading(false);
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Supprimer cette review ?")) return;
    const token = getToken();
    await api.delete(`/admin/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews((r) => r.filter((rev) => rev.id !== id));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) return <AdminRoute>Chargement…</AdminRoute>;

  return (
    <AdminRoute>
      {/* HEADER */}
      <h1
        className="text-4xl font-extrabold text-primary-red text-center mb-12 font-title tracking-tight">
        Liste des Avis
      </h1>
      <div className="bg-white p-6 rounded-xl shadow">

        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-center">Produit</th>
              <th className="px-6 py-3 text-left">Note</th>
              <th className="px-6 py-3 text-left">Commentaire</th>
              <th className="px-6 py-3 text-center">Statut</th>
              <th className="px-6 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td>
                  <p className="font-medium">
                    {r.client.firstName} {r.client.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{r.client.email}</p>
                </td>

                <td className="px-6 py-3 text-center">{r.product.name}</td>

                <td className="flex px-6 py-3 text-left">
                  <Star size={14} className="text-yellow-500" />
                  {r.rating}/5
                </td>

                <td className="max-w-xs truncate px-6 py-3 text-left">{r.comment}</td>

                <td className="px-6 py-3 text-center">
                  {r.is_approved ? (
                    <span className="text-green-600 font-semibold">
                      Approuvée
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      En attente
                    </span>
                  )}
                </td>

                <td className="flex gap-2 px-6 py-3 text-center">
                  {!r.is_approved && (
                    <Link
                      href="/admin/reviews/pending"
                      className="text-blue-600 text-sm"
                    >
                      Gérer
                    </Link>
                  )}

                  <button
                    onClick={() => deleteReview(r.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminRoute>
  );
};

export default AdminReviewsPage;
