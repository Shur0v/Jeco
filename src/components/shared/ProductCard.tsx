'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { MetalFinish, Product } from '@/types/commerce';
import { FINISH_SWATCH_COLORS } from '@/config/design-tokens';
import { useStore } from '@/hooks/useStore';
import { formatMoney } from '@/lib/format';
import { getProductStudioSvg } from '@/lib/artwork';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const { currency, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedFinish, setSelectedFinish] = useState<MetalFinish>(
    product.availableFinishes[0]
  );
  const [isHovered, setIsHovered] = useState(false);

  const wishlisted = isInWishlist(product.id);
  const primaryBadge = product.badges.find((b) => b !== 'SOLD OUT');
  const isSoldOut = !product.inStock || product.badges.includes('SOLD OUT');

  const studioImg = getProductStudioSvg(
    product.visualSpec,
    selectedFinish,
    isHovered ? 1 : 0
  );

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Square Product Image Container */}
      <div className="relative aspect-square w-full bg-[#F6F6F6] overflow-hidden mb-2.5">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full focus:outline-none"
          aria-label={product.name}
        >
          <img
            src={studioImg}
            alt={`${product.name} in ${selectedFinish}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top-left subtle category/material tag matching Screenshots 2, 5, 6 */}
        {primaryBadge && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <span
              className={`inline-block px-2 py-0.5 text-[9.5px] tracking-[0.08em] uppercase font-medium ${
                primaryBadge === '14K GOLD'
                  ? 'bg-[#E5A4B4] text-white'
                  : primaryBadge === 'GOLD FILLED'
                  ? 'bg-[#DEDAD2] text-[#292929]'
                  : 'bg-white/95 text-[#292929]'
              }`}
            >
              {primaryBadge}
            </span>
          </div>
        )}

        {/* Top-right Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-opacity ${
            wishlisted
              ? 'opacity-100 bg-white/90 text-[#E7A7AA]'
              : 'opacity-0 group-hover:opacity-100 focus:opacity-100 bg-white/80 text-[#292929] hover:text-[#E7A7AA]'
          }`}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={wishlisted ? '#E7A7AA' : 'none'}
          />
        </button>

        {/* Bottom-right SOLD OUT badge OR Bottom-left Quick-Add Bag Icon */}
        {isSoldOut ? (
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="bg-[#888888] text-white text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 font-medium">
              SOLD OUT
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, { finish: selectedFinish, quantity: 1 });
            }}
            aria-label={`Quick add ${product.name} (${selectedFinish}) to bag`}
            className="absolute bottom-2.5 left-2.5 w-7 h-7 rounded-full bg-white/95 text-[#292929] shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[#292929] hover:text-white"
            title="Quick add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        )}
      </div>

      {/* Product Metadata Below Image */}
      <div className="flex flex-col space-y-1">
        <Link
          href={`/products/${product.slug}`}
          className="text-[12px] text-[#292929] hover:underline line-clamp-1 font-normal"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2 text-[11.5px] tabular-nums">
          <span className="text-[#292929]">
            {formatMoney(product.basePrice, currency)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[#777777] line-through">
              {formatMoney(product.compareAtPrice, currency)}
            </span>
          )}
        </div>

        {/* Finish Swatches Row */}
        <div className="flex items-center gap-1.5 pt-1">
          {product.availableFinishes.map((finish) => {
            const isSelected = finish === selectedFinish;
            const bgStyle = FINISH_SWATCH_COLORS[finish] || '#D5C185';
            return (
              <button
                key={finish}
                type="button"
                onClick={() => setSelectedFinish(finish)}
                aria-label={`Select ${finish} finish for ${product.name}`}
                className={`w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center ${
                  isSelected
                    ? 'ring-1 ring-offset-1 ring-[#292929]'
                    : 'opacity-75 hover:opacity-100'
                }`}
                style={{ background: bgStyle }}
              />
            );
          })}
        </div>

        <span className="text-[10.5px] text-[#777777] pt-0.5">
          {selectedFinish}
        </span>
      </div>
    </article>
  );
}
