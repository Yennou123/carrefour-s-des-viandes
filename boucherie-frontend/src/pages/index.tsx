"use client";

import React, { useMemo } from "react";
import Head from "next/head";
import useSWR from "swr";
import ProductCard, { Product } from "@/components/products/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import CategoriesSection from "@/components/CategoriesSection";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Loader, Sparkles, Percent, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSearch } from "@/context/SearchContext";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  image: string;
}

/* -----------------------------------------------------------
   SECTION : PRODUITS (Identique au design original)
----------------------------------------------------------- */
const ProductSection: React.FC<{
  title: string;
  subtitle: string;
  products: Product[];
  loading: boolean;
  icon: React.ReactNode;
  accentColor: string;
}> = ({ title, subtitle, products, loading, icon, accentColor }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  } as const;

  return (
    <section className="py-20 border-b border-stone-100 last:border-0 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${accentColor} bg-opacity-10 shadow-sm`}>
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
              className: `w-8 h-8 ${accentColor.replace('bg-', 'text-')}` 
            })}
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 font-serif tracking-tight">
              {title}
            </h2>
            <p className="text-stone-500 font-medium mt-1">{subtitle}</p>
          </div>
        </div>
        
        <Link href="/catalogue" className="group flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-red-700 transition-colors">
          Explorer la sélection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader className="w-10 h-10 animate-spin text-red-700" />
          <p className="text-stone-400 font-medium animate-pulse">Préparation de la sélection...</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {products && products.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product) => (
                <motion.div 
                  key={product.id} 
                  variants={itemVariants}
                  layout 
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }}
              className="bg-stone-50 rounded-3xl py-20 text-center border-2 border-dashed border-stone-200"
            >
              <p className="text-stone-400 font-serif italic text-lg text-center">
                Aucun trésor trouvé dans cette catégorie pour le moment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
};

/* -----------------------------------------------------------
   PAGE PRINCIPALE (Refactorisée avec SWR)
----------------------------------------------------------- */
export default function Home() {
  const { searchQuery } = useSearch();

  // Helper pour normaliser les produits (gère le nouveau format paginé et l'ancien format tableau)
  const normalize = (data: any) => {
    const productsArray = data?.products || (Array.isArray(data) ? data : []);
    return productsArray.map((p: any) => ({ ...p, unitType: p.unitType || p.unit_type || "Pièce" }));
  };

  // Récupération des Nouveautés
  const { data: recentData, isLoading: loadingRecent } = useSWR(
    `/products?is_new_arrival=true&limit=6${searchQuery ? `&search=${searchQuery}` : ""}`
  );

  // Récupération des Promotions
  const { data: promoData, isLoading: loadingPromo } = useSWR(
    `/products?is_on_promotion=true&limit=6${searchQuery ? `&search=${searchQuery}` : ""}`
  );

  // Récupération globale pour les catégories (On demande un grand nombre pour être sûr d'avoir toutes les catégories)
  const { data: allProductsData } = useSWR("/products?limit=100");

  // Calcul des catégories uniques
  const categories = useMemo(() => {
    const products = allProductsData?.products || [];
    if (products.length === 0) return [];
    
    const map = new Map();
    products.forEach((p: Product) => {
      if (p.category && !map.has(p.category)) {
        map.set(p.category, {
          id: p.category.toLowerCase().replace(/\s+/g, "-"),
          name: p.category,
          image: p.image_url || "/placeholder-category.jpg",
        });
      }
    });
    return Array.from(map.values());
  }, [allProductsData]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Carrefour&apos;S des Viandes | Boucherie d&apos;Excellence</title>
        <meta name="description" content="Découvrez l'excellence du fait maison : viandes fraîches, charcuteries artisanales et volailles de premier choix." />
      </Head>

      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
        <HeroSlider />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ProductSection
          title="Nouveaux Arrivages"
          subtitle="Les meilleures pièces fraîchement arrivées dans notre atelier."
          products={normalize(recentData)}
          loading={loadingRecent}
          icon={<Sparkles />}
          accentColor="bg-amber-500"
        />

        <div className="relative">
          <div className="absolute inset-0 bg-red-50/30 -mx-4 sm:-mx-6 lg:-mx-8 pointer-events-none" />
          <div className="relative">
            <ProductSection
              title="Offres Spéciales"
              subtitle="Profitez de tarifs d'exception sur une sélection de pièces choisies."
              products={normalize(promoData)}
              loading={loadingPromo}
              icon={<Percent />}
              accentColor="bg-red-600"
            />
          </div>
        </div>

        <div className="space-y-12">
          <CategoriesSection categories={categories} />
          
          <div className="py-12 bg-stone-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl">
            <StatsSection />
          </div>
          
          <TestimonialsSection />
        </div>
      </main>

      <div className="h-20" />
    </div>
  );
}