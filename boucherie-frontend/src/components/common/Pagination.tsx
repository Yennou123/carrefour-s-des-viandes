"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Logic to show a limited number of page buttons around current page
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i < right)) {
            range.push(i);
        }
    }

    const finalRange = [];
    let l;
    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                finalRange.push(l + 1);
            } else if (i - l !== 1) {
                finalRange.push('...');
            }
        }
        finalRange.push(i);
        l = i;
    }
    return finalRange;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center space-x-2 py-8 pt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={`p-3 rounded-xl border border-stone-200 transition-all ${
          currentPage === 1 || disabled
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-red-800 hover:text-white hover:border-red-800 active:scale-95 shadow-sm"
        }`}
        aria-label="Page précédente"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center space-x-2">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-3 text-stone-400 font-bold">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <motion.button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              disabled={disabled}
              whileHover={!isCurrent ? { y: -2 } : {}}
              whileTap={{ scale: 0.95 }}
              className={`min-w-[48px] h-[48px] rounded-xl font-bold transition-all border ${
                isCurrent
                  ? "bg-red-800 text-white border-red-800 shadow-md"
                  : "bg-white text-stone-600 border-stone-200 hover:border-red-800 hover:text-red-800"
              }`}
            >
              {page}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={`p-3 rounded-xl border border-stone-200 transition-all ${
          currentPage === totalPages || disabled
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-red-800 hover:text-white hover:border-red-800 active:scale-95 shadow-sm"
        }`}
        aria-label="Page suivante"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
