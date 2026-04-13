"use client";

import React, { useState, useEffect } from 'react';
import SEO from "@/components/SEO";
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import { GoogleLogin } from '@react-oauth/google';

const ConnexionPage: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const isExpired = searchParams.get('expired') === 'true';

    const { mutate } = useSWRConfig();
    const { user: authUser, login, register, loginWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isExpired) {
            setError("Votre session a expiré. Veuillez vous reconnecter.");
        }
    }, [isExpired]);

    useEffect(() => {
        if (authUser && !isSubmitting) {
            if (authUser.role === 'admin') router.push('/admin/dashboard');
            else router.push('/');
        }
    }, [authUser, router, isSubmitting]);

    const validatePassword = (pwd: string) => {
        const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,}$/;
        return pwdRegex.test(pwd);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            if (isLoginMode) {
                await login(email, password);
                mutate('/auth/me');
                setSuccess('Ravi de vous revoir !');
            } else {
                if (!validatePassword(password)) {
                    setIsSubmitting(false);
                    return setError(
                        "Sécurité : 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial."
                    );
                }
                await register(email, password, firstName, lastName, phone);
                setSuccess("Bienvenue ! Votre compte a été créé avec succès.");
                setTimeout(() => setIsLoginMode(true), 2000);
            }
        } catch (err: any) {
            // C10: Blocs catch corrigés — affichage du vrai message d'erreur
            const message = err?.message || "Une erreur est survenue. Veuillez réessayer.";
            setError(message);
            setPassword('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-10">
            <SEO 
                title={isLoginMode ? 'Connexion' : 'Inscription'} 
                description="Accédez à votre espace Carrefour'S des Viandes pour gérer vos commandes et vos préférences."
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]"
            >
                {/* --- Partie Gauche : Image & Branding --- */}
                <div className="md:w-1/2 relative hidden md:block overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2070&auto=format&fit=crop"
                        alt="Boucherie Artisanale"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-4xl font-serif font-black mb-4 italic">L&apos;excellence au bout des doigts.</h2>
                            <p className="text-stone-300 font-medium">Rejoignez notre communauté de passionnés du goût et profitez d&apos;offres exclusives.</p>
                        </motion.div>
                    </div>
                </div>

                {/* --- Partie Droite : Formulaire --- */}
                <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-stone-900 font-serif leading-tight">
                            {isLoginMode ? 'Bon retour parmi nous' : 'Devenir client privilégié'}
                        </h1>
                        <p className="text-stone-500 mt-2 font-medium">
                            {isLoginMode ? 'Veuillez saisir vos identifiants' : 'Inscrivez-vous en moins de 2 minutes'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLoginMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <User className="absolute left-3 top-[38px] text-stone-400 w-5 h-5" />
                                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 block ml-1">Prénom</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-red-700 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 block ml-1">Nom</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-red-700 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-[38px] text-stone-400 w-5 h-5" />
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 block ml-1">Téléphone</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            placeholder="06 00 00 00"
                                            className="w-full pl-10 pr-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-red-700 transition-all outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail className="absolute left-3 top-[38px] text-stone-400 w-5 h-5" />
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 block ml-1">Adresse Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="nom@exemple.com"
                                className="w-full pl-10 pr-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-red-700 transition-all outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-[38px] text-stone-400 w-5 h-5" />
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1 block ml-1">Mot de Passe</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-red-700 transition-all outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[35px] text-stone-400 hover:text-red-700 transition-colors"
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>

                        {/* C10: Messages d'erreur/succès correctement rendus */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 text-xs font-bold rounded-xl border-l-4 ${
                                    isExpired
                                        ? "text-amber-700 bg-amber-50 border-amber-700"
                                        : "text-red-700 bg-red-50 border-red-700"
                                }`}
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 text-xs font-bold text-green-700 bg-green-50 rounded-xl border-l-4 border-green-700"
                            >
                                {success}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-700 text-white py-4 rounded-2xl shadow-xl shadow-red-700/20 text-sm font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    {isLoginMode ? 'Connexion' : "Rejoindre la boucherie"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-stone-200"></div>
                        <span className="text-stone-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Ou avec</span>
                        <div className="flex-1 h-[1px] bg-stone-200"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                if (credentialResponse.credential) {
                                    loginWithGoogle(credentialResponse.credential);
                                }
                            }}
                            onError={() => {
                                setError("L'authentification Google a échoué.");
                            }}
                            useOneTap
                            theme="outline"
                            shape="pill"
                            size="large"
                            width="250"
                        />
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-stone-400 text-sm font-medium">
                            {isLoginMode ? "Nouveau chez nous ?" : "Déjà membre de notre sélection ?"}
                        </p>
                        <button
                            onClick={toggleMode}
                            className="mt-2 text-red-700 font-black text-sm uppercase tracking-widest hover:text-red-800 transition-colors flex items-center gap-2 mx-auto"
                        >
                            {isLoginMode ? "Créer votre compte artisan" : "Se connecter à mon espace"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConnexionPage;