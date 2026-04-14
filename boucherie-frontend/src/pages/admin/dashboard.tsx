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
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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
  salesData?: {
    date: string;
    total: number;
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

      {/* Graphique Ventes */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-red-700 w-6 h-6" />
          <h2 className="text-xl font-bold">Évolution des Ventes (7 Derniers Jours)</h2>
        </div>
        <div className="h-[300px] w-full">
          {data.salesData && data.salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleDateString("fr-FR", {day: "2-digit", month: "short"})} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `${val.toLocaleString()} F`} width={80} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, "Ventes"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                />
                <Area type="monotone" dataKey="total" stroke="#b91c1c" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-400">
              Aucune donnée de vente pour cette période.
            </div>
          )}
        </div>
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
