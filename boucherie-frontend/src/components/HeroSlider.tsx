"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image: "https://media.istockphoto.com/id/1443190699/fr/photo/diff%C3%A9rents-types-de-viande-crue.jpg?s=612x612&w=0&k=20&c=y66UbtXY4qtBqkrYUQ9BDrPRyvMn0DNT7dNQPR1JMbk=",
    title: "Viande Artisanale de Qualité",
    subtitle: "Découvrez des produits frais issus d’un savoir-faire authentique et local.",
    button: { text: "Voir le Catalogue", href: "/catalogue" },
  },
  {
    image: "https://media.istockphoto.com/id/1001742412/fr/photo/viande-de-boucherie-viande-cutter.jpg?s=612x612&w=0&k=20&c=mBn6_ukZaEIKArR9lt49mYXF0XdHIS7EHjXeFYvLmb8=",
    title: "Promotions Exclusives",
    subtitle: "Profitez de nos offres limitées sur vos coupes préférées cette semaine.",
    button: { text: "Voir les Promotions", href: "/catalogue?is_on_promotion=true" },
  },
  {
    image: "https://media.istockphoto.com/id/171154555/fr/photo/de-la-viande-dans-un-supermarch%C3%A9-service.jpg?s=612x612&w=0&k=20&c=8F4JYibueUF4Cqm8fRktWwO6e_AzGT3ooJVKfuWbrpk=",
    title: "Fraîcheur & Livraison Rapide",
    subtitle: "Commandez aujourd’hui et recevez vos produits sous 24h à domicile.",
    button: { text: "Commander Maintenant", href: "/catalogue?is_new_arrival=true" },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } 
  },
};

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-stone-950 flex justify-center items-center">
      {/* --- Image de fond avec effet de zoom lent --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" as any }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          {/* Overlay dégradé complexe pour le luxe */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:bg-gradient-to-b md:from-black/60 md:via-black/20 md:to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* --- Contenu Central --- */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-12 flex flex-col items-center md:items-start text-center md:text-left">
        <motion.div
          key={current}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Badge de bienvenue optionnel */}
          <motion.span 
            variants={itemVariants}
            className="inline-block px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase bg-red-700 text-white rounded-sm"
          >
            Qualité Bouchère Supérieure
          </motion.span>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight md:leading-none mb-4 md:mb-6 font-serif tracking-tighter"
          >
            {slide.title.split(" ").map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? "text-yellow-500" : "text-white"}>
                {word}{" "}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-lg md:text-2xl text-stone-300 mb-8 md:mb-10 max-w-2xl font-medium leading-relaxed"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              href={slide.button.href}
              className="group relative overflow-hidden bg-yellow-500 text-stone-950 px-8 py-4 md:px-10 md:py-5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_20px_50px_rgba(234,179,8,0.3)]"
            >
              <span className="relative z-10">{slide.button.text}</span>
              <ArrowRight className="relative z-10 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* --- Indicateurs de navigation modernisés --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 flex items-end gap-4 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="group flex flex-col items-center gap-2 outline-none"
          >
            <span className={`text-[10px] font-bold transition-colors ${idx === current ? "text-yellow-500" : "text-stone-500 group-hover:text-stone-300"}`}>
              0{idx + 1}
            </span>
            <div className={`relative h-[3px] transition-all duration-500 ${idx === current ? "w-12 bg-yellow-500" : "w-6 bg-stone-700 group-hover:bg-stone-500"}`}>
               {/* Barre de progression visuelle sur l'actif */}
               {idx === current && (
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 8, ease: "linear" as any }}
                   className="absolute inset-0 bg-white/50"
                 />
               )}
            </div>
          </button>
        ))}
      </div>

      {/* --- Décoration : Numéro de slide géant en fond --- */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[30vh] font-black text-white/[0.03] select-none pointer-events-none hidden lg:block">
        0{current + 1}
      </div>
    </section>
  );
};

export default HeroSlider;