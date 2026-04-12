import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/;

const AdminSecurity = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return setError("Tous les champs sont obligatoires.");
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    if (!strongPasswordRegex.test(form.newPassword)) {
      return setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
    }

    try {
      setLoading(true);

      await api.put("/admin/change-password", form);

      setMessage("Mot de passe modifié avec succès.");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Erreur lors de la modification."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/profile");
  };

  return (
    <AdminRoute>
      <div className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl">

        <h2 className="text-2xl font-bold mb-8">
          Sécurité du Compte
        </h2>

        <div className="space-y-6">

          {/* CURRENT PASSWORD */}
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Mot de passe actuel"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="off"
              className="w-full p-3 bg-gray-100 rounded-xl outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("current")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.current ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              placeholder="Nouveau mot de passe"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="off"
              className="w-full p-3 bg-gray-100 rounded-xl outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("new")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.new ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="off"
              className="w-full p-3 bg-gray-100 rounded-xl outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("confirm")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-red-700 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
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

export default AdminSecurity;