"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  Variants
} from "framer-motion";
import { Users, ShoppingBag, Tag, TrendingUp } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  accent: string;
}

/* -----------------------------------------------------------
    COMPOSANT : AnimatedNumber
----------------------------------------------------------- */
const AnimatedNumber = ({ value, start }: { value: number; start: boolean }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.floor(latest).toLocaleString()
  );

  useEffect(() => {
    if (start) {
      const controls = animate(count, value, {
        duration: 2.5,
        ease: "easeOut" as any, 
      });
      return controls.stop;
    }
  }, [value, start, count]);

  return (
    <motion.span className="text-4xl md:text-5xl font-black tracking-tighter italic">
      {rounded}
    </motion.span>
  );
};

/* -----------------------------------------------------------
    COMPOSANT PRINCIPAL : StatsSection
----------------------------------------------------------- */
const StatsSection: React.FC = () => {
  const [stats, setStats] = useState({
    ventes: 0,
    nouveauxClients: 0,
    promotions: 0,
  });
  const [loading, setLoading] = useState(true);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes, promoRes] = await Promise.all([
        api.get("/orders/count"),
        api.get("/users/count"),
        api.get("/products/promo-count"),
      ]);

      setStats({
        ventes: ordersRes.data?.totalOrders || 0,
        nouveauxClients: usersRes.data?.totalUsers || 0,
        promotions: promoRes.data?.totalPromoProducts || 0,
      });
    } catch (err) {
      console.error("❌ Erreur lors du chargement des statistiques :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const data: Stat[] = [
    {
      label: "Utilisateurs actifs",
      value: stats.nouveauxClients,
      description: "Une communauté engagée qui grandit chaque jour.",
      color: "bg-white text-stone-900 border-stone-200",
      accent: "text-blue-600",
      icon: <Users size={24} />,
    },
    {
      label: "Commandes totales",
      value: stats.ventes,
      description: "La preuve de notre excellence opérationnelle.",
      color: "bg-stone-900 text-stone-50 border-stone-800",
      accent: "text-yellow-500",
      icon: <ShoppingBag size={24} />,
    },
    {
      label: "Offres en cours",
      value: stats.promotions,
      description: "Des opportunités exclusives sélectionnées pour vous.",
      color: "bg-red-800 text-red-50 border-red-900",
      accent: "text-red-200",
      icon: <Tag size={24} />,
    },
  ];

  return (
    <section ref={ref} className="relative w-full py-24 bg-stone-50 overflow-hidden">
      {/* Motif de fond subtil */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <TrendingUp size={14} />
            Performance & Impact
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif font-black text-stone-900 leading-tight"
          >
            La confiance en <span className="text-red-700 italic font-serif">chiffres</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-stone-500 mt-6 max-w-2xl mx-auto text-lg"
          >
            Nous transformons chaque interaction en une étape de croissance mesurable pour notre plateforme.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className={`relative group rounded-3xl p-10 border-b-8 shadow-2xl transition-all ${stat.color} overflow-hidden`}
            >
              {/* Cercle décoratif en arrière-plan */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700" />

              <div className={`mb-6 p-3 inline-block rounded-xl bg-stone-500/10 ${stat.accent}`}>
                {stat.icon}
              </div>

              <div className="flex flex-col">
                {loading ? (
                  <div className="h-12 w-24 bg-stone-300/20 animate-pulse rounded-lg" />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={stat.value} start={inView} />
                    <span className={`text-xl font-bold ${stat.accent}`}>+</span>
                  </div>
                )}
                
                <h3 className="text-lg font-bold mt-4 tracking-tight uppercase tracking-widest">
                  {stat.label}
                </h3>
                
                <div className="w-12 h-1 bg-current opacity-20 my-4" />
                
                <p className="text-sm opacity-70 leading-relaxed font-medium">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;