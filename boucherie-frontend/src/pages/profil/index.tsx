"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserSettings from "@/components/profile/UserSettings";
import AddressSettings from "@/components/profile/AddressSettings";
import OrderSettings from "@/components/profile/OrderSettings"; // Import du nouveau composant
import { User, ShoppingBag, MapPin, LogOut, Settings, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProfilPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  // Ajout de l'état "orders"
  const [activeTab, setActiveTab] = useState<"index" | "settings" | "address" | "orders">("index");
  
  // Synchronise l'onglet avec l'URL
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab as any);
    }
  }, [router.query.tab]);

  if (!isAuthenticated || !user) {
    return <ProtectedRoute />;
  }

  const { email, firstName, lastName, role, address } = user;
  const isAdmin = role === "admin";
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  const hasAddress = !!address;
  const displayAddress = hasAddress ? address : { street: "Non définie", city: "Non définie", zipCode: "Non défini", country: "Non défini" };

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <Head>
        <title>Mon Profil | Carrefour des Viandes</title>
      </Head>

      {/* --- Header --- */}
      <div className="bg-white border-b border-stone-200 pt-12 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-700 text-white text-2xl font-black mb-4 shadow-xl shadow-red-700/20"
        >
          {initials}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-black text-stone-900"
        >
          Bonjour, {firstName} !
        </motion.h1>
        <p className="text-stone-500 font-medium">Ravi de vous revoir dans votre espace</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* --- 🧭 Menu latéral --- */}
          <motion.aside className="lg:col-span-4 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-200">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 pl-2">Navigation</h2>

              <nav className="space-y-1">
                {/* Vue d'ensemble */}
                <button
                  onClick={() => setActiveTab("index")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === "index" ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20" : "text-stone-600 hover:bg-stone-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <User size={18} />
                    <span>Vue d&apos;ensemble</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === "index" ? "opacity-50" : "opacity-0"} />
                </button>

                {/* Paramètres */}
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === "settings" ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20" : "text-stone-600 hover:bg-stone-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>Paramètres</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === "settings" ? "opacity-50" : "opacity-0"} />
                </button>

                {/* Mon Adresse */}
                <button
                  onClick={() => setActiveTab("address")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === "address" ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20" : "text-stone-600 hover:bg-stone-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={18} />
                    <span>Mon Adresse</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === "address" ? "opacity-50" : "opacity-0"} />
                </button>

                {/* Mes Commandes (Converti en Bouton d'onglet) */}
                {!isAdmin && (
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${activeTab === "orders" ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20" : "text-stone-600 hover:bg-stone-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={18} />
                      <span>Mes Commandes</span>
                    </div>
                    <ChevronRight size={16} className={activeTab === "orders" ? "opacity-50" : "opacity-0"} />
                  </button>
                )}

                <div className="pt-4 mt-4 border-t border-stone-100">
                  <button onClick={logout} className="flex items-center gap-3 p-4 w-full text-left text-red-700 font-bold hover:bg-red-50 rounded-2xl transition-all">
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </nav>
            </div>

            <div className="bg-stone-900 rounded-[2rem] p-6 text-white flex items-center gap-4 shadow-xl shadow-stone-900/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><ShieldCheck className="text-red-500" /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Statut Compte</p>
                <p className="font-bold tracking-tight">{isAdmin ? "Administrateur" : "Client Privilège"}</p>
              </div>
            </div>
          </motion.aside>

          {/* --- 💼 Contenu principal dynamique --- */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === "index" && (
                <motion.div
                  key="index"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Bloc Infos */}
                  <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-200">
                    <h2 className="text-xl font-serif font-black text-stone-900 mb-8 flex items-center gap-3 italic">
                      Informations Personnelles
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Identité</label>
                        <p className="text-lg font-bold text-stone-800 bg-stone-50 p-4 rounded-2xl">{firstName} {lastName}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
                        <p className="text-lg font-bold text-stone-800 bg-stone-50 p-4 rounded-2xl">{email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bloc Adresse (Aperçu) */}
                  {!isAdmin && (
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none"><MapPin size={120} /></div>
                      <h2 className="text-xl font-serif font-black text-stone-900 mb-8 italic">Adresse de Livraison</h2>
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-stone-900 font-bold text-lg leading-tight">{displayAddress.street}</p>
                          <p className="text-stone-500 font-medium italic">{displayAddress.zipCode} {displayAddress.city}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("address")}
                          className="px-6 py-3 bg-white text-stone-900 border border-stone-200 rounded-xl font-bold text-sm hover:border-red-700 hover:text-red-700 transition-all shadow-sm"
                        >
                          {hasAddress ? "Modifier" : "Ajouter une adresse"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UserSettings />
                </motion.div>
              )}

              {activeTab === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AddressSettings />
                </motion.div>
              )}

              {/* Rendu du nouveau composant Commandes */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <OrderSettings />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;