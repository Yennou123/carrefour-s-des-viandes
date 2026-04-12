"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import api from "@/lib/axios";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";


export default function NotificationsPage() {
    const { data: notifications = [], mutate } = useSmartRefresh<any[]>("/admin/notifications");

    const markAsRead = async (id: number) => {
        await api.put(
            `/admin/notifications/${id}/read`,
            {}, // body vide
        );
        mutate();
    };

    return (
        <AdminRoute>
            <div className="p-8 ">
                <h1 className="text-2xl font-bold mb-6">Notifications</h1>

                <div className="space-y-4">
                    {notifications.map((notif: any) => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-lg shadow ${notif.isRead ? "bg-gray-100" : "bg-white border-l-4 border-primary-red"
                                }`}
                        >
                            <h3 className="font-semibold">{notif.title}</h3>
                            <p className="text-sm text-gray-600">{notif.message}</p>

                            {!notif.isRead && (
                                <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="text-primary-red text-sm mt-2"
                                >
                                    Marquer comme lue
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminRoute>
    );
}