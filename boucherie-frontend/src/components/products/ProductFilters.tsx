import React from 'react';
import { Filter, X, Tag, Sparkles, Box, ChevronDown } from 'lucide-react';

interface CurrentFilters {
  category: string;
  unitType: string;
  is_on_promotion?: boolean;
  is_new_arrival?: boolean;
}

interface ProductFiltersProps {
  categories: string[];
  currentFilters: CurrentFilters;
  onFilterChange: (key: keyof CurrentFilters, value: any) => void;
  onClearFilters: () => void;
  disabled?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  currentFilters,
  onFilterChange,
  onClearFilters,
  disabled = false,
}) => {
  const isFilterActive =
    currentFilters.category !== '' ||
    currentFilters.unitType !== '' ||
    currentFilters.is_on_promotion === true ||
    currentFilters.is_new_arrival === true;

  const selectStyles = "w-full p-3 bg-white border border-stone-200 rounded-xl text-stone-700 text-sm font-medium appearance-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-serif font-black text-stone-900 italic tracking-tight">
            Filtrer
          </h3>
        </div>
        
        {isFilterActive && (
          <button
            onClick={onClearFilters}
            className="text-[11px] uppercase tracking-widest font-bold text-stone-400 hover:text-red-700 transition-colors flex items-center gap-1 group"
            disabled={disabled}
          >
            <X className="w-3 h-3 group-hover:rotate-90 transition-transform" /> 
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Catégories */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-black text-stone-400 uppercase tracking-[0.15em]">
            <Box size={14} className="text-stone-300" /> Catégories
          </label>
          <div className="relative">
            <select
              value={currentFilters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className={selectStyles}
              disabled={disabled}
            >
              <option value="">Tous les produits</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Type d’unité */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-black text-stone-400 uppercase tracking-[0.15em]">
            <Tag size={14} className="text-stone-300" /> Type de vente
          </label>
          <div className="relative">
            <select
              value={currentFilters.unitType}
              onChange={(e) => onFilterChange('unitType', e.target.value)}
              className={selectStyles}
              disabled={disabled}
            >
              <option value="">Tous les types</option>
              <option value="Poids">Au Kilo (Poids)</option>
              <option value="Pièce">À l&apos;Unité (Pièce)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* Toggles (Promotions & Nouveautés) */}
        <div className="space-y-4">
          {/* Promotions */}
          <label className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${currentFilters.is_on_promotion ? 'bg-amber-100 text-amber-700' : 'bg-stone-50 text-stone-400'}`}>
                <Tag size={16} />
              </div>
              <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900 transition-colors">Promotions</span>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentFilters.is_on_promotion || false}
                onChange={(e) => onFilterChange('is_on_promotion', e.target.checked ? true : undefined)}
                className="sr-only peer"
                disabled={disabled}
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700"></div>
            </div>
          </label>

          {/* Nouveautés */}
          <label className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${currentFilters.is_new_arrival ? 'bg-blue-100 text-blue-700' : 'bg-stone-50 text-stone-400'}`}>
                <Sparkles size={16} />
              </div>
              <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900 transition-colors">Nouveautés</span>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentFilters.is_new_arrival || false}
                onChange={(e) => onFilterChange('is_new_arrival', e.target.checked ? true : undefined)}
                className="sr-only peer"
                disabled={disabled}
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Badge indicateur discret */}
      {isFilterActive && (
        <div className="pt-4">
          <div className="bg-red-50 rounded-xl p-3 text-center">
             <p className="text-[10px] font-black text-red-700 uppercase tracking-tighter">Filtres actifs</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;