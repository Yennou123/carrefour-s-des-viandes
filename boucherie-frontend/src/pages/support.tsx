"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Send, Ticket, ShieldQuestion, AlertTriangle, MessageSquare, History, Clock } from "lucide-react";
import api from "@/lib/axios";

const API_SUPPORT_URL = "/support";

interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: "Open" | "In_Progress" | "Closed";
  priority: "Low" | "Medium" | "High";
  admin_response?: string | null;
  createdAt: string;
}

// Le fetcher utilise l'instance axios qui gère déjà vos headers/tokens
const fetcher = (url: string) => api.get(url).then((res) => res.data);

const SupportPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // --- GESTION DES DONNÉES AVEC SWR ---
  // SWR ne lancera la requête que si isAuthenticated est vrai
  const { data: tickets, mutate, isLoading: loadingTickets } = useSWR(
    isAuthenticated ? `${API_SUPPORT_URL}/my-tickets` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // --- ÉTATS LOCAUX POUR LE FORMULAIRE ---
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Low");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setLoadingSubmit(true);
    try {
      const response = await api.post(API_SUPPORT_URL, { subject, message, priority });
      
      setSubmitMessage({ type: "success", text: response.data.message });
      setSubject(""); 
      setMessage(""); 
      setPriority("Low");

      // OPTIMISATION : Rafraîchir la liste des tickets immédiatement
      mutate();
    } catch (err: any) {
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Échec de la soumission.",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Auto-hide le message de succès/erreur
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Open": return "bg-amber-50 text-amber-700 border-amber-200";
      case "In_Progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Closed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-stone-50 text-stone-600 border-stone-200";
    }
  };

  if (!isAuthenticated) return <ProtectedRoute />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-12">
      <Head>
        <title>Support Client | La Boucherie</title>
      </Head>

      {/* --- HERO HEADER --- */}
      <section className="relative bg-stone-900 text-white pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-red-800 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800/20 rounded-2xl mb-6 backdrop-blur-sm border border-red-800/30">
            <ShieldQuestion className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 italic tracking-tight">Comment pouvons-nous vous aider ?</h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Une question sur une découpe ou un problème de livraison ? Notre équipe de bouchers et conseillers sont à votre service.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- FORMULAIRE --- */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-50 text-red-700 rounded-lg"><MessageSquare size={20}/></div>
                <h2 className="text-xl font-bold text-stone-900">Nouveau ticket</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 italic">Sujet de la demande</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-stone-50 border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-800 transition-all outline-none"
                  placeholder="Ex : Question sur la maturation..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 italic">Niveau d&apos;urgence</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-stone-50 border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-800 outline-none cursor-pointer"
                >
                  <option value="Low">🌿 Basse - Question générale</option>
                  <option value="Medium">⚡ Moyenne - Problème commande</option>
                  <option value="High">🔥 Haute - Urgence livraison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 italic">Votre message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-stone-50 border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-800 outline-none min-h-[150px]"
                  placeholder="Décrivez votre besoin avec précision..."
                  required
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                  submitMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {submitMessage.type === "success" ? <Send size={16}/> : <AlertTriangle size={16}/>}
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loadingSubmit ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {loadingSubmit ? "Traitement..." : "Envoyer ma demande"}
              </button>
            </form>
          </div>

          {/* --- HISTORIQUE --- */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-100 text-stone-700 rounded-lg"><History size={20}/></div>
                    <h2 className="text-xl font-bold text-stone-900">Suivi de mes tickets</h2>
                </div>
                {!loadingTickets && tickets && <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{tickets.length} Ticket(s)</span>}
            </div>

            {loadingTickets ? (
              <div className="flex flex-col items-center py-20 text-stone-400 gap-4">
                <Loader2 className="animate-spin w-8 h-8 text-red-800" />
                <p className="font-medium">Récupération de l&apos;historique...</p>
              </div>
            ) : !tickets || tickets.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-stone-100 rounded-2xl">
                <Ticket className="mx-auto w-12 h-12 text-stone-200 mb-4" />
                <p className="text-stone-500 italic font-serif">Vous n&apos;avez aucune demande en cours.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.map((ticket: SupportTicket) => (
                  <div key={ticket.id} className="group p-5 border border-stone-100 rounded-2xl bg-[#FDFCFB] hover:bg-white hover:border-red-100 transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-bold text-stone-900 leading-snug group-hover:text-red-800 transition-colors">{ticket.subject}</h3>
                      <span className={`text-[10px] uppercase tracking-tighter font-black px-2.5 py-1 rounded-md border ${getStatusStyles(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 font-medium mb-4">
                      <div className="flex items-center gap-1"><Clock size={12}/> {new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1">
                        {ticket.priority === "High" && <AlertTriangle size={12} className="text-red-500"/>}
                        Priorité {ticket.priority}
                      </div>
                    </div>

                    {ticket.admin_response && (
                      <div className="relative mt-4 pl-6 py-4 rounded-xl bg-emerald-50/50 border-l-4 border-emerald-400">
                        <div className="absolute top-2 right-4 text-emerald-200"><MessageSquare size={40} className="opacity-20"/></div>
                        <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Réponse Officielle</p>
                        <p className="text-sm text-emerald-700 italic leading-relaxed">
                          {ticket.admin_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupportPage;