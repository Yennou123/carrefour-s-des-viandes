import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Settings, PanelLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import api from "@/lib/axios";
import { useSearch } from "@/context/SearchContext";

export default function HeaderAdmin({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  const { logout, getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Récupération du contexte ici
  const { searchQuery, setSearchQuery } = useSearch();

  const fetchUnreadCount = async () => {
    try {
      const token = getToken();
      const res = await api.get(
        "/admin/notifications/unread/count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnreadCount(res.data.unread);
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Header
      toggleSidebar={onToggle}
      logout={logout}
      unreadCount={unreadCount}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}

const Header = ({
  toggleSidebar,
  unreadCount,
  searchQuery,
  setSearchQuery,
}: {
  toggleSidebar: () => void;
  logout: () => void;
  unreadCount: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => (
  <header className="w-full bg-white shadow-md p-4 flex items-center justify-between fixed top-0 left-0 z-50">

    {/* Left */}
    <div className="flex items-center gap-4">
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm transition"
      >
        <PanelLeft className="w-6 h-6 text-primary-red" />
      </button>

      <Link
        href="/admin/dashboard"
        className="text-xl font-bold text-primary-red font-title"
      >
        Admin Dashboard
      </Link>
    </div>

    {/* Center - Search */}
    <div className="hidden md:flex w-1/3 items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm">
      <Search className="w-5 h-5 text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent outline-none text-sm"
        autoComplete="off"
      />
    </div>

    {/* Right */}
    <div className="flex items-center gap-6">

      {/* Notifications */}
      <Link
        href="/admin/notifications"
        className="relative hover:opacity-80 transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-700 text-white text-xs font-semibold rounded-full px-2 py-[2px] shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Profile */}
      <div >
        {/* Profile Icon */}
        <Link
          href="/admin/profile"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Settings className="w-5 h-5 text-gray-700"  />
        </Link>
      </div>
    </div>
  </header>
);