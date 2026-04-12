"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import Button from "@/components/common/Button";
import { Eye, UserX, UserCheck, Trash2, X } from "lucide-react";

const API_URL = "/admin/users"; // URL relative, baseURL gérée par api

interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "admin";
  isBlocked: boolean;
  createdAt: string;
}

const ClientsAdminPage: React.FC = () => {
  const { data: clientsData, loading, mutate } = useSmartRefresh<Client[]>(API_URL);
  
  // Filter only clients (not admins)
  const clients = React.useMemo(() => {
    if (!clientsData) return [];
    return clientsData.filter((u: Client) => u.role === "client");
  }, [clientsData]);

  // 🔍 modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // --- Bloquer / Débloquer utilisateur ---
  const toggleBlock = async (client: Client) => {
    try {
      const endpoint = client.isBlocked ? "unblock" : "block";
      await api.put(`${API_URL}/${client.id}/${endpoint}`);
      mutate();
    } catch (err: any) {
      console.error("Erreur lors du changement de statut :", err);
    }
  };

  // --- Supprimer utilisateur ---
  const deleteUser = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    try {
      await api.delete(`${API_URL}/${id}`);
      mutate();
    } catch (err: any) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Chargement...</div>;
  }

  return (
    <AdminRoute>
      {/* HEADER */}
      <h1
        className="text-4xl font-extrabold text-primary-red text-center mb-12 font-title tracking-tight">
        Liste des Clients
      </h1>
      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[600px] divide-y divide-gray-200">
          <thead className="bg-bg-cream">
            <tr>
              <th className="px-6 py-3 text-left">Nom</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-center">Statut</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {client.lastName} {client.firstName}
                </td>

                <td className="px-6 py-4">{client.email}</td>

                <td className="px-6 py-4 text-center">
                  {client.isBlocked ? (
                    <span className="text-red-600 font-medium">Bloqué</span>
                  ) : (
                    <span className="text-green-600 font-medium">Actif</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant={client.isBlocked ? "accent" : "danger"}
                      size="small"
                      onClick={() => toggleBlock(client)}
                    >
                      {client.isBlocked ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => deleteUser(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL VIEW ================= */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedClient(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">Détails utilisateur</h2>

            <ul className="space-y-2 text-sm">
              <li>
                <b>Nom :</b> {selectedClient.lastName} {selectedClient.firstName}
              </li>
              <li>
                <b>Email :</b> {selectedClient.email}
              </li>
              <li>
                <b>Rôle :</b> {selectedClient.role}
              </li>
              <li>
                <b>Statut :</b> {selectedClient.isBlocked ? "Bloqué" : "Actif"}
              </li>
              <li>
                <b>Inscription :</b>{" "}
                {new Date(selectedClient.createdAt).toLocaleDateString()}
              </li>
            </ul>

            <div className="mt-6 text-right">
              <Button variant="secondary" onClick={() => setSelectedClient(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminRoute>
  );
};

export default ClientsAdminPage;
