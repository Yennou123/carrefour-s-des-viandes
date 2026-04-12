import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ⚙️ Instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   REQUEST INTERCEPTOR
================================ */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // SSR guard — localStorage n'existe pas côté serveur
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR
================================ */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "";

      // M1: SSR guard — window n'existe pas côté serveur
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      const isLoginPage = window.location.pathname === "/connexion";

      // 1. 🔒 COMPTE BLOQUÉ (403 spécifique)
      if (status === 403 && message.toLowerCase().includes("bloqué")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!isLoginPage) {
          alert("Votre compte a été suspendu. Contactez le support.");
          window.location.href = "/connexion";
        }
      }

      // 2. 🔑 TOKEN EXPIRÉ / INVALIDE (401)
      if (status === 401 && !isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/connexion?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;