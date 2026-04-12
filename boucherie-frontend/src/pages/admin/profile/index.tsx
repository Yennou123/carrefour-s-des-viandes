import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const AdminProfilePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <ProtectedRoute />;
  }

  const { email, firstName, lastName, role } = user;

  return (
    <AdminRoute>
      <Head>
        <title>Profil Administrateur | La Boucherie</title>
      </Head>

      <div className="my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <motion.h1
          className="text-4xl font-extrabold text-primary-red text-center mb-12 font-title tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Espace Administrateur
        </motion.h1>

        <div>

          {/* 🔹 CONTENU ADMIN */}
          <motion.section
            className="md:col-span-2 bg-white p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* INFOS ADMIN */}
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-7 h-7 text-primary-red" />
              <h2 className="text-2xl font-bold text-gray-800">
                Informations Administrateur
              </h2>
            </div>

            <div className="space-y-6">

              <motion.div
                className="p-5 bg-gray-50 rounded-xl shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="text-lg font-semibold text-gray-800">
                  {firstName} {lastName}
                </p>
              </motion.div>

              <motion.div
                className="p-5 bg-gray-50 rounded-xl shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500">Adresse email</p>
                <p className="text-lg font-semibold text-gray-800">
                  {email}
                </p>
              </motion.div>

              <motion.div
                className="p-5 bg-gray-50 rounded-xl shadow-sm flex items-center justify-between"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm text-gray-500">Rôle système</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {role}
                  </p>
                </div>

                <span className="px-4 py-1 rounded-full bg-primary-red text-white text-sm font-bold">
                  Administrateur
                </span>
              </motion.div>
            </div>

          </motion.section>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminProfilePage;