"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="w-full py-24 px-6 md:px-10 lg:px-20 bg-stone-50">
      {/* --- En-tête de section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div className="space-y-2">
          <span className="text-red-700 font-bold uppercase tracking-[0.2em] text-xs">Sélection du boucher</span>
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 font-serif">
            Acheter par <span className="text-red-700 italic">Catégorie</span>
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="group flex items-center gap-2 text-stone-600 text-sm font-bold hover:text-red-700 transition-colors"
        >
          Voir toutes les collections 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* --- Layout Mobile (Slider) --- */}
      <div className="block md:hidden overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory">
        <div className="flex space-x-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative w-72 h-56 flex-shrink-0 rounded-3xl overflow-hidden shadow-xl shadow-stone-200/50 snap-center group"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 z-10">
                <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                <Link href={`/catalogue?category=${encodeURIComponent(category.name)}`}>
                  <span className="text-red-400 text-xs uppercase font-black tracking-widest">Explorer</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Layout Desktop (Bento Grid) --- */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="hidden md:grid grid-cols-4 grid-rows-2 gap-6 h-[700px]"
      >
        {categories.slice(0, 5).map((category, index) => (
          <motion.div
            key={category.id}
            variants={{
              hidden: { opacity: 0, scale: 0.9, y: 20 },
              visible: { 
                opacity: 1, 
                scale: 1, 
                y: 0, 
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
              }
            }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3 }
            }}
            className={`relative rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-stone-200 
              ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}
              ${index === 3 ? "col-span-1" : ""}
            `}
          >
            {/* Image avec Overlay */}
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
            />
            
            {/* Overlay graduel */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Bordure interne subtile au hover */}
            <div className="absolute inset-4 border border-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100" />

            {/* Contenu */}
            <div className="absolute bottom-8 left-8 z-10 transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className={`text-white font-bold mb-2 drop-shadow-lg ${index === 0 ? "text-3xl" : "text-xl"}`}>
                {category.name}
              </h3>
              <Link
                href={`/catalogue?category=${encodeURIComponent(category.name)}`}
                className="inline-flex items-center gap-2 text-white/70 group-hover:text-red-400 font-bold text-sm transition-colors"
              >
                Acheter maintenant
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CSS pour masquer la scrollbar proprement sur mobile */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}