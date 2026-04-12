"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import Image from "next/image";

import {
    ShoppingCart,
    User,
    LogOut,
    Search,
    Menu,
    X,
    Package,
    Headset,
    Phone
} from "lucide-react";

interface HeaderProps {
    onSearch?: (query: string) => void;
}

const promoMessages = [
    "🥩 Offre spéciale : -10% sur tout le boeuf !",
    "🚚 Livraison gratuite dès 50€ d'achat",
    "✨ Saucisses artisanales : Nouvelle recette disponible !",
];

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartCount } = useCart();
    const { searchQuery, setSearchQuery } = useSearch();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [promoIndex, setPromoIndex] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);

    // Détection du scroll pour changer l'apparence
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPromoIndex((prev) => (prev + 1) % promoMessages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-xl" : "shadow-md"}`}>
            {/* --- BARRE PRINCIPALE --- */}
            <div className={`bg-white transition-all duration-300 ${scrolled ? "py-2" : "py-4 md:py-6"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">

                        {/* LOGO */}
                        <Link href="/" className="group flex items-center space-x-2 md:space-x-3 outline-none shrink-0">
                            <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                                <Image
                                    src="/logo-carrefour.png"
                                    alt="Le Carrefour'S Des Viandes"
                                    width={80}
                                    height={80}
                                    className="object-contain drop-shadow-sm" 
                                    priority
                                />
                            </div>
                            <span className="text-lg md:text-xl lg:text-2xl font-serif font-black tracking-tighter text-stone-900 leading-none flex flex-col">
                                <span>CARREFOUR&apos;S</span>
                                <span className="text-red-700 text-[10px] md:text-xs lg:text-sm font-sans tracking-[0.2em] md:tracking-[0.3em] uppercase">des Viandes</span>
                            </span>
                        </Link>

                        {/* NAVIGATION DESKTOP */}
                        <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
                            {[
                                { href: "/catalogue", label: "Catalogue" },
                                { href: "/support", label: "Aide", icon: <Headset className="w-4 h-4" /> },
                                { href: "/contact", label: "Contact", icon: <Phone className="w-4 h-4" /> },
                            ].map(({ href, label, icon }) => (
                                <Link key={href} href={href} className="relative group text-sm font-bold text-stone-600 hover:text-red-800 transition flex items-center gap-2">
                                    {icon}
                                    {label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-800 transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </nav>

                        {/* OUTILS ET COMPTE */}
                        <div className="flex items-center space-x-3 md:space-x-6">

                            {/* RECHERCHE DESKTOP */}
                            <div className="hidden md:flex items-center bg-stone-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-red-800/20 focus-within:bg-white border border-transparent focus-within:border-stone-200 transition-all">
                                <Search className="w-4 h-4 text-stone-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Une envie de bœuf ?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent outline-none text-sm w-32 lg:w-44 font-medium"
                                />
                            </div>

                            {/* PANIER */}
                            <Link href="/panier" className="relative p-2 hover:bg-stone-100 rounded-full transition group">
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-stone-800 group-hover:text-red-800 transition-colors" />
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-0 right-0 bg-red-700 text-white text-[9px] md:text-[10px] font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center border-2 border-white shadow-sm"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </Link>

                            {/* USER MENU */}
                            {isAuthenticated ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 md:pl-3 md:pr-1 rounded-full border border-stone-200 hover:border-stone-400 transition"
                                    >
                                        <span className="text-xs font-bold text-stone-700 hidden lg:block">Mon Espace</span>
                                        <div className="w-8 h-8 md:w-9 md:h-9 bg-stone-900 rounded-full flex items-center justify-center text-white">
                                            <User size={18} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-white border border-stone-100 rounded-2xl shadow-2xl p-2 z-[60]"
                                            >
                                                <div className="px-4 py-3 border-b border-stone-50 mb-2">
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Connecté en tant que</p>
                                                    <p className="text-sm font-bold text-stone-900 truncate">{user?.firstName || "Client Privilège"}</p>
                                                </div>
                                                <Link href="/profil" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-xl transition">
                                                    <User size={16} /> Profil
                                                </Link>
                                                <button
                                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                                    className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition border-t border-stone-50"
                                                >
                                                    <LogOut size={16} /> Déconnexion
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/connexion"
                                    className="bg-stone-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-red-800 transition-colors shadow-lg shadow-stone-200 shrink-0"
                                >
                                    Connexion
                                </Link>
                            )}

                            {/* MOBILE TOGGLE */}
                            <button
                                onClick={() => setMenuOpen(true)}
                                className="lg:hidden p-2 text-stone-900"
                            >
                                <Menu size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DRAWER MOBILE --- */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-[101] lg:hidden flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-stone-100">
                                <span className="text-xl font-serif font-black italic tracking-tighter">Menu</span>
                                <button onClick={() => setMenuOpen(false)} className="p-2 bg-stone-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                                {/* Search in Mobile Menu */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Rechercher</p>
                                    <div className="flex items-center bg-stone-100 rounded-2xl px-4 py-3">
                                        <Search className="w-5 h-5 text-stone-400 mr-3" />
                                        <input
                                            type="text"
                                            placeholder="Une envie de bœuf ?"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-transparent outline-none text-base w-full font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <nav className="space-y-4">
                                    {[
                                        { href: "/catalogue", label: "Le Catalogue", icon: <Package size={20} /> },
                                        { href: "/support", label: "Aide & Support", icon: <Headset size={20} /> },
                                        { href: "/contact", label: "Contact", icon: <Phone size={20} /> },
                                    ].map(({ href, label, icon }) => (
                                        <Link 
                                            key={href} 
                                            href={href} 
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition"
                                        >
                                            <div className="text-red-800">{icon}</div>
                                            <span className="font-bold text-stone-900">{label}</span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Help Banner short */}
                            <div className="p-6 bg-red-950 text-white rounded-t-[2rem]">
                                <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-widest">Besoin d&apos;aide ?</p>
                                <p className="text-sm font-medium opacity-80 mb-4 italic">Nos bouchers sont à votre écoute au :</p>
                                <a href="tel:+22675551410" className="text-xl font-bold flex items-center gap-2">
                                    <Phone size={18} /> +226 75 55 14 10
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;