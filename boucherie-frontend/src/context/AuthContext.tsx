"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/router"; // M5: Pages Router → next/router (pas next/navigation)

/* TYPES */
interface Address {
  id: number;
  label?: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  is_default: boolean;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "admin";
  phone: string;
  address?: Address | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  getToken: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserAddress: (newAddress: Address | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchUser = async (token: string) => {
    try {
      setLoading(true);
      const userRes = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let address = null;
      try {
        const addrRes = await api.get("/address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        address = addrRes.data;
      } catch {
        // Pas d'adresse encore renseignée — silencieux
      }

      const fetchedUser = { ...userRes.data, address };
      setUser(fetchedUser);
      setIsAuthenticated(true);

      // M5: Utilisation de router.pathname (Pages Router)
      const currentPath = router.pathname;
      if (currentPath === "/connexion" || currentPath === "/register") {
        router.replace(fetchedUser.role === "admin" ? "/admin/dashboard" : "/");
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) fetchUser(token);
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.accessToken;
      localStorage.setItem("token", token);
      await fetchUser(token);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || "Identifiants invalides.";
      throw new Error(message);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/google", { credential });
      const token = res.data.accessToken;
      localStorage.setItem("token", token);
      await fetchUser(token);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || "Échec de l'authentification Google.";
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    try {
      await api.post("/auth/register", { email, password, firstName, lastName, phone });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur inscription.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    if (typeof window !== "undefined" && !window.location.pathname.includes("/connexion")) {
      router.replace("/connexion");
    }
  };

  const updateUserAddress = (newAddress: Address | null) => {
    if (user) setUser({ ...user, address: newAddress });
  };

  const refreshUserData = async () => {
    const token = getToken();
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      getToken, 
      login, 
      loginWithGoogle,
      register, 
      logout, 
      refreshUserData, 
      updateUserAddress, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
};