'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { ProductCard } from '@/components/shared/ProductCard';

export function WishlistView() {
  const { wishlistIds, session } = useStore();
  const wishlistProducts = commerceService.catalog.getProductsByIds(wishlistIds);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
      <div className="mb-10 border-b border-[#EAE6E4] pb-6 text-center">
        <span className="text-[10px] font-semibold tracking-[0.22em] text-[#777777] uppercase">
          SAVED PIECES {session ? `• ${session.userId}` : '• LOCAL BROWSER WISHLIST'}
        </span>
        <h1 className="mt-2 text-2xl font-normal tracking-[0.18em] text-[#292929] uppercase">
          MY WISHLIST ({wishlistProducts.length})
        </h1>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F5F2] text-[#292929]">
            <Heart className="h-5 w-5 stroke-[1.5]" />
          </div>
          <h2 className="text-base font-medium tracking-[0.1em] text-[#292929] uppercase">
            YOUR WISHLIST IS EMPTY
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#777777]">
            Tap the heart icon on any piece across our collections to save your favourite 14K solid
            gold, sterling silver, and personalized jewellery for later.
          </p>
          <Link
            href="/collections/shop-all"
            className="mt-6 inline-block bg-[#292929] px-8 py-3.5 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#404040]"
          >
            EXPLORE COLLECTIONS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
