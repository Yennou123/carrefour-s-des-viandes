"use client";

import React, { useState, useEffect } from "react";
import {
    ShoppingBag,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Hash,
    Calendar,
    CreditCard,
    MapPin
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import WhatsAppOrderButton from "./WhatsAppOrderButton";
import Pagination from "../common/Pagination"; // Import du composant de pagination

const API_ORDERS_URL = "/orders/me";
const API_ORDER_DETAIL_URL = "/orders";

// --- Types ---
interface OrderSummary {
    id: number;
    createdAt: string;
    total_amount: number;
    status: string;
}

interface OrderDetail extends OrderSummary {
    order_date: string;
    order_status: string;
    shipping_address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
    };
    items: Array<{
        id: number;
        quantity: number;
        price_at_order: number;
        Product: {
            name: string;
            unit_type: "Poids" | "Pièce";
            image_url: string;

        };
    }>;
}

const OrderSettings: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Charger la liste des commandes
    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders(currentPage);
        }
    }, [isAuthenticated, currentPage]);

    const fetchOrders = async (page: number) => {
        try {
            setLoading(true);
            const response = await api.get(`${API_ORDERS_URL}?page=${page}&limit=5`);
            
            // Le backend renvoie maintenant { orders, totalCount, totalPages, currentPage }
            const { orders: fetchedOrders, totalPages: fetchedTotalPages, totalCount: fetchedTotalCount } = response.data;
            
            setOrders(fetchedOrders || []);
            setTotalPages(fetchedTotalPages || 1);
            setTotalCount(fetchedTotalCount || 0);
        } catch (err) {
            setError("Impossible de charger l'historique.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Charger le détail d'une commande
    const handleViewDetail = async (id: number) => {
        try {
            setSelectedOrderId(id);
            setDetailLoading(true);
            const response = await api.get(`${API_ORDER_DETAIL_URL}/${id}`);
            setOrderDetail(response.data);
        } catch (err) {
            setError("Erreur lors du chargement des détails.");
        } finally {
            setDetailLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return { label: 'Nouveau', color: 'text-red-700 bg-red-50 border-red-100', icon: <Clock size={14} /> };
            case 'processing': return { label: 'En cours', color: 'text-amber-700 bg-amber-50 border-amber-100', icon: <Package size={14} /> };
            case 'shipped': return { label: 'Expédié', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: <Truck size={14} /> };
            case 'delivered': return { label: 'Livré', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: <CheckCircle size={14} /> };
            case 'cancelled': return { label: 'Annulé', color: 'text-stone-500 bg-stone-50 border-stone-100', icon: <XCircle size={14} /> };
            default: return { label: status, color: 'text-stone-700 bg-stone-100 border-stone-200', icon: <Clock size={14} /> };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-red-700 animate-spin" />
            <p className="text-stone-500 font-medium italic">Récupération de vos commandes...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedOrderId ? (
                    // --- VUE LISTE ---
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg text-red-700">
                                <ShoppingBag size={20} />
                            </div>
                            <h2 className="text-xl font-serif font-black text-stone-900 italic">Historique de commandes</h2>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-stone-300">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                    <ShoppingBag size={32} />
                                </div>
                                <p className="text-stone-500 font-medium mb-6 text-lg">Vous n&apos;avez pas encore passé de commande.</p>
                                <Link href="/catalogue" className="inline-flex items-center gap-2 bg-red-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-700/20">
                                    Parcourir le catalogue
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {orders.map((order) => {
                                    const status = getStatusConfig(order.status);
                                    return (
                                        <motion.div
                                            key={order.id}
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-white p-5 rounded-[1.5rem] border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                                                    <Hash size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Commande #{order.id}</p>
                                                    <p className="font-bold text-stone-900">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 md:gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Montant Total</p>
                                                    <p className="text-lg font-black text-stone-900">{order.total_amount.toLocaleString()} <span className="text-xs">FCFA</span></p>
                                                </div>

                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-[11px] uppercase tracking-wider ${status.color}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </div>

                                                <button
                                                    onClick={() => handleViewDetail(order.id)}
                                                    className="p-3 bg-stone-900 text-white rounded-xl hover:bg-red-700 transition-colors"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    // --- VUE DÉTAIL ---
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setSelectedOrderId(null)}
                            className="flex items-center gap-2 text-stone-500 hover:text-red-700 font-bold transition-colors group mb-4"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Retour à la liste
                        </button>

                        {detailLoading ? (
                            <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center border border-stone-200">
                                <Loader2 className="animate-spin text-red-700 mb-4" />
                                <p className="font-medium text-stone-400 italic tracking-wide">Chargement des détails...</p>
                            </div>
                        ) : orderDetail && (
                            <div className="space-y-6">
                                {/* Header Détail */}
                                <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <ShoppingBag size={120} />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-serif font-black text-stone-900 italic">Commande #{orderDetail.id}</h2>
                                                <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-bold text-xs uppercase tracking-wider ${getStatusConfig(orderDetail.order_status).color}`}>
                                                    {getStatusConfig(orderDetail.order_status).icon}
                                                    {getStatusConfig(orderDetail.order_status).label}
                                                </span>
                                            </div>
                                            <p className="text-stone-500 font-medium flex items-center gap-2">
                                                <Calendar size={16} /> Passée le {new Date(orderDetail.order_date).toLocaleDateString('fr-FR', { dateStyle: 'full' })}
                                            </p>
                                        </div>
                                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 min-w-[200px] text-center md:text-right">
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Total payé</p>
                                            <p className="text-3xl font-black text-red-700">{orderDetail.total_amount.toLocaleString()} <span className="text-sm">FCFA</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-5 gap-6">
                                    {/* Articles */}
                                    <div className="md:col-span-3 space-y-4">
                                        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                                            <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                                                <Package size={18} className="text-red-700" />
                                                Articles commandés ({orderDetail.items.length})
                                            </h3>
                                            <div className="divide-y divide-stone-100">
                                                {orderDetail.items.map((item) => (
                                                    <div key={item.id} className="py-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-stone-50 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-stone-100">
                                                                <img
                                                                    src={item.Product.image_url || "/placeholder-meat.png"}
                                                                    alt={item.Product.name}
                                                                    className="w-full h-full object-cover rounded-xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-stone-900 leading-tight">{item.Product.name}</p>
                                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter mt-1">
                                                                    {item.quantity} {item.Product.unit_type === 'Poids' ? 'kg' : 'unité(s)'} × {item.price_at_order} FCFA
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="font-black text-stone-900">
                                                            {(item.quantity * item.price_at_order).toLocaleString()} <span className="text-[10px] text-stone-400">FCFA</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Livraison */}
                                        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 tracking-tight italic">
                                                <MapPin size={18} className="text-red-700" /> Adresse de livraison
                                            </h3>
                                            <div className="text-stone-600 font-medium text-sm leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                                <p className="font-black text-stone-900 uppercase text-xs mb-1 tracking-widest">Domicile</p>
                                                <p>{orderDetail.shipping_address?.street || 'N/A'}</p>
                                                <p>{orderDetail.shipping_address?.zipCode} {orderDetail.shipping_address?.city}</p>
                                                <p className="text-stone-400 mt-2">{orderDetail.shipping_address?.country}</p>
                                            </div>
                                        </div>

                                        {/* Paiement */}
                                        <div className="bg-stone-900 p-6 rounded-[2rem] text-white shadow-xl shadow-stone-900/10">
                                            <h3 className="font-bold text-white/50 mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                                                <CreditCard size={14} /> Information Paiement
                                            </h3>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-bold">Méthode</p>
                                                <p className="text-sm text-white/70 italic font-medium tracking-tight uppercase">Cash à la livraison</p>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                                <p className="text-sm font-bold">Statut</p>
                                                <p className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    Paiement à  la Livraison
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <WhatsAppOrderButton 
                                    orderId={orderDetail.id}
                                    orderDate={orderDetail.order_date}
                                    customerName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Client'}
                                    orderStatus={orderDetail.order_status}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderSettings;