
// ==============================
// src/components/admin/AdminLayout.tsx
// ==============================
import React, { ReactNode } from 'react';
import Head from 'next/head';
import AdminRoute from '@/components/AdminRoute';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    return (
        <AdminRoute>
            <Head>
                <title>{title} | Administration Boucherie</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />

                <div className="ml-64 flex-grow overflow-auto">
                    <AdminHeader />

                    <div className="p-8">
                        <header className="mb-8 border-b pb-4">
                            <h1 className="text-3xl font-bold text-primary-red font-title">{title}</h1>
                        </header>
                        <main>
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
};

export default AdminLayout;
