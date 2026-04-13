"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Heart, Clock, Award, Users, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import Link from "next/link";

const ValueCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
  >
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-800 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-stone-900 mb-4">{title}</h3>
    <p className="text-stone-500 leading-relaxed">{description}</p>
  </motion.div>
);

const SectionTitle = ({ subtitle, title, description, light = false }: { subtitle: string, title: string, description?: string, light?: boolean }) => (
  <div className="mb-16">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${light ? 'bg-white/10 text-white' : 'bg-red-50 text-red-700'} text-[10px] font-bold uppercase tracking-widest mb-4`}
    >
      <ChevronRight size={12} />
      {subtitle}
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-5xl font-serif font-black ${light ? 'text-white' : 'text-stone-900'} leading-tight max-w-2xl`}
    >
      {title}
    </motion.h2>
    {description && (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className={`mt-6 text-lg ${light ? 'text-white/70' : 'text-stone-500'} max-w-2xl leading-relaxed`}
      >
        {description}
      </motion.p>
    )}
  </div>
);

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <SEO 
        title="Nous Connaître - L'Art de la Boucherie" 
        description="Découvrez l'histoire de Carrefour'S des Viandes, notre passion pour l'excellence et nos engagements pour vous offrir la meilleure viande à Ouagadougou."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1551028150-64b9f398f678?q=80&w=2070&auto=format&fit=crop" 
            alt="Artisan Boucher" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              <Award size={14} />
              Boucherie d&apos;Excellence depuis 2018
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-white leading-[1.1] mb-8">
              L&apos;excellence <span className="text-red-600 italic">artisanale</span> au service de votre table.
            </h1>
            <p className="text-xl text-stone-300 font-medium leading-relaxed max-w-xl">
              Bienvenue chez Carrefour&apos;S des Viandes, où chaque pièce raconte une histoire de passion, de terroir et de savoir-faire.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- NOTRE HISTOIRE --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <SectionTitle 
              subtitle="Notre Histoire"
              title="Une passion née du respect du produit"
              description="Situé au cœur de Ouagadougou, Carrefour'S des Viandes est né d'une vision simple : réconcilier les citadins avec le goût authentique de la viande de qualité. Ce qui a commencé comme une petite boucherie de quartier est devenu aujourd'hui une référence pour les gourmets exigeants."
            />
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Maîtrise Traditionnelle</h4>
                  <p className="text-stone-500 text-sm">Nos bouchers perpétuent les techniques de découpe artisanale pour préserver la saveur.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Passion du Goût</h4>
                  <p className="text-stone-500 text-sm">Nous sélectionnons chaque bête avec soin auprès des meilleurs éleveurs locaux.</p>
                </div>
              </div>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1976&auto=format&fit=crop" 
                alt="Notre établissement" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 hidden md:block">
              <div className="text-4xl font-black text-red-800 italic mb-2">100%</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Viande Locale Traçable</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- NOS VALEURS --- */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle 
            subtitle="Nos Engagements"
            title="Pourquoi choisir Carrefour'S ?"
            description="Nous plaçons la qualité et votre santé au centre de nos préoccupations quotidiennes."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={ShieldCheck}
              title="Hygiène Irréprochable"
              description="Nos installations respectent les normes sanitaires les plus strictes. Chaque pièce est préparée dans un environnement contrôlé."
              delay={0.2}
            />
            <ValueCard 
              icon={Clock}
              title="Fraîcheur Garantie"
              description="Nous travaillons en circuit court. La viande arrive chaque matin et est travaillée immédiatement pour garantir une tendreté maximale."
              delay={0.3}
            />
            <ValueCard 
              icon={Users}
              title="Conseil d'Experts"
              description="Plus que des vendeurs, nos collaborateurs sont des conseillers passionnés qui sauront vous guider pour chaque recette."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- NOTRE EXPERTISE --- */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <img src="https://www.transparenttextures.com/patterns/cubes.png" className="w-full h-full object-cover" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionTitle 
            subtitle="Notre Savoir-Faire"
            title="L'expertise du boucher, de l'étal à votre assiette."
            light
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-600 opacity-50 font-serif italic">01.</div>
              <h3 className="text-2xl font-bold">Sélection Rigoureuse</h3>
              <p className="text-white/60 leading-relaxed">Nous choisissons les bêtes sur pied chez des éleveurs partenaires engagés pour le bien-être animal et une alimentation saine.</p>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-600 opacity-50 font-serif italic">02.</div>
              <h3 className="text-2xl font-bold">Maturation Maîtrisée</h3>
              <p className="text-white/60 leading-relaxed">Nous laissons nos pièces de bœuf maturer le temps nécessaire pour développer des arômes exceptionnels et une texture fondante.</p>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-600 opacity-50 font-serif italic">03.</div>
              <h3 className="text-2xl font-bold">Découpe sur mesure</h3>
              <p className="text-white/60 leading-relaxed">Chaque morceau est découpé avec précision selon vos besoins spécifiques ou les recettes traditionnelles.</p>
            </div>
          </div>
          
          <div className="mt-20 pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
              <h3 className="text-3xl font-serif font-bold italic mb-2">Prêt à goûter l&apos;excellence ?</h3>
              <p className="text-white/60">Explorez notre catalogue et commandez en ligne.</p>
            </div>
            <Link 
              href="/catalogue" 
              className="bg-white text-stone-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Voir le Catalogue
            </Link>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
};

export default AboutPage;
