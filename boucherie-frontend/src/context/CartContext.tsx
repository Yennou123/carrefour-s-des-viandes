import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { useAuth } from "./AuthContext";

// --- Types ---
export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price_per_unit?: number;
  price_per_kg?: number;
  unitType: "Poids" | "Pièce";
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  addToCart: (
    productId: number,
    name: string,
    price_per_unit: number | undefined,
    price_per_kg: number | undefined,
    unitType: "Poids" | "Pièce",
    quantity: number
  ) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCartFromBackend: () => Promise<void>;
}

// --- Context ---
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider ---
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // --- Met à jour les stats du panier ---
  const updateCartStats = (items: CartItem[]) => {
    const totalItems = items.length;
    const totalCost = items.reduce((sum, item) => {
      const price =
        item.unitType === "Poids"
          ? item.price_per_kg ?? 0
          : item.price_per_unit ?? 0;
      return sum + price * item.quantity;
    }, 0);

    setCartCount(totalItems);
    setTotalPrice(totalCost);
  };

  // --- Charge le panier depuis le backend ---
  const loadCartFromBackend = async () => {
    if (!isAuthenticated) {
      setCart([]);
      setCartCount(0);
      setTotalPrice(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/cart");
      const items = res.data?.items || [];
      setCart(items);
      updateCartStats(items);
    } catch (err) {
      console.error("Erreur de chargement du panier :", err);
      setError("Impossible de charger le panier.");
      setCart([]);
      setCartCount(0);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  };

  // --- Ajout d’un produit ---
  const addToCart = async (
    productId: number,
    name: string,
    price_per_unit: number | undefined,
    price_per_kg: number | undefined,
    unitType: "Poids" | "Pièce",
    quantity: number
  ) => {
    if (!isAuthenticated) {
      setError("Connectez-vous pour ajouter un article au panier.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/cart", {
        productId,
        quantity,
        unitType,
      });

      const items = res.data?.items || [];
      setCart(items);
      updateCartStats(items);
    } catch (err) {
      console.error("Erreur ajout panier :", err);
      setError("Impossible d’ajouter au panier.");
    } finally {
      setLoading(false);
    }
  };

  // --- Mise à jour de la quantité ---
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.put(`/cart/update/${productId}`, { quantity });
      await loadCartFromBackend();
    } catch (err) {
      console.error("Erreur maj panier :", err);
      setError("Erreur lors de la mise à jour de la quantité.");
    } finally {
      setLoading(false);
    }
  };

  // --- Suppression d’un produit ---
  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/cart/remove/${productId}`);
      await loadCartFromBackend();
    } catch (err) {
      console.error("Erreur suppression produit :", err);
      setError("Erreur lors de la suppression du produit.");
    } finally {
      setLoading(false);
    }
  };

  // --- Vider le panier ---
  const clearCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete("/cart/clear");
      setCart([]);
      setCartCount(0);
      setTotalPrice(0);
    } catch (err) {
      console.error("Erreur vidage panier :", err);
      setError("Erreur lors du vidage du panier.");
    } finally {
      setLoading(false);
    }
  };

  // --- Reset panier lors du logout ---
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      setCartCount(0);
      setTotalPrice(0);
    }
  }, [isAuthenticated]);

  // --- Auto-chargement du panier ---
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromBackend();
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCartFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --- Hook personnalisé ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
