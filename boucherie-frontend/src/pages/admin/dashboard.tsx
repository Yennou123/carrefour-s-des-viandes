"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import {
  ShoppingBag,
  Users,
  Package,
  Star,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const API_ADMIN_DASHBOARD_URL = "/admin/dashboard"; // relative, baseURL gérée par api

/* ✅ CONTRAT ALIGNÉ BACKEND */
interface AdminDashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingTickets: number;
  reviews: {
    total: number;
    pending: number;
  };
  recentOrders: {
    id: number;
    total_amount: number;
    status: string;
    client: {
      firstName: string;
      lastName: string;
    };
  }[];
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useSmartRefresh<AdminDashboardData>(API_ADMIN_DASHBOARD_URL);

  const Card = ({
    title,
    value,
    icon: Icon,
    link,
  }: {
    title: string;
    value: number;
    icon: any;
    link: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <Icon className="w-6 h-6 text-red-600" />
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <Link
        href={link}
        className="text-sm text-red-600 hover:underline mt-2 inline-block"
      >
        Voir →
      </Link>
    </div>
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <div className="py-20 text-center">Chargement…</div>;
  if (error) return <div className="py-20 text-center text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <AdminRoute>
      <p className="mb-8 text-lg">
        Bienvenue <strong>{user?.firstName}</strong>
      </p>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card
          title="Commandes"
          value={data.totalOrders}
          icon={ShoppingBag}
          link="/admin/orders"
        />
        <Card
          title="Produits"
          value={data.totalProducts}
          icon={Package}
          link="/admin/products"
        />
        <Card
          title="Clients"
          value={data.totalUsers}
          icon={Users}
          link="/admin/clients"
        />
        <Card
          title="Tickets"
          value={data.pendingTickets}
          icon={MessageSquare}
          link="/admin/tickets"
        />
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card
          title="Avis totaux"
          value={data.reviews.total}
          icon={Star}
          link="/admin/reviews"
        />
        <Card
          title="Avis en attente"
          value={data.reviews.pending}
          icon={Star}
          link="/admin/reviews?status=pending"
        />
      </div>

      {/* Dernières commandes */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Dernières commandes</h2>

        {data.recentOrders?.length === 0 ? (
          <p>Aucune commande récente</p>
        ) : (
          <div className="space-y-3">
            {data.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between items-center border p-4 rounded"
              >
                <div>
                  <p className="font-semibold">Commande #{o.id}</p>
                  <p className="text-sm text-gray-500">
                    {o.client.firstName} {o.client.lastName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    {Number(o.total_amount)} FCFA
                  </p>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${statusColor(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>

                <Link
                  href={`/admin/orders/${o.id}`}
                  className="ml-4 text-red-600"
                >
                  <ArrowRight />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
};

export default AdminDashboardPage;
