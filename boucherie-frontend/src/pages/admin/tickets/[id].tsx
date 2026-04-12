import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminRoute from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: string;
  admin_response?: string;
  client: {
    email: string;
  };
}

const AdminTicketDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getToken } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    if (!id) return;
    const token = getToken();
    const res = await api.get(`/admin/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTicket(res.data);
    setStatus(res.data.status);
    setLoading(false);
  };

  const sendResponse = async () => {
    const token = getToken();
    await api.put(
      `/admin/tickets/${id}/respond`,
      { response },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Réponse envoyée");
    fetchTicket();
  };

  const updateStatus = async () => {
    const token = getToken();
    await api.put(
      `/admin/tickets/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Statut mis à jour");
    fetchTicket();
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  if (loading || !ticket) return <AdminRoute>Chargement…</AdminRoute>;

  return (
    <AdminRoute>
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
        <p className="text-sm text-gray-500 mb-4">
          Client : {ticket.client.email}
        </p>

        <div className="mb-6">
          <p className="font-semibold mb-1">Message</p>
          <div className="border p-4 rounded bg-gray-50">
            {ticket.message}
          </div>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-1">Réponse admin</p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full border rounded p-3"
            rows={4}
            placeholder="Écrire une réponse…"
          />
          <button
            onClick={sendResponse}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Envoyer la réponse
          </button>
        </div>

        <div>
          <p className="font-semibold mb-1">Statut</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="Open">Open</option>
            <option value="In_Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={updateStatus}
            className="ml-3 bg-green-600 text-white px-4 py-2 rounded"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminTicketDetail;
