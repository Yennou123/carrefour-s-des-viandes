"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, MapPin, User as UserIcon, CreditCard, ShieldCheck, CheckCircle2, Loader2, ChevronRight, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import axios from "axios";

// 📍 Coordonnées Carrefour des Viandes
const STORE_LOCATION = { lat: 12.328778, lon: -1.550306 };

const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, cartCount, clearCart } = useCart();
  const { isAuthenticated, user, getToken } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [distance, setDistance] = useState(0);
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [loading, setLoading] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalTotal, setFinalTotal] = useState(totalPrice);

  // --- NOUVELLE FONCTION OSRM ---
  const getOSRMDistance = async (lat: number, lon: number) => {
    try {
      setCalculatingRoute(true);
      const url = `https://router.project-osrm.org/route/v1/driving/${STORE_LOCATION.lon},${STORE_LOCATION.lat};${lon},${lat}?overview=false`;
      const response = await axios.get(url);

      if (response.data?.routes?.length > 0) {
        return response.data.routes[0].distance / 1000; // Conversion mètres en km
      }
      return null;
    } catch (err) {
      console.error("Erreur OSRM:", err);
      return null;
    } finally {
      setCalculatingRoute(false);
    }
  };

  useEffect(() => {
    const updateShipping = async () => {
      if (user?.address && typeof user.address === 'object') {
        const addr = user.address as any;
        if (addr.latitude && addr.longitude) {
          // Appel API OSRM
          let dist = await getOSRMDistance(addr.latitude, addr.longitude);

          // Fallback Haversine si OSRM échoue
          if (dist === null) {
            const R = 6371;
            const dLat = (addr.latitude - STORE_LOCATION.lat) * Math.PI / 180;
            const dLon = (addr.longitude - STORE_LOCATION.lon) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(STORE_LOCATION.lat * Math.PI / 180) * Math.cos(addr.latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }

          setDistance(dist);

          let cost = Math.round(1000 + (dist * 250));
          if (deliveryMethod === "express") cost += 700;

          setShippingCost(cost);
          setFinalTotal(totalPrice + cost);
        }
      } else {
        const fallback = deliveryMethod === "express" ? 2200 : 1500;
        setShippingCost(fallback);
        setFinalTotal(totalPrice + fallback);
      }
    };

    updateShipping();
  }, [totalPrice, deliveryMethod, user]);

  useEffect(() => {
    if (cartCount === 0 && !orderPlaced) {
      router.push("/panier");
    }
  }, [cartCount, orderPlaced, router]);

  if (!isAuthenticated) return <ProtectedRoute />;
  if (cartCount === 0) return null;

  const calculateItemPrice = (item: any) => {
    const price = item.price_per_kg
      ? item.price_per_kg
      : item.price_per_unit;
    return Number(price);
  };

  const renderAddress = (address: any) => {
    if (!address) return <span className="text-stone-400 italic">Aucune adresse enregistrée dans votre profil.</span>;
    if (typeof address === "string") return <p className="font-medium text-stone-700">{address}</p>;

    const { label, street, city, zipCode, country } = address;


    return (
      <div className="text-stone-700 leading-relaxed font-medium">
        {label && <span className="text-xs uppercase tracking-widest text-red-700 font-bold block mb-1">{label}</span>}
        <p>{street}</p>
        <p>{zipCode} {city}</p>
        <p className="text-stone-400 text-sm">{country}</p>
      </div>
    );
  };

  const handlePayOnDelivery = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token || !user) throw new Error("Authentification requise.");

      const cartItems = cart.map((item: any) => ({
        productId: item.productId || item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || item.unit_type || "pièce",
        price: item.price_per_kg ?? item.price_per_unit ?? item.price ?? 0
      }));

      const response = await api.post("/orders", {
        cartItems,
        shippingDetails: {
          address: user?.address || null,
          slot: deliveryMethod
        },
        total: finalTotal,
        paymentMethod: "delivery"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderId = response.data.orderId;
      setOrderPlaced(true);
      clearCart();
      router.push(`/confirmation?orderId=${orderId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la commande.");
    } finally {
      setLoading(false);
    }
  };

  // Estimation dynamique plus réaliste (Vitesse moyenne urbaine 30km/h + temps de préparation)
  const estimatedTime = Math.round(15 + (distance * 3));


  return (
    <div className="min-h-screen bg-stone-50">
      <Head>
        <title>Finaliser ma commande | Carrefour des Viandes</title>
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Breadcrumbs / Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-black text-stone-900"
          >
            Finaliser <span className="text-red-700 italic">l&apos;achat</span>
          </motion.h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-stone-400 font-medium text-sm">
            <span>Panier</span>
            <ChevronRight size={14} />
            <span className="text-stone-900 font-bold">Paiement</span>
            <ChevronRight size={14} />
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* COLONNE GAUCHE : FORMULAIRES */}
          <div className="lg:col-span-8 space-y-8">

            {/* ETAPE 1 : CLIENT */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <UserIcon size={20} className="text-red-700" /> Informations Client
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 pl-12">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1">Nom Complet</label>
                  <p className="font-semibold text-stone-800 text-lg">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1">Email de contact</label>
                  <p className="font-semibold text-stone-800 text-lg">{user?.email}</p>
                </div>
              </div>
            </section>

            {/* ETAPE 2 : ADRESSE */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <MapPin size={20} className="text-red-700" /> Destination de livraison
                </h2>
              </div>
              <div className="pl-12">
                <div className="p-6 bg-stone-50 border border-stone-100 rounded-2xl ring-2 ring-stone-900/5">
                  {renderAddress(user?.address)}
                </div>
              </div>
            </section>

            {/* ETAPE 3 : MODE DE LIVRAISON */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><Truck size={20} className="text-red-700" /> Mode</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pl-12">
                {["standard", "express"].map((m) => (
                  <div key={m} onClick={() => setDeliveryMethod(m as any)} className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${deliveryMethod === m ? "border-red-700 bg-red-50" : "border-stone-100"}`}>
                    <p className="font-bold capitalize text-stone-900">Livraison {m}</p>
                    <p className="text-xs text-stone-500">{m === "standard" ? `${estimatedTime} min` : `${Math.round(estimatedTime*0.6)} min`}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ETAPE 4 : PAIEMENT */}
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">4</div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-red-700" /> Moyen de paiement
                </h2>
              </div>

              <div className="pl-0 md:pl-12">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-stone-900 rounded-3xl p-8 text-white relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={120} />
                  </div>
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-14 h-14 bg-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck size={30} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold italic font-serif">Paiement à la livraison</h3>
                      <p className="text-stone-400 text-sm mt-1 max-w-md">
                        Le règlement s&apos;effectue directement auprès de notre livreur par espèces ou mobile money.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <p className="mt-6 text-stone-400 text-xs text-center italic">
                  Transaction sécurisée par le protocole SSL de la boucherie.
                </p>
              </div>
            </section>
          </div>

          {/* COLONNE DROITE : RESUME (STICKY) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-stone-200">
              <h2 className="text-xl font-serif font-black mb-8 border-b border-white/10 pb-4 italic text-red-500">
                Votre Commande
              </h2>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cart.map((it: any) => (
                  <div key={it.id || it.productId} className="flex justify-between items-start text-sm group">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-200 group-hover:text-white transition-colors">
                        {it.name}
                      </span>
                      <span className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Quantité : {it.quantity}
                      </span>
                    </div>
                    <span className="font-black text-stone-100 tracking-tighter">
                      {calculateItemPrice(it).toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 group transition-all hover:bg-white/10">
                    <div className="flex flex-col">
                      <span className="text-stone-400 text-xs uppercase tracking-widest font-bold">Livraison</span>
                      <span className="text-red-400 text-[10px] font-medium flex items-center gap-1">
                        <MapPin size={10} />
                        {calculatingRoute ? (
                          <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Calcul d&apos;itinéraire...</span>
                        ) : (
                          distance > 0 ? `${distance.toFixed(1)} km (Itinéraire réel)` : "Distance calculée"
                        )}
                      </span>
                    </div>
                    <span className="font-black text-white tracking-tighter text-lg">
                      +{shippingCost.toLocaleString()} <span className="text-xs">FCFA</span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6">
                  <span className="text-stone-100 font-bold uppercase tracking-widest text-xs">Total TTC</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-red-500 tracking-tighter">
                      {finalTotal.toLocaleString()} <span className="text-sm">FCFA</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-900/50 border border-red-500 rounded-xl text-red-200 text-xs font-bold">
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handlePayOnDelivery}
                  disabled={loading || calculatingRoute}
                  className="group w-full py-5 bg-red-700 hover:bg-red-800 disabled:bg-stone-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="loader" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
                        <Loader2 className="animate-spin w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.span key="text" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                        CONFIRMER <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-50">
              <ShieldCheck size={40} className="text-stone-400" />
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter leading-tight">
                Protection des données<br />garantie par l&apos;atelier
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;