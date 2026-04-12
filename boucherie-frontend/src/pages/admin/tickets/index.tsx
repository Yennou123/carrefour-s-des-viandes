import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Eye } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminSupportPage = () => {
  const { getToken } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    const token = getToken();
    const res = await api.get("/admin/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
    setLoading(false);
  };

  const deleteTicket = async (id: number) => {
    if (!confirm("Supprimer ce ticket ?")) return;
    const token = getToken();
    await api.delete(`/admin/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets((t) => t.filter((ticket) => ticket.id !== id));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) return <AdminRoute>Chargement…</AdminRoute>;

  return (
    <AdminRoute>
      {/* HEADER */}
      <h1
        className="text-4xl font-extrabold text-primary-red text-center mb-12 font-title tracking-tight">
        Liste des Tickets
      </h1>
      <div className="bg-white p-6 rounded-xl shadow">

        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Sujet</th>
              <th className="px-6 py-3 text-center">Statut</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td>
                  <p className="font-medium">
                    {t.client.firstName} {t.client.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{t.client.email}</p>
                </td>

                <td>{t.subject}</td>

                <td className="px-6 py-3 text-center">
                  <span
                    className={`text-sm font-semibold  ${
                      t.status === "Closed"
                        ? "text-green-600"
                        : t.status === "In_Progress"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>

                <td>{new Date(t.createdAt).toLocaleDateString()}</td>

                <td className="flex gap-3 px-6 py-3 text-left">
                  <Link
                    href={`/admin/tickets/${t.id}`}
                    className="text-blue-600"
                  >
                    <Eye size={18} />
                  </Link>

                  <button
                    onClick={() => deleteTicket(t.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
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

export default AdminSupportPage;
