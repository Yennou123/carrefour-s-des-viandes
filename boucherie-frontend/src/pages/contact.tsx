"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock3, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/axios';
import SEO from '@/components/SEO';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const ContactPage: React.FC = () => {
  // --- SWR : Récupération des infos utilisateur pour auto-complétion ---
  const { data: user } = useSWR('/users/profile', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  });

  const [firstName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({
    type: 'idle',
    msg: ''
  });

  // Remplissage automatique quand les données SWR arrivent
  useEffect(() => {
    if (user) {
      setName(user.firstName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (status.type !== 'idle' && status.type !== 'loading') {
      const timer = setTimeout(() => setStatus({ type: 'idle', msg: '' }), 6000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Envoi de votre message...' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Message envoyé ! Nous vous répondrons rapidement.' });
        setMessage(''); // On garde le nom/email mais on vide le message
      } else {
        const data = await response.json();
        setStatus({ type: 'error', msg: data.message || 'Une erreur est survenue.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erreur réseau. Veuillez vérifier votre connexion.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-16 px-4">
      <SEO
        title="Contact & Localisation - Ouagadougou"
        description="Besoin d'un conseil ou d'une commande spéciale ? Retrouvez Carrefour'S des Viandes à Ouagadougou ou contactez-nous directement."
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 italic">
            Parlons de vos envies
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-medium">
            Une question sur une pièce de viande ou besoin d&apos;un conseil ? Notre équipe est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Section Info */}
          <div className="lg:col-span-4">
            <div className="bg-stone-900 p-8 rounded-[2rem] text-white h-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-800/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <h2 className="text-2xl font-bold mb-8 relative">Nos coordonnées</h2>

              <div className="space-y-8 relative">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-stone-800 rounded-xl text-red-500 group-hover:bg-red-800 group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-400 uppercase tracking-widest">Adresse</h4>
                    <p className="mt-1 font-medium italic">Carrefour&apos;S des Viandes<br />Ouagadougou, Burkina Faso</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-stone-800 rounded-xl text-red-500 group-hover:bg-red-800 group-hover:text-white transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-400 uppercase tracking-widest">Téléphone</h4>
                    <a href="tel:+22675551410" className="mt-1 block font-medium hover:text-red-400 transition">+226 75 55 14 10</a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-stone-800 rounded-xl text-red-500 group-hover:bg-red-800 group-hover:text-white transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-400 uppercase tracking-widest">Email</h4>
                    <a href="mailto:azariaouedraogo44@gmail.com" className="mt-1 block font-medium hover:text-red-400 transition break-all">azariaouedraogo44@gmail.com</a>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-800">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                  <Clock3 size={20} />
                  <span className="font-bold uppercase text-xs tracking-tighter">Horaires d&apos;ouverture</span>
                </div>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Mardi - Samedi : <span className="text-white">08h00 - 19h00</span><br />
                  Dimanche - Lundi : <span className="text-red-500 font-bold">Fermé</span>
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-100 shadow-sm relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Nom complet</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jean Dupont"
                    className="w-full bg-stone-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-red-800/20 focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Adresse Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jean@email.com"
                    className="w-full bg-stone-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-red-800/20 focus:ring-0 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Votre Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full bg-stone-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-red-800/20 focus:ring-0 transition-all outline-none resize-none"
                ></textarea>
              </div>

              {status.msg && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-medium transition-all ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                  {status.type === 'loading' && <Loader2 size={18} className="animate-spin" />}
                  {status.type === 'success' && <CheckCircle2 size={18} />}
                  {status.type === 'error' && <AlertCircle size={18} />}
                  {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-red-800 text-white px-10 py-5 rounded-2xl font-bold hover:bg-stone-900 transition-all shadow-lg shadow-red-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.type === 'loading' ? 'Envoi...' : (
                  <>
                    <Send size={18} />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;