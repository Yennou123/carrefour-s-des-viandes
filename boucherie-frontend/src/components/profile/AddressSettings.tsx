"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Save, Navigation2, Loader2, Home, CheckCircle2, AlertCircle, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const STORE_LOCATION = { lat: 12.328778, lng: -1.550306 };

const MapWithNoSSR = dynamic(() => import("@/components/AddressMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">Chargement de la carte...</div>
});

const API_URL = "/address";

const AddressSettings: React.FC = () => {
  const { isAuthenticated, updateUserAddress } = useAuth();

  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Burkina Faso");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Recherche d'adresse
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 1. Charger l'adresse initiale
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await api.get(API_URL);
        const addr = res.data;
        if (addr) {
          setLabel(addr.label || "");
          setStreet(addr.street || "");
          setCity(addr.city || "");
          setZipCode(addr.zipCode || "");
          setCountry(addr.country || "Burkina Faso");
          if (addr.latitude && addr.longitude) {
            setPosition({ lat: addr.latitude, lng: addr.longitude });
          }
        }
      } catch (err) {
        console.warn("Aucune adresse enregistrée");
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [isAuthenticated]);

  // 2. Geocodage inverse (Debounced)
  useEffect(() => {
    if (!position) return;

    const updateFieldsFromCoords = async () => {
      try {
        const res = await api.get(`${API_URL}/reverse-geocode`, { 
          params: { lat: position.lat, lon: position.lng } 
        });
        const addr = res.data;
        
        if (addr) {
          setStreet(addr.street || "");
          setCity(addr.city || "");
          setZipCode(addr.zipCode || "");
        }
      } catch (err) {
        console.error("Erreur de géocodage inverse");
      }
    };

    const delayDebounceFn = setTimeout(updateFieldsFromCoords, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [position?.lat, position?.lng]);

  // 3. Recherche de lieu (Nominatim)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: searchTerm,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "bf", // Ciblage Burkina Faso par défaut
        },
        headers: { "User-Agent": "E-BoucherieApp/1.0" }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("Erreur de recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setPosition(coords);
    setShowResults(false);
    setSearchTerm(result.display_name);
  };

  // 4. Géolocalisation améliorée
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur");
        return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Impossible de récupérer votre position précise. Vérifiez vos autorisations GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.put(API_URL, {
        label, street, city, zipCode, country,
        latitude: position?.lat,
        longitude: position?.lng,
      });
      
      if (res.data.address) {
        updateUserAddress(res.data.address);
      }

      setSuccess("Votre adresse de livraison a été mise à jour.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l’enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="w-8 h-8 text-red-700 animate-spin" />
      <p className="text-stone-500 font-medium">Récupération de vos coordonnées...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-stone-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-700" />
            </div>
            <h2 className="text-xl font-serif font-black text-stone-900 italic">Adresse de Livraison</h2>
          </div>
          
          <button
            type="button"
            disabled={isLocating}
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation2 className="w-3 h-3" />}
            {isLocating ? "Localisation..." : "Ma position actuelle"}
          </button>
        </div>

        {/* --- BARRE DE RECHERCHE MAPS --- */}
        <div className="relative mb-6">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Rechercher un quartier, une rue, un lieu (ex: Pissy, Ouaga...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full pl-12 pr-12 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium shadow-sm group-hover:border-stone-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-red-700 transition-colors" size={20} />
            {searchTerm && (
               <button 
                type="button" 
                onClick={() => {setSearchTerm(""); setShowResults(false);}}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full transition-colors"
               >
                 <X size={16} className="text-stone-400" />
               </button>
            )}
          </form>

          <AnimatePresence>
            {showResults && (searchTerm || isSearching) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="p-6 text-center text-stone-400 italic flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-red-700" size={24} />
                    Exploration de la carte...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {searchResults.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => selectResult(res)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-stone-50 text-left transition-colors"
                      >
                        <MapPin size={18} className="text-red-700 mt-1 shrink-0" />
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{res.display_name.split(',')[0]}</p>
                          <p className="text-xs text-stone-400 line-clamp-1">{res.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm.length > 2 && (
                  <div className="p-6 text-center text-stone-400 text-sm">
                    Aucun lieu trouvé pour &quot;{searchTerm}&quot;
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative h-96 w-full rounded-[1.5rem] overflow-hidden mb-10 border border-stone-200 z-0 group shadow-inner">
          <MapWithNoSSR 
            position={position} 
            setPosition={setPosition} 
            storePosition={STORE_LOCATION} 
          />
          <div className="absolute bottom-4 left-4 bg-stone-900 text-white px-4 py-2 rounded-full border border-white/10 shadow-xl pointer-events-none flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <p className="text-[10px] font-bold uppercase tracking-widest">Calcul d&apos;itinéraire en temps réel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid md:grid-cols-2 gap-6">
             <div className="md:col-span-2 space-y-1">
               <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Home size={12} /> Label de l&apos;adresse
               </label>
               <input
                 type="text"
                 placeholder="Ex: Ma Maison, Bureau..."
                 value={label}
                 onChange={(e) => setLabel(e.target.value)}
                 className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
               />
             </div>

             <div className="md:col-span-2 space-y-1">
               <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Rue / Avenue (Auto-rempli par la Map)</label>
               <input
                 type="text"
                 value={street}
                 onChange={(e) => setStreet(e.target.value)}
                 className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
                 required
               />
             </div>

             <div className="space-y-1">
               <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Ville</label>
               <input
                 type="text"
                 value={city}
                 onChange={(e) => setCity(e.target.value)}
                 className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
                 required
               />
             </div>

             <div className="space-y-1">
               <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Code Postal / ZIP</label>
               <input
                 type="text"
                 value={zipCode}
                 onChange={(e) => setZipCode(e.target.value)}
                 className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all font-medium"
                 required
               />
             </div>
           </div>

           {error && (
             <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
               <AlertCircle size={20} />
               <p className="text-sm font-bold">{error}</p>
             </div>
           )}

           {success && (
             <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
               <CheckCircle2 size={20} />
               <p className="text-sm font-bold">{success}</p>
             </div>
           )}

           <div className="pt-4">
             <button
               type="submit"
               disabled={isSaving}
               className="group flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 disabled:opacity-50 active:scale-95"
             >
               {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5 text-red-500" />}
               {isSaving ? "Synchronisation..." : "Enregistrer cette adresse"}
             </button>
           </div>
          </form>
      </div>
    </motion.div>
  );
};
export default AddressSettings;
