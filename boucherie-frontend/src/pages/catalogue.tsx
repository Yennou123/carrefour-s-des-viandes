import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ProductCard, { Product } from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import Pagination from "@/components/common/Pagination";
import { Grid, Loader2, ShoppingBag, SearchX, RefreshCcw, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/context/SearchContext";
import api from "@/lib/axios";

interface Filters {
  category: string;
  unitType: string;
  is_on_promotion?: boolean;
  is_new_arrival?: boolean;
  search: string;
  page: number;
}

const CataloguePage: React.FC = () => {
  const router = useRouter();
  const { searchQuery } = useSearch();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    category: "",
    unitType: "",
    is_on_promotion: undefined,
    is_new_arrival: undefined,
    search: "",
    page: 1,
  });

  // 1) Charger les filtres depuis l’URL
  useEffect(() => {
    if (!router.isReady) return;
    const query = router.query;
    setFilters({
      category: (query.category as string) || "",
      unitType: (query.unitType as string) || "",
      is_on_promotion: query.is_on_promotion === "true" ? true : undefined,
      is_new_arrival: query.is_new_arrival === "true" ? true : undefined,
      search: (query.search as string) || searchQuery || "",
      page: query.page ? parseInt(query.page as string, 10) : 1,
    });
  }, [router.isReady]);

  // 2) Synchroniser filtres → URL
  const updateURL = (newFilters: Filters) => {
    const query: any = {};
    if (newFilters.category) query.category = newFilters.category;
    if (newFilters.unitType) query.unitType = newFilters.unitType;
    if (newFilters.is_on_promotion) query.is_on_promotion = true;
    if (newFilters.is_new_arrival) query.is_new_arrival = true;
    if (newFilters.search) query.search = newFilters.search;
    if (newFilters.page > 1) query.page = newFilters.page;

    router.replace({ pathname: "/catalogue", query }, undefined, { shallow: true });
  };

  // 3) Appliquer recherche globale
  useEffect(() => {
    setFilters((prev) => {
      const updated = { ...prev, search: searchQuery, page: 1 }; // Reset page sur recherche
      updateURL(updated);
      return updated;
    });
  }, [searchQuery]);

  // 4) Charger produits
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.unitType) params.unitType = filters.unitType;
      if (filters.is_on_promotion) params.is_on_promotion = true;
      if (filters.is_new_arrival) params.is_new_arrival = true;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = 12;

      const response = await api.get("/products", { params });
      
      const { products: fetchedRows, totalCount: count, totalPages: pages } = response.data;

      const fetchedProducts: Product[] = fetchedRows.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price_per_unit: p.price_per_unit,
        price_per_kg: p.price_per_kg,
        promotion_percentage: p.promotion_percentage || 0,
        promotion_price: p.promotion_price,
        unitType: p.unit_type === "Poids" ? "Poids" : "Pièce",
        category: p.category,
        image_url: p.image_url || "",
        is_on_promotion: p.is_on_promotion,
        is_new_arrival: p.is_new_arrival,
      }));

      setProducts(fetchedProducts);
      setTotalPages(pages || 1);
      setTotalCount(count || 0);

      if (allCategories.length === 0 && fetchedProducts.length > 0) {
        const categories = Array.from(new Set(fetchedProducts.map((p) => p.category))).filter(Boolean);
        setAllCategories(categories);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la récupération des produits.");
    } finally {
      setLoading(false);
    }
  }, [filters, allCategories.length]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value, page: 1 };
      updateURL(updated);
      return updated;
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page: newPage };
      updateURL(updated);
      return updated;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    const reset = {
      category: "",
      unitType: "",
      is_on_promotion: undefined,
      is_new_arrival: undefined,
      search: searchQuery,
      page: 1,
    };
    setFilters(reset);
    updateURL(reset);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Head>
        <title>Catalogue | La Boucherie</title>
      </Head>

      {/* --- BANNIÈRE HEADER --- */}
      <div className="bg-stone-900 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ShoppingBag size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Notre Sélection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold italic">Le Catalogue</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 inline-flex items-center gap-2 self-start">
            <Grid size={18} className="text-red-400" />
            <span className="text-sm font-medium">{totalCount} produits disponibles</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20 relative">
        {/* --- MOBILE FILTER BUTTON --- */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="bg-red-800 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-3 active:scale-95 transition-transform"
          >
            <Filter size={20} />
            <span>Filtrer les produits</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- SIDEBAR FILTRES (Desktop) --- */}
          <aside className="hidden lg:block lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24 bg-white p-7 rounded-[2rem] border border-stone-200 shadow-sm"
            >
                <ProductFilters
                  categories={allCategories}
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  disabled={loading}
                />
            </motion.div>
          </aside>

          {/* --- DRAWER FILTRES (Mobile) --- */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] lg:hidden"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white rounded-t-[3rem] z-[101] lg:hidden flex flex-col shadow-2xl"
                >
                  <div className="p-6 flex items-center justify-between border-b border-stone-100">
                    <span className="text-xl font-serif font-black italic">Filtres</span>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-stone-100 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-6">
                    <ProductFilters
                      categories={allCategories}
                      currentFilters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      disabled={loading}
                    />
                  </div>
                  <div className="p-6 border-t border-stone-100 italic">
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold"
                    >
                      Afficher les {products.length} résultats
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* --- GRILLE PRODUITS --- */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-red-800 animate-spin" />
                <p className="text-stone-500 font-medium animate-pulse tracking-wide italic font-serif">
                  Préparation des meilleures pièces...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <RefreshCcw size={32} />
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Oups !</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={fetchProducts}
                  className="bg-red-800 text-white px-6 py-2 rounded-full font-bold hover:bg-red-900 transition shadow-lg"
                >
                  Réessayer
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center shadow-sm">
                <SearchX size={64} className="mx-auto text-stone-200 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">Aucun résultat</h3>
                <p className="text-stone-500 mb-8 max-w-xs mx-auto">
                  Nous n&apos;avons pas trouvé de produits correspondant à vos critères de recherche.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 text-red-800 font-bold hover:gap-3 transition-all underline decoration-2 underline-offset-4"
                >
                  Effacer tous les filtres <RefreshCcw size={16} />
                </button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  >
                    {products.map((product) => (
                      <motion.div 
                        key={product.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <Pagination 
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  disabled={loading}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;