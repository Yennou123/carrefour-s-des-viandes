import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Tag, CheckCircle, Plus, Minus, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface Product {
  id: number;
  name: string;
  description: string;
  price_per_unit?: number;
  price_per_kg?: number;
  promotion_percentage: number;
  promotion_price?: number;
  unitType: 'Poids' | 'Pièce';
  category: string;
  image_url: string;
  is_on_promotion: boolean;
  is_new_arrival: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const originalPrice = (product.unitType === 'Poids' ? product.price_per_kg : product.price_per_unit) || 0;
  const price = (product.is_on_promotion && product.promotion_price) ? product.promotion_price : originalPrice;
  
  const initialQuantity = product.unitType === 'Poids' ? 0.5 : 1;
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(
        product.id,
        product.name,
        product.price_per_unit ?? undefined,
        product.price_per_kg ?? undefined,
        product.unitType,
        quantity
      );
      setAddedMessage(`Ajouté ! ✔️`);
      setTimeout(() => setAddedMessage(null), 2000);
    } catch (error) {
      console.error("Erreur panier:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const unitLabel = product.unitType === 'Poids' ? 'kg' : 'pièce';
  const priceUnit = product.unitType === 'Poids' ? 'kg' : "unité";
  const finalPrice = (price * quantity);
  const stepValue = product.unitType === 'Poids' ? 0.5 : 1;
  const minValue = product.unitType === 'Poids' ? 0.5 : 1;

  const increment = () => setQuantity(prev => prev + stepValue);
  const decrement = () => setQuantity(prev => Math.max(minValue, prev - stepValue));

  return (
    <motion.div 
      layout
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group bg-[#F9F7F2] rounded-xl border border-stone-200 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl"
    >
      
      {/* Zone Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <motion.img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2">
          {product.is_on_promotion && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-700 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm flex items-center uppercase tracking-wider"
            >
              <Tag className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" /> -{product.promotion_percentage}%
            </motion.span>
          )}
          {product.is_new_arrival && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-stone-800 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm uppercase tracking-wider"
            >
              Nouveau
            </motion.span>
          )}
        </div>

        {/* Bouton Info rapide */}
        <Link href={`/productDetail/${product.id}`}>
          <motion.div 
            whileHover={{ scale: 1.1, backgroundColor: "#1c1917", color: "#fff" }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/90 p-1.5 md:p-2 rounded-full text-stone-700 transition-colors shadow-sm cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </motion.div>
        </Link>
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">
            {product.category}
        </span>
        
        <Link href={`/productDetail/${product.id}`}>
          <h2 className="text-lg font-serif font-bold text-stone-900 mb-2 leading-tight hover:text-red-800 transition-colors">
            {product.name}
          </h2>
        </Link>

        {product.is_on_promotion ? (
          <div className="flex flex-col mb-4">
             <div className="flex items-center gap-2">
               <span className="text-xl font-black text-red-700">{price.toLocaleString()} FCFA</span>
               <span className="text-xs text-stone-400 line-through">{originalPrice.toLocaleString()} FCFA</span>
             </div>
             <span className="text-[10px] text-stone-500 italic">le {priceUnit}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-black text-stone-900">{price.toLocaleString()} FCFA</span>
            <span className="text-xs text-stone-500 italic">le {priceUnit}</span>
          </div>
        )}

        {/* Sélecteur de Quantité */}
        <div className="mt-auto">
          <div className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-1 mb-4">
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={decrement}
              className="p-2 hover:bg-stone-100 rounded-md transition-colors text-stone-600"
              disabled={quantity <= minValue}
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.div 
                key={quantity}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col items-center"
              >
                  <span className="text-sm font-bold text-stone-800">{quantity} {unitLabel}</span>
              </motion.div>
            </AnimatePresence>
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={increment}
              className="p-2 hover:bg-stone-100 rounded-md transition-colors text-stone-600"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Bouton Panier */}
          <motion.button
            whileHover={isAuthenticated ? { scale: 1.02 } : {}}
            whileTap={isAuthenticated ? { scale: 0.98 } : {}}
            onClick={handleAddToCart}
            disabled={quantity < minValue || isAdding || loading || !isAuthenticated}
            className={`w-full relative flex items-center justify-center gap-3 py-3 rounded-lg font-bold transition-all duration-300 ${
              !isAuthenticated 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-stone-900 text-white hover:bg-red-800 shadow-md'
            }`}
          >
            {isAdding || loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
              />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>{finalPrice.toLocaleString()} FCFA</span>
              </>
            )}
          </motion.button>

          {/* Message de succès éphémère */}
          <AnimatePresence>
            {addedMessage && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute inset-x-5 bottom-20 flex items-center justify-center z-20"
              >
                  <div className="bg-green-600 text-white text-xs py-2 px-4 rounded-full shadow-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {addedMessage}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;