// src/pages/admin/orders/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import api from "@/lib/axios";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: number;
  total_amount: number;
  status: "Pending" | "Processing" | "Ready_for_Pickup" | "Delivered" | "Cancelled" | "Confirmed";
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

const OrdersAdminPage: React.FC = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const res = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            icon={<Clock size={14} />}
            text="En attente"
            color="yellow"
          />
        );

      case "Processing":
        return (
          <Badge
            icon={<Clock size={14} />}
            text="En cours"
            color="blue"
          />
        );

      case "Ready_for_Pickup":
        return (
          <Badge
            icon={<Clock size={14} />}
            text="Prête"
            color="indigo"
          />
        );

      case "Confirmed":
        return (
          <Badge
            icon={<CheckCircle size={14} />}
            text="Confirmée"
            color="teal"
          />
        );

      case "Delivered":
        return (
          <Badge
            icon={<CheckCircle size={14} />}
            text="Livrée"
            color="green"
          />
        );

      case "Cancelled":
        return (
          <Badge
            icon={<XCircle size={14} />}
            text="Annulée"
            color="red"
          />
        );

      default:
        return (
          <Badge
            icon={<Clock size={14} />}
            text="Inconnu"
            color="gray"
          />
        );
    }
  };


  if (loading) return <div className="py-20 text-center">Chargement…</div>;
  if (error) return <div className="py-20 text-center text-red-600">{error}</div>;

  return (
    <AdminRoute>
      {/* HEADER */}
      <h1
        className="text-4xl font-extrabold text-primary-red text-center mb-12 font-title tracking-tight">
        Liste des Commandes
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-center">Date</th>
              <th className="px-6 py-3 text-center">Total</th>
              <th className="px-6 py-3 text-center">Statut</th>
              <th className="px-6 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-left">#{order.id}</td>
                <td className="px-6 py-3 text-left">{order.client.firstName} {order.client.lastName}</td>
                <td className="px-6 py-3 text-center">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-center"> {order.total_amount} FCFA</td>
                <td className="px-6 py-3 text-center">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-3 text-left">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary-red flex items-center gap-1">
                    <Eye size={16} /> Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminRoute>
  );
};

const Badge = ({ icon, text, color }: any) => (
  <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800 flex items-center gap-1`}>
    {icon} {text}
  </span>
);

export default OrdersAdminPage;
