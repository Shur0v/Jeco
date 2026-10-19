'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { commerceService } from '@/commerce';
import { SortOption } from '@/types/commerce';
import { ProductCard } from '@/components/shared/ProductCard';

export function SearchPageView() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const results = useMemo(
    () => commerceService.catalog.searchProducts(query, { sortBy }),
    [query, sortBy]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12 min-h-[65vh]">
      <div className="max-w-xl mx-auto text-center mb-10">
        <h1 className="text-[24px] sm:text-[28px] tracking-[0.08em] uppercase font-medium text-[#292929] mb-4">
          SEARCH JEWELLERY
        </h1>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by piece name, category, or material..."
            aria-label="Search catalog"
            className="w-full bg-[#F6F6F6] text-[#292929] px-4 py-3.5 pr-10 text-[13.5px] focus:outline-none border border-[#EAE6E4] focus:border-[#292929]"
          />
          <Search className="w-4 h-4 text-[#777777] absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center justify-between border-y border-[#EAE6E4] py-3 mb-8 text-[12px]">
        <span className="text-[#777777] tabular-nums">
          {query.trim()
            ? `Showing ${results.length} results for “${query}”`
            : `Showing all ${results.length} pieces`}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[#777777]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white border border-[#EAE6E4] px-2.5 py-1 text-[12px] text-[#292929] focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="best-selling">Best Selling</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-[14px] text-[#777777]">
            No jewellery matched &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="bg-[#E7A7AA] text-white text-[11px] tracking-[0.14em] uppercase px-6 py-2.5 font-medium"
          >
            View All Jewellery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
