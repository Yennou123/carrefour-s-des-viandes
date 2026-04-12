import React, { useState } from "react";
import Head from "next/head";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import { useRouter } from "next/router";

const EditAdminProfile = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.put("/admin/profile", form);

      setUser(res.data.user); // update context
      setMessage("Informations mises à jour avec succès.");
    } catch (error) {
      setMessage("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Bouton Annuler
  const handleCancel = () => {
    router.push("/admin/profile");
  };

  return (
    <AdminRoute>
      <Head>
        <title>Modifier Profil | Admin</title>
      </Head>

      <div className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl">

        <h2 className="text-2xl font-bold mb-8">
          Modifier mes informations
        </h2>

        <div className="space-y-6">

          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Prénom"
            className="w-full p-3 bg-gray-100 rounded-xl outline-none"
          />

          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full p-3 bg-gray-100 rounded-xl outline-none"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 bg-gray-100 rounded-xl outline-none"
          />

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-red-700 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              {loading ? "Mise à jour..." : "Enregistrer"}
            </button>

            <button
              onClick={handleCancel}
              type="button"
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default EditAdminProfile;