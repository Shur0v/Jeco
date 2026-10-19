'use client';

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { ProductCard } from '@/components/shared/ProductCard';

export function RecentlyViewedSection() {
  const { recentlyViewedIds } = useStore();

  const products = commerceService.catalog.getProductsByIds(recentlyViewedIds);
  if (products.length === 0) return null;

  return (
    <section
      className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12 border-t border-[#EAE6E4]"
      aria-label="Recently Viewed Jewellery"
    >
      <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-6">
        RECENTLY VIEWED
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
