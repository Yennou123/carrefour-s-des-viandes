"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, User, Lock, Loader2, Save, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// On le transforme en composant pour l'intégrer dans ProfilPage
const UserSettings: React.FC = () => {
  const { user, setUser } = useAuth();

  // On initialise avec des chaînes vides pour éviter les erreurs si user est lent à charger
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    try {
      setLoadingInfo(true);
      const response = await api.put("/users/profile", { firstName, lastName, email });
      
      // Mise à jour immédiate du contexte global pour que le Header et la Vue d'ensemble réagissent
      if (user) {
        setUser({ ...user, ...response.data.user });
      }

      setInfoMessage({ type: "success", text: response.data.message || "Profil mis à jour avec succès !" });
      
      // Auto-hide alert
      setTimeout(() => setInfoMessage(null), 5000);
    } catch (error: any) {
      setInfoMessage({ type: "error", text: error.response?.data?.message || "Erreur lors de la mise à jour." });
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    try {
      setLoadingPassword(true);
      const response = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordMessage({ type: "success", text: response.data.message || "Mot de passe modifié avec succès !" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto-hide alert
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch (error: any) {
      setPasswordMessage({ type: "error", text: error.response?.data?.message || "Erreur serveur." });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ✏️ SECTION INFORMATIONS */}
      <motion.div
        className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <User className="w-5 h-5 text-red-700" />
          </div>
          <h2 className="text-xl font-serif font-black text-stone-900 italic">
            Détails du compte
          </h2>
        </div>

        <form onSubmit={handleUpdateInfo} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium text-stone-500"
              required
            />
          </div>

          <div className="md:col-span-2 pt-4">
            {infoMessage && (
              <div className={`flex items-center gap-2 p-4 mb-4 rounded-xl text-sm font-bold ${infoMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {infoMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {infoMessage.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loadingInfo}
              className="flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 disabled:opacity-50"
            >
              {loadingInfo ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5 text-red-500" />}
              {loadingInfo ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* 🔐 SECTION SÉCURITÉ */}
      <motion.div
        className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <Lock className="w-5 h-5 text-red-700" />
          </div>
          <h2 className="text-xl font-serif font-black text-stone-900 italic">
            Sécurité du mot de passe
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
          {/* Mot de passe actuel */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Nouveau mot de passe */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Confirmation</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-bold ${passwordMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {passwordMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingPassword}
            className="group flex items-center gap-2 bg-red-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 disabled:opacity-50"
          >
            {loadingPassword ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {loadingPassword ? "Modification..." : "Changer mon mot de passe"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UserSettings;