import React, { useEffect, useState, useMemo } from "react";
import Button from "@/components/common/Button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";

/* ================= INTERFACE ALIGNÉE BACKEND ================= */
interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  unit_type: "Poids" | "Pièce";
  price_per_kg?: number;
  price_per_unit?: number;
  stock_quantity: number;
  image_url?: string;
  is_on_promotion: boolean;
  promotion_percentage: number;
  promotion_price?: number;
  is_new_arrival: boolean;
}

const emptyProduct: Partial<Product> = {
  name: "",
  description: "",
  category: "",
  unit_type: "Poids",
  price_per_kg: 0,
  price_per_unit: 0,
  stock_quantity: 0,
  image_url: "",
  is_on_promotion: false,
  promotion_percentage: 0,
  is_new_arrival: false,
};

const ProductsAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { searchQuery } = useSearch();

  const { data: fetchedProducts = [], loading, error, mutate } = useSmartRefresh<Product[]>("/admin/products");
  const products = fetchedProducts;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct);

  /* ================= FILTRAGE OPTIMISÉ ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  /* ================= UTIL ================= */
  const getPriceLabel = (p: Product) => {
    if (p.unit_type === "Poids") return `${p.price_per_kg} FCFA / kg`;
    return `${p.price_per_unit} FCFA / pièce`;
  };

  /* ================= FETCH ================= */
  // fetchProducts est géré par useSmartRefresh

  /* ================= MODAL ================= */
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formData);
      } else {
        await api.post("/admin/products", formData);
      }
      setIsModalOpen(false);
      mutate();
    } catch {
      alert("Erreur lors de l'enregistrement du produit.");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      mutate();
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  /* ================= PROMO TOGGLE ================= */
  const togglePromo = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}`, {
        is_on_promotion: !product.is_on_promotion,
      });
      mutate();
    } catch {
      alert("Erreur lors du changement de promotion.");
    }
  };

  /* ================= NewArrival TOGGLE ================= */
  const toggleNewArrival = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}`, {
        is_new_arrival: !product.is_new_arrival,
      });
      mutate();
    } catch {
      alert("Erreur lors du changement de nouveauté.");
    }
  };


  if (loading) return <p className="text-center py-20">Chargement…</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <AdminRoute>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Liste des Produits ({filteredProducts.length})
        </h2>
        <Button variant="danger" onClick={openCreateModal}>
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Prix</th>
              <th className="px-6 py-3 text-center text-xs uppercase">Stock</th>
              <th className="px-6 py-3 text-center text-xs uppercase">Nouveauté</th>
              <th className="px-6 py-3 text-center text-xs uppercase">Promo</th>
              <th className="px-6 py-3 text-center text-xs uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Aucun produit trouvé.
                </td>
              </tr>
            )}

            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-gray-500">{p.category}</td>
                <td className="px-6 py-4 font-bold text-red-600">{getPriceLabel(p)}</td>
                <td className="px-6 py-4 text-center font-semibold">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${p.stock_quantity <= 5
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                      }`}
                  >
                    {p.stock_quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleNewArrival(p)}
                    className={`px-2 py-1 text-xs rounded-full ${p.is_new_arrival
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {p.is_new_arrival ? "ON" : "OFF"}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => togglePromo(p)}
                    className={`px-2 py-1 text-xs rounded-full ${p.is_on_promotion
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {p.is_on_promotion ? "ON" : "OFF"}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="secondary" size="small" onClick={() => openEditModal(p)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg w-full max-w-lg 
                    max-h-[90vh] 
                    flex flex-col 
                    overflow-hidden">

            {/* HEADER FIXE */}
            <div className="p-6 ">
              <h3 className="text-xl font-bold">
                {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
              </h3>
            </div>

            {/* CONTENU SCROLLABLE */}
            <div className="p-6 space-y-4 overflow-y-auto">

              <input
                className="w-full border p-2 rounded"
                placeholder="Nom"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <textarea
                className="w-full border p-2 rounded"
                placeholder="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Catégorie"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="URL de l'image (https://...)"
                value={formData.image_url || ""}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />

              {formData.image_url && (
                <div className="border rounded p-2 flex justify-center">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="h-32 object-contain"
                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                  />
                </div>
              )}

              <select
                className="w-full border p-2 rounded"
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as "Poids" | "Pièce" })}
              >
                <option value="Poids">Poids</option>
                <option value="Pièce">Pièce</option>
              </select>

              {formData.unit_type === "Poids" ? (
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Prix / kg"
                  value={formData.price_per_kg || ""}
                  onChange={(e) => setFormData({ ...formData, price_per_kg: Number(e.target.value) })}
                />
              ) : (
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Prix / pièce"
                  value={formData.price_per_unit || ""}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: Number(e.target.value) })}
                />
              )}

              <input
                type="number"
                step="0.5"
                min="0.5"
                className="w-full border p-2 rounded"
                placeholder={
                  formData.unit_type === "Poids"
                    ? "Quantité en stock (kg)"
                    : "Quantité en stock (pièces)"
                }
                value={formData.stock_quantity ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: Number(e.target.value),
                  })
                }
              />

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-red-600"
                    checked={formData.is_on_promotion}
                    onChange={(e) => setFormData({ ...formData, is_on_promotion: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-gray-700">En Promotion</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-gray-700">Nouveauté</span>
                </label>
              </div>

              {formData.is_on_promotion && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                  <label className="text-xs font-black text-red-800 uppercase tracking-widest block">
                    Paramètres de remise
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        className="w-full border border-red-200 p-2 pl-8 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20"
                        placeholder="Ex: 20"
                        value={formData.promotion_percentage || ""}
                        onChange={(e) => setFormData({ ...formData, promotion_percentage: Number(e.target.value) })}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 font-bold">%</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-red-400 font-bold uppercase">Prix après remise</p>
                      <p className="text-sm font-black text-red-700">
                        {Math.round(
                          ((formData.unit_type === "Poids" ? formData.price_per_kg : formData.price_per_unit) || 0) *
                          (1 - (formData.promotion_percentage || 0) / 100)
                        ).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER FIXE */}
            <div className="p-6  flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleSubmit}>
                Enregistrer
              </Button>
            </div>

          </div>
        </div>
      )}
    </AdminRoute>
  );
};

export default ProductsAdminPage;
