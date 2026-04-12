import React, { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Facebook, MessageCircle, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.post("/newsletter", { email });

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");

      // Gestion intelligente du message d'erreur
      const errorMsg = err.response?.data?.message || "Une erreur est survenue.";
      alert(errorMsg);
    } finally {
      // On repasse en mode idle après un délai pour permettre une nouvelle inscription
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" as any } 
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-200 mt-20 border-t-4 border-red-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* --- Section Principale --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 pb-12 border-b border-stone-800"
        >

          {/* Bloc 1: Logo & Slogan */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl md:text-2xl font-serif font-black tracking-tighter text-white">
              CARREFOUR&apos;S <br className="hidden xs:block" />
              <span className="text-red-600 text-xs md:text-sm font-sans tracking-[0.2em] md:tracking-[0.3em] uppercase">Des Viandes</span>
            </h3>
            <p className="text-stone-400 text-xs md:text-sm leading-relaxed max-w-xs italic">
              &quot;L&apos;excellence du fait maison et la passion du terroir, livrées directement de notre atelier à votre table.&quot;
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="https://facebook.com" className="p-2 bg-stone-900 rounded-full hover:text-red-500 hover:bg-white transition-all duration-300 transform hover:scale-110">
                <Facebook size={18} />
              </Link>
              <Link href="https://wa.me/22675551410" className="p-2 bg-stone-900 rounded-full hover:text-emerald-500 hover:bg-white transition-all duration-300 transform hover:scale-110">
                <MessageCircle size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Bloc 2: Produits */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Nos Rayons</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/catalogue?category=viande" className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-red-800 rounded-full group-hover:scale-150 transition-transform"></span> Viandes d&apos;exception
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=charcuterie" className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-red-800 rounded-full group-hover:scale-150 transition-transform"></span> Charcuterie artisanale
                </Link>
              </li>
              <li>
                <Link href="/catalogue?is_on_promotion=true" className="text-red-500 hover:text-white transition-colors flex items-center gap-2 font-bold group">
                  <span className="w-1 h-1 bg-current rounded-full group-hover:scale-150 transition-transform"></span> Offres Spéciales
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Bloc 3: Service Client */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Assistance</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href={`/profil?tab=orders&view`} className="text-stone-400 hover:text-white transition-colors">Suivre mon colis</Link>
              </li>
              <li>
                <Link href="/cgv" className="text-stone-400 hover:text-white transition-colors">Conditions de vente</Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-400 hover:text-white transition-colors">Aide & FAQ</Link>
              </li>
              <li className="flex items-center gap-2 text-stone-500 text-xs">
                <ShieldCheck size={14} className="text-emerald-600" /> Paiement 100% sécurisé
              </li>
            </ul>
          </motion.div>

          {/* Bloc 4: Contact Direct */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">La Boucherie</h4>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-start gap-3 text-stone-400 group hover:text-white transition-colors">
                <MapPin size={18} className="text-red-700 shrink-0 group-hover:-translate-y-1 transition-transform" />
                <p>N 6, Secteur 15, <br />Ouagadougou, Burkina Faso</p>
              </div>
              <div className="flex items-center gap-3 text-stone-400 group hover:text-white transition-colors">
                <Mail size={18} className="text-red-700 shrink-0 group-hover:scale-110 transition-transform" />
                <p className="truncate">marc6116ouedraogo@gmail.com</p>
              </div>
              <div className="flex items-center gap-3 text-stone-400 font-bold text-red-600 group hover:text-red-500 transition-colors">
                <Phone size={18} className="shrink-0 group-hover:rotate-12 transition-transform" />
                <p>+226 75 55 14 10</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Newsletter Integrée --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-12 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-md text-center lg:text-left">
            <h4 className="text-xl font-serif font-bold text-white mb-2 italic">Rejoignez le Club des Gourmets</h4>
            <p className="text-stone-400 text-sm">Inscrivez-vous pour recevoir nos recettes exclusives et nos arrivages de saison.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full max-w-md group shadow-2xl relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre meilleur email..."
              className="w-full bg-stone-900 border-2 border-stone-800 text-white p-4 rounded-l-xl focus:outline-none focus:border-red-800 transition-all font-medium"
              required
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`px-8 rounded-r-xl transition-all flex items-center gap-2 font-bold ${status === "success" ? "bg-emerald-600" : "bg-red-800 hover:bg-red-700"
                } text-white`}
            >
              {status === "loading" ? (
                <span className="animate-pulse">...</span>
              ) : status === "success" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><ShieldCheck size={18} /></motion.div>
              ) : (
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              <span className="hidden sm:inline">
                {status === "loading" ? "Envoi" : status === "success" ? "OK" : "GO"}
              </span>
            </button>
          </form>
        </motion.div>

        {/* --- Copyright --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600"
        >
          <p>© {new Date().getFullYear()} Carrefour&apos;S des Viandes — Artisans Bouchers</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-stone-400 transition">Mentions Légales</Link>
            <Link href="#" className="hover:text-stone-400 transition">Cookies</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;