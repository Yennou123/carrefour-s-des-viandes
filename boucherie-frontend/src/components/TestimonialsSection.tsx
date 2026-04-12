"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  id: number;
  client?: { lastName: string, firstName: string };
  comment: string;
  rating: number;
  approved: boolean;
  created_at?: string;
}

const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews/approved/latest", {
        params: { limit: 3 },
      });
      setReviews(response.data || []);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des avis :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Générateur d'initiales pour l'avatar
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  } as const;

  return (
    <section className="relative py-24 overflow-hidden bg-stone-50">
      {/* Éléments de fond décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-red-700 font-black uppercase tracking-[0.3em] text-xs"
          >
            Témoignages
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-black text-stone-900 mt-4 leading-tight"
          >
            La parole est à <span className="text-red-700 italic">nos clients</span>
          </motion.h2>
          <div className="w-20 h-1.5 bg-red-700 mx-auto mt-6 rounded-full" />
        </div>

        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-stone-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-3xl">
            <p className="text-stone-400 font-medium">Votre avis compte ! Soyez le premier à nous écrire.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-[2.5rem] p-10 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col h-full transition-all duration-300"
              >
                {/* Icône de citation décorative */}
                <Quote className="absolute top-8 right-8 text-stone-100 w-12 h-12 -z-0 group-hover:text-red-50 transition-colors" />

                {/* Étoiles */}
                <div className="flex gap-1 mb-6 relative z-10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Commentaire */}
                <blockquote className="relative z-10">
                  <p className="text-stone-700 font-medium italic leading-relaxed text-lg mb-8">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </blockquote>

                {/* Footer du témoignage : Avatar + Nom */}
                <div className="mt-auto pt-6 border-t border-stone-100 flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-stone-800 to-stone-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                    {getInitials(review.client?.lastName || "Client")}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 leading-none">
                      {review.client?.firstName}
                    </p>
                    {review.created_at && (
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-1 font-bold">
                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;