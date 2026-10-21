'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { ProductCard } from '@/components/shared/ProductCard';
import { useDialogFocus } from '@/hooks/useDialogFocus';

export function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, isHydrated } = useStore();
  useDialogFocus(isSearchOpen);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 160);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return commerceService.catalog.getAllProducts().slice(0, 4);
    }
    return commerceService.catalog.searchProducts(debouncedQuery).slice(0, 8);
  }, [debouncedQuery, isHydrated, isSearchOpen]);

  if (!isSearchOpen) return null;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search store"
    >
      <div className="bg-white border-b border-[#EAE6E4] shadow-xl max-h-[88vh] overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Search Input Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-4 border-b border-[#292929] pb-3"
          >
            <Search className="w-5 h-5 text-[#292929] stroke-[1.5]" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search flatbacks, dome huggies, 14K solid gold, statement rings..."
              aria-label="Search products"
              className="flex-1 text-[15px] text-[#292929] placeholder-[#777777] focus:outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[12px] text-[#777777] hover:text-[#292929]"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-[#292929] hover:text-[#777777]"
              aria-label="Close search"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </form>

          {/* Popular Quick Terms */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 text-[12px]">
            <span className="text-[#777777] uppercase tracking-wider text-[11px]">
              Popular:
            </span>
            {[
              'Dome Huggie',
              'Flatback',
              '14K Solid Gold',
              'Enamel Ring',
              'Personalized',
              'Pearl',
            ].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-3 py-1 bg-[#FAF8F7] border border-[#EAE6E4] text-[#292929] hover:border-[#292929] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Live Matching Products */}
          <div className="mt-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] tracking-[0.12em] uppercase text-[#777777] font-medium">
                {debouncedQuery.trim()
                  ? `Search Results (${results.length})`
                  : 'Trending Curations'}
              </h3>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsSearchOpen(false)}
                className="text-[12px] text-[#292929] hover:underline flex items-center gap-1"
              >
                <span>View all results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[14px] text-[#777777]">
                  No jewellery matched &ldquo;{debouncedQuery}&rdquo;. Try
                  searching for Huggies, Flatbacks, Rings, or 14K Gold.
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-5"
                onClick={() => setIsSearchOpen(false)}
              >
                {results.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-1"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />
    </div>
  );
}
