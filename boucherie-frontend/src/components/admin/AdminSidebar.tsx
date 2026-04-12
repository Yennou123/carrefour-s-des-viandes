import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, ShoppingBag, Box, Users, Star, MessageSquare, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Produits', href: '/admin/products', icon: Box },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Avis', href: '/admin/reviews', icon: Star },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { name: 'Support', href: '/admin/tickets', icon: MessageSquare },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const { logout } = useAuth();

    const sidebarClass = isOpen
        ? 'translate-x-0'
        : '-translate-x-full';

    return (
        <>
            {/* Overlay mobile */}
            <div
                className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            <div className={`fixed top-0 left-0 h-screen w-64 bg-white text-gray-800 pt-20 flex flex-col z-40 transform transition-transform duration-300 ${sidebarClass}`}>
                {/* Logo */}
                <div className="p-4 text-center border-b border-gray-200 mb-6">
                    <Link href="/admin/dashboard" className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-extrabold text-red-700 font-title tracking-tight">
                            La Boucherie
                        </span>
                        <span className="text-accent-gold text-xl font-semibold">🥩</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-grow">
                    <ul className="space-y-2 px-4">
                        {navItems.map((item) => {
                            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href);
                            return (
                                <li key={item.name}>
                                    <Link href={item.href} legacyBehavior>
                                        <a
                                            className={`flex items-center space-x-3 p-3 rounded-lg transition duration-150 ${
                                                isActive
                                                    ? 'bg-red-700 text-accent-gold shadow'
                                                    : 'hover:bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </a>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => { logout() }}
                        className="flex items-center space-x-3 p-3 w-full rounded-lg text-gray-800 hover:bg-gray-100 transition duration-150"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
