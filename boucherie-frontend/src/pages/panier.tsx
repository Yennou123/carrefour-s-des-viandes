"use client";

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, CheckCircle, MapPin, ShoppingBag, ArrowRight, Loader2, Info } from "lucide-react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";

const CartPage: React.FC = () => {
  const {
    cart,
    totalPrice,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading: cartLoading,
    error,
  } = useCart();

  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Affichage du chargement
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FDFCFB]">
        <Loader2 className="w-10 h-10 text-red-800 animate-spin" />
        <p className="text-stone-500 font-medium">Chargement de votre panier...</p>
      </div>
    );
  }

  // Protection de la route
  if (!isAuthenticated || !user) {
    return <ProtectedRoute />;
  }

  // --- LOGIQUE ADRESSE (CONSERVÉE) ---
  const address = user?.address;
  const addressComplete = !!(address && address.street && address.city && address.country);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    if (!addressComplete) {
      // On envoie vers /profil avec le paramètre d'onglet pour l'adresse
      router.push("/profil?tab=address");
      return;
    }
    if (cart.length === 0) return;
    router.push("/checkout");
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <Head>
        <title>Mon Panier | La Boucherie</title>
      </Head>

      {/* --- HEADER --- */}
      <div className="bg-stone-900 text-white py-12 mb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <ShoppingBag size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">Ma Sélection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold italic">Votre Panier</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* --- COLONNE GAUCHE : ARTICLES --- */}
          <div className="lg:col-span-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
                <span className="shrink-0"><Info size={20} /></span> {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-4">Votre panier est vide</h3>
                <p className="text-stone-500 mb-8 max-w-xs mx-auto">
                  Il semblerait que vous n&apos;ayez pas encore ajouté de délicieuses pièces à votre panier.
                </p>
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-2 bg-red-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-900 transition-all shadow-lg active:scale-95"
                >
                  Découvrir nos produits <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <h2 className="text-xl font-bold text-stone-900">{cartCount} Produit(s)</h2>
                  <button onClick={clearCart} className="text-sm font-bold text-stone-400 hover:text-red-800 transition uppercase tracking-tighter flex items-center gap-1">
                    <Trash2 size={14} /> Vider le panier
                  </button>
                </div>

                {cart.map((item) => {
                  const unitPrice = item.unitType === "Poids" ? item.price_per_kg ?? 0 : item.price_per_unit ?? 0;
                  return (
                    <div key={item.id} className="group bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-md">
                      <div className="w-24 h-24 bg-stone-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        🥩
                      </div>

                      <div className="flex-grow text-center sm:text-left">
                        <h3 className="text-lg font-bold text-stone-900 mb-1">{item.name}</h3>
                        <p className="text-stone-400 text-sm font-medium italic">
                          {unitPrice.toLocaleString()} FCFA / {item.unitType === "Poids" ? "kg" : "pièce"}
                        </p>
                      </div>

                      <div className="flex items-center bg-stone-50 rounded-xl p-1 border border-stone-100">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - (item.unitType === "Poids" ? 0.5 : 1))}
                          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-800 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + (item.unitType === "Poids" ? 0.5 : 1))}
                          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-800 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="w-32 text-right">
                        <p className="text-xl font-bold text-red-800">
                          {(unitPrice * item.quantity).toLocaleString()} <span className="text-xs">FCFA</span>
                        </p>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-stone-300 hover:text-red-600 transition">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* --- COLONNE DROITE : RÉSUMÉ --- */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Résumé</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-stone-500 font-medium">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-stone-500 font-medium">
                  <span>Livraison</span>
                  <span className="text-emerald-600 font-bold uppercase text-xs">Calculée à l&apos;étape suivante</span>
                </div>
                <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
                  <span className="text-stone-900 font-bold uppercase text-sm tracking-widest">Total TTC</span>
                  <span className="text-3xl font-black text-red-800 tracking-tighter">{totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* --- ÉTAPES DE VALIDATION (ADRESSE CONSERVÉE) --- */}
              <div className="space-y-3 mb-8 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${isAuthenticated ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-400'}`}>
                    <CheckCircle size={16} />
                  </div>
                  <span className={`text-sm font-bold ${isAuthenticated ? 'text-stone-800' : 'text-stone-400'}`}>Compte connecté</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-1 mt-0.5 rounded-full ${addressComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {addressComplete ? <CheckCircle size={16} /> : <MapPin size={16} />}
                  </div>
                  <div className="flex-grow">
                    <span className={`text-sm font-bold ${addressComplete ? 'text-stone-800' : 'text-stone-400'}`}>Adresse de livraison</span>
                    {isAuthenticated && (
                      <div className="mt-2 text-xs">
                        {addressComplete ? (
                          <div className="text-stone-500 leading-relaxed italic">
                            {address.street}, {address.city}
                            <Link href="/profil?tab=address" className="block text-red-800 font-bold mt-1 hover:underline underline-offset-2">Modifier l&apos;adresse</Link>
                          </div>
                        ) : (
                          <Link href="/profil?tab=address" className="text-red-700 font-black hover:underline underline-offset-2">Ajouter mon adresse obligatoirement</Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={cart.length === 0 || !isAuthenticated || !addressComplete}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-red-800 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-stone-200 active:scale-95 disabled:opacity-50 disabled:bg-stone-300 disabled:shadow-none"
              >
                Passer la commande
                <ArrowRight size={20} />
              </button>

              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Paiement sécurisé
                </div>
                <p className="text-[10px] text-stone-400 text-center italic">
                  Toute commande est soumise à nos conditions générales de vente.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;