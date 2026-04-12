
// ==============================
// src/components/admin/AdminLayout.tsx
// ==============================
import React, { ReactNode } from 'react';
import Head from 'next/head';
import AdminRoute from '@/components/AdminRoute';
import AdminSidebar from "./AdminSidebar";
import HeaderAdmin from './AdminHeader';

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setSidebarOpen(true);
        }
    }, []);

    return (
        <AdminRoute>
            <Head>
                <title>{title} | Administration Boucherie</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <AdminSidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                />

                <div className={`flex-grow flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                    <HeaderAdmin 
                        isOpen={sidebarOpen} 
                        onToggle={() => setSidebarOpen(!sidebarOpen)} 
                    />

                    <div className="p-4 md:p-8 pt-24 overflow-auto h-full">
                        <header className="mb-8 border-b pb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-red-700 font-serif">{title}</h1>
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
