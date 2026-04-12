// src/pages/admin/orders/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import AdminRoute from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Ready_for_Pickup",
  "Delivered",
  "Cancelled",
  "Confirmed"
];


const AdminOrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getToken } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrder = async () => {
    const token = getToken();
    if (!token || !id) return;

    const res = await api.get(`/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrder(res.data);
    setStatus(res.data.status);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async () => {
    const token = getToken();
    await api.put(
      `/admin/orders/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("Commande mise à jour");
    setOrder((o: any) => ({ ...o, status }));
  };

  if (loading) return <AdminRoute>Chargement…</AdminRoute>;
  if (!order) return <AdminRoute >Commande introuvable</AdminRoute>;

  return (
    <AdminRoute>
      <Head><title>Commande #{order.id}</title></Head>

      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-lg">
        <Link href="/admin/orders" className="text-primary-red">&larr; Retour</Link>

        <h1 className="text-3xl font-bold mt-4">Commande #{order.id}</h1>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div>
            <p className="font-semibold">Client</p>
            <p>{order.client.firstName} {order.client.lastName}</p>
            <p>{order.client.email}</p>
          </div>

          <div>
            <p className="font-semibold">Total</p>
            <p>{order.total_amount} FCFA</p>
          </div>

          <div>
            <label className="font-semibold">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={updateStatus} className="mt-2 bg-red-700 text-white px-4 py-2 rounded">
              Mettre à jour
            </button>
            {message && <p className="text-green-600 mt-2">{message}</p>}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-10 mb-4">
          Articles ({order.items.length})
        </h2>

        {order.items.map((item: any) => (
          <div key={item.id} className="flex justify-between border p-3 rounded mb-2">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p>Qté: {item.quantity_ordered}
                {item.unit_type_ordered && ` ${item.unit_type_ordered}`}</p>
            </div>
            <p className="font-bold">
              {(
                Number(item.quantity_ordered) *
                Number(item.price_at_purchase)
              )}{" "}
              FCFA
            </p>
          </div>
        ))}
      </div>
    </AdminRoute>
  );
};

export default AdminOrderDetailPage;
