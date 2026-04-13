"use client";

import React, { useEffect } from 'react';
import SEO from "@/components/SEO";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck, Utensils, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmationPage: React.FC = () => {
    const router = useRouter();
    const { orderId } = router.query;

    useEffect(() => {
        if (router.isReady && !orderId) {
            router.push('/');
        }
    }, [router.isReady, orderId, router]);

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <SEO 
                title="Merci pour votre confiance" 
                description="Votre commande a été enregistrée avec succès. Merci d'avoir choisi Carrefour'S des Viandes."
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white rounded-[3rem] shadow-xl overflow-hidden"
            >
                {/* Header avec icône animée */}
                <div className="bg-stone-900 pt-12 pb-20 text-center relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-lg shadow-green-500/20"
                    >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-white px-4">
                        Commande <span className="text-green-500 italic">confirmée</span> !
                    </h1>
                    
                    {/* Numéro de commande flottant */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-md border border-stone-100 flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">N° de suivi</span>
                        <span className="text-lg font-black text-stone-900 tracking-tighter">#{orderId}</span>
                    </div>
                </div>

                <div className="p-8 md:p-12 pt-16 text-center">
                    <p className="text-xl text-stone-600 font-medium leading-relaxed mb-10">
                        Merci pour votre confiance. <br />
                        Nos artisans préparent déjà vos pièces avec le plus grand soin.
                    </p>

                    {/* Timeline de préparation */}
                    <div className="grid grid-cols-3 gap-2 mb-12">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-stone-400">Confirmée</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                                <Utensils size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-stone-400">Préparation</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                                <Truck size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-stone-400">Expédition</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link 
                            href={`/profil?tab=orders&view=${orderId}`}
                            className="group flex items-center justify-center gap-3 bg-red-700 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 active:scale-95"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Suivre mon colis
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link 
                            href="/catalogue" 
                            className="text-stone-400 hover:text-red-700 font-bold text-sm uppercase tracking-widest py-3 transition-colors"
                        >
                            Retourner à la boutique
                        </Link>
                    </div>

                    <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-center gap-6 opacity-60">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-stone-400" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Paiement Sécurisé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-stone-400" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Frais & Frais</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationPage;