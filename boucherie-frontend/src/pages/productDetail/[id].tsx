import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, StarHalf, User, ChevronLeft, CheckCircle, Plus, Minus, Quote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  details?: string[];
  price_per_kg: number | null;
  price_per_unit: number | null;
  unit_type: 'Poids' | 'Pièce';
  category: string;
  image_url: string;
  average_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  client?: { email: string };
  createdAt: string;
}

const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) return <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />;
        if (i === fullStars && hasHalfStar) return <StarHalf key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />;
        return <Star key={i} className="w-5 h-5 text-stone-300" />;
      })}
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const PRODUCT_ID = params?.id ? Number(params.id) : null;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!PRODUCT_ID) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${PRODUCT_ID}`);
      setProduct({
        ...data,
        unit_type: data.unit_type ?? 'Pièce',
        image_url: data.image_url ?? '/placeholder.png',
      });
      setQuantity(data.unit_type === 'Poids' ? 0.5 : 1);
    } catch (err) {
      console.error('Erreur produit:', err);
    } finally {
      setLoading(false);
    }
  }, [PRODUCT_ID]);

  const fetchReviews = useCallback(async () => {
    if (!PRODUCT_ID) return;
    try {
      const { data } = await api.get(`/reviews/product/${PRODUCT_ID}`);
      setReviews(data);
    } catch (err) {
      console.error('Erreur avis:', err);
    }
  }, [PRODUCT_ID]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [fetchProduct, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return setFeedbackMessage("Veuillez vous connecter.");
    try {
      const res = await api.post('/reviews', { rating, comment, productId: PRODUCT_ID });
      setFeedbackMessage(res.data.message);
      setRating(0); setComment('');
      fetchReviews();
    } catch (error: any) {
      setFeedbackMessage(error.response?.data?.message || "Erreur.");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, product.name, product.price_per_unit ?? undefined, product.price_per_kg ?? undefined, product.unit_type, quantity);
    setAddedMessage(`Ajouté au panier !`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  const step = product?.unit_type === 'Poids' ? 0.5 : 1;
  const unitPrice = product?.unit_type === 'Poids' ? product.price_per_kg ?? 0 : product?.price_per_unit ?? 0;
  const finalPrice = (unitPrice * quantity).toLocaleString();

  if (loading || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-red-800 rounded-full animate-spin" />
      <p className="text-stone-500 font-medium">Préparation de votre sélection...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      {/* Header / Nav */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link href="/catalogue" className="inline-flex items-center text-stone-500 hover:text-red-800 transition-colors group">
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Retour à la boucherie</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Colonne Image - Style Galerie */}
            <div className="bg-stone-50 p-6 lg:p-12 flex items-center justify-center">
              <div className="relative w-full aspect-square group">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
              </div>
            </div>

            {/* Colonne Infos */}
            <div className="p-8 lg:p-16 flex flex-col">
              <div className="mb-2 flex items-center gap-3">
                <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full uppercase tracking-widest">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 border-l pl-3 border-stone-200">
                  <RatingStars rating={product.average_rating} />

                  <span className="text-sm text-stone-400 font-medium">
                    {product.average_rating} ({product.review_count || 0} avis)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-3xl font-black text-red-800 mb-6">
                {unitPrice.toLocaleString()} FCFA
                <span className="text-lg font-normal text-stone-400 ml-2 italic">/ {product.unit_type === 'Poids' ? 'kg' : 'unité'}</span>
              </p>

              <p className="text-stone-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {product.details && (
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {product.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-stone-500 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-800" /> {d}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Zone */}
              <div className="mt-auto space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                    <button
                      onClick={() => setQuantity(q => Math.max(step, q - step))}
                      className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-20 text-center font-bold text-xl text-stone-800">
                      {quantity} <small className="text-[10px] uppercase">{product.unit_type === 'Poids' ? 'kg' : 'pcs'}</small>
                    </span>
                    <button
                      onClick={() => setQuantity(q => q + step)}
                      className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!isAuthenticated}
                    className="flex-grow flex items-center justify-center gap-3 py-4 px-8 rounded-xl bg-stone-900 text-white font-bold text-lg hover:bg-red-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Ajouter • {finalPrice} FCFA
                  </button>
                </div>

                {addedMessage && (
                  <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-3 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5" /> {addedMessage}
                  </div>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-stone-400 text-sm italic">Connectez-vous pour passer commande</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTIONS AVIS --- */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-1">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Paroles de clients</h2>
            <p className="text-stone-500 mb-8">La qualité de notre viande jugée par ceux qui la dégustent.</p>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="bg-stone-900 p-6 rounded-2xl shadow-xl text-white">
                <h3 className="font-bold mb-4">Votre avis nous intéresse</h3>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      onClick={() => setRating(i)}
                      className={`w-6 h-6 cursor-pointer transition-colors ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`}
                    />
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience culinaire..."
                  className="w-full bg-stone-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-800 mb-4 min-h-[100px]"
                />
                <button type="submit" className="w-full bg-red-800 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  Publier l&apos;avis
                </button>
                {feedbackMessage && <p className="mt-3 text-xs text-stone-400 text-center">{feedbackMessage}</p>}
              </form>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                <p className="text-stone-400 text-sm">Connectez-vous pour laisser un avis sur ce produit.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-stone-50 rounded-3xl p-12 border border-stone-100">
                <Quote className="w-12 h-12 text-stone-200 mb-4" />
                <p className="text-stone-400 italic font-serif">Soyez le premier à donner votre avis sur cette pièce.</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <User className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <RatingStars rating={r.rating} />
                      <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-2 font-medium">&quot;{r.comment}&quot;</p>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">{r.client?.email.split('@')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;