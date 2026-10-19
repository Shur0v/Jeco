'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { commerceService } from '@/commerce';
import {
  JewelleryMaterial,
  MetalFinish,
  SortOption,
} from '@/types/commerce';
import { ProductCard } from '@/components/shared/ProductCard';
import { RecentlyViewedSection } from '@/features/recommendations/RecentlyViewedSection';

interface CollectionCatalogViewProps {
  slug: string;
}

const MATERIALS: JewelleryMaterial[] = [
  '14K Solid Gold',
  'Gold Filled',
  'Sterling Silver',
  'Titanium',
  'Diamond',
];

const FINISHES: MetalFinish[] = [
  'Gold',
  'Silver',
  'Rose Gold',
  'White Gold',
  'Yellow Gold',
];

export function CollectionCatalogView({ slug }: CollectionCatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const collection = useMemo(
    () => commerceService.catalog.getCollectionBySlug(slug),
    [slug]
  );

  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get('inStock') === 'true'
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    searchParams.get('material') || 'all'
  );
  const [selectedFinish, setSelectedFinish] = useState<string>(
    searchParams.get('finish') || 'all'
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get('maxPrice')) || 500
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'featured'
  );
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  const filteredProducts = useMemo(() => {
    return commerceService.catalog.getProductsForCollection(slug, {
      inStockOnly,
      material: selectedMaterial,
      finish: selectedFinish,
      maxPrice: maxPrice < 500 ? maxPrice : undefined,
      sortBy,
    });
  }, [slug, inStockOnly, selectedMaterial, selectedFinish, maxPrice, sortBy]);

  function syncUrlParams(next: {
    inStock?: boolean;
    material?: string;
    finish?: string;
    sort?: SortOption;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const stockVal = next.inStock ?? inStockOnly;
    const matVal = next.material ?? selectedMaterial;
    const finVal = next.finish ?? selectedFinish;
    const sortVal = next.sort ?? sortBy;

    if (stockVal) params.set('inStock', 'true');
    else params.delete('inStock');

    if (matVal && matVal !== 'all') params.set('material', matVal);
    else params.delete('material');

    if (finVal && finVal !== 'all') params.set('finish', finVal);
    else params.delete('finish');

    if (sortVal && sortVal !== 'featured') params.set('sort', sortVal);
    else params.delete('sort');

    const qs = params.toString();
    router.replace(`/collections/${slug}${qs ? `?${qs}` : ''}`, {
      scroll: false,
    });
  }

  function handleResetFilters() {
    setInStockOnly(false);
    setSelectedMaterial('all');
    setSelectedFinish('all');
    setMaxPrice(500);
    setSortBy('featured');
    router.replace(`/collections/${slug}`, { scroll: false });
  }

  const isOverlayHero = slug === 'statement-rings';
  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (selectedMaterial !== 'all' ? 1 : 0) +
    (selectedFinish !== 'all' ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Collection Hero Section */}
      {collection?.heroImage && (
        <div className="relative w-full h-[260px] sm:h-[380px] lg:h-[440px] bg-[#E8DDD3] overflow-hidden">
          <img
            src={collection.heroImage}
            alt={collection.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {isOverlayHero && (
            <div className="absolute inset-x-0 bottom-8 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
              <h1 className="text-[24px] sm:text-[32px] tracking-[0.08em] uppercase font-medium text-[#292929]">
                {collection.title}
              </h1>
            </div>
          )}
        </div>
      )}

      {/* Main Collection Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-12">
        {/* Breadcrumbs (Screenshot 2) */}
        {collection?.breadcrumbs && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] text-[#777777] mb-4"
          >
            {collection.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <span aria-hidden="true">/</span>}
                <Link
                  href={crumb.href}
                  className={
                    idx === collection.breadcrumbs.length - 1
                      ? 'text-[#292929]'
                      : 'hover:text-[#292929]'
                  }
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Heading when not overlaid on Hero (Screenshots 5 & 6) */}
        {!isOverlayHero && (
          <div className="my-4">
            <h1 className="text-[24px] sm:text-[30px] tracking-[0.08em] uppercase font-medium text-[#292929]">
              {collection?.title || slug.toUpperCase()}
            </h1>
          </div>
        )}

        {/* Sub-Collection Visual Tiles (Screenshot 5 NEW ARRIVALS: SIMPLY BOLD, TIED TO LOVE, TITANIUM, THE OCEAN, LE JARDIN) */}
        {collection?.subCollections && collection.subCollections.length > 0 && (
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-4 mb-2">
            {collection.subCollections.map((sub) => (
              <Link
                key={sub.id}
                href={`/collections/${sub.slug}`}
                className="group relative w-[124px] h-[124px] sm:w-[140px] sm:h-[140px] shrink-0 bg-[#F6F6F6] overflow-hidden block"
              >
                <img
                  src={sub.image}
                  alt={sub.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black/55 to-transparent text-center">
                  <span className="text-[10px] tracking-[0.12em] uppercase text-white font-medium">
                    {sub.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Filter & Sort Toolbar (Matches Screenshots 2, 5, 6) */}
        <div className="border-y border-[#EAE6E4] py-3 my-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[#292929] hover:text-[#777777] font-medium cursor-pointer"
              aria-expanded={isFilterDrawerOpen}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>
                FILTERS &amp; SORT
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-[#777777] underline hover:text-[#292929]"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-5 text-[11.5px] text-[#777777]">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#292929]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInStockOnly(checked);
                  syncUrlParams({ inStock: checked });
                }}
                className="w-3.5 h-3.5 accent-[#292929] border-[#EAE6E4]"
              />
              <span>Show only in-stock items</span>
            </label>

            <span className="tabular-nums">
              {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Expandable Filters & Sort Panel */}
        {isFilterDrawerOpen && (
          <div className="bg-[#FAF8F7] border border-[#EAE6E4] p-6 mb-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EAE6E4]">
              <h2 className="text-[12px] tracking-[0.14em] uppercase font-medium text-[#292929]">
                REFINE &amp; SORT JEWELLERY
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-[#777777] hover:text-[#292929]"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sort By */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#292929] font-medium mb-2.5">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const nextSort = e.target.value as SortOption;
                    setSortBy(nextSort);
                    syncUrlParams({ sort: nextSort });
                  }}
                  className="w-full bg-white border border-[#EAE6E4] px-3 py-2 text-[12.5px] text-[#292929] focus:outline-none focus:border-[#292929]"
                >
                  <option value="featured">Featured</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A–Z</option>
                </select>
              </div>

              {/* Material Filter */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#292929] font-medium mb-2.5">
                  Material
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMaterial(val);
                    syncUrlParams({ material: val });
                  }}
                  className="w-full bg-white border border-[#EAE6E4] px-3 py-2 text-[12.5px] text-[#292929] focus:outline-none focus:border-[#292929]"
                >
                  <option value="all">All Materials</option>
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metal Finish Filter */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#292929] font-medium mb-2.5">
                  Metal Finish
                </label>
                <select
                  value={selectedFinish}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedFinish(val);
                    syncUrlParams({ finish: val });
                  }}
                  className="w-full bg-white border border-[#EAE6E4] px-3 py-2 text-[12.5px] text-[#292929] focus:outline-none focus:border-[#292929]"
                >
                  <option value="all">All Finishes</option>
                  {FINISHES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Ceiling */}
              <div>
                <div className="flex items-center justify-between text-[11px] tracking-[0.12em] uppercase text-[#292929] font-medium mb-2.5">
                  <span>Max Price</span>
                  <span className="tabular-nums">${maxPrice} USD</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#292929]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid (4 columns on desktop matching Screenshots 2, 5, 6) */}
        {displayedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-[15px] text-[#777777]">
              No jewellery pieces match your current filter selection.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-[#E7A7AA] text-white px-6 py-2.5 text-[11.5px] tracking-[0.12em] uppercase font-medium"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination / Load More Counter (Matches Screenshots 2, 5, 6) */}
            <div className="mt-14 text-center space-y-3">
              <p className="text-[10px] tracking-[0.14em] uppercase text-[#777777] tabular-nums">
                YOU HAVE VIEWED {displayedProducts.length} OF{' '}
                {filteredProducts.length} PRODUCTS
              </p>

              {visibleCount < filteredProducts.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 16)}
                  className="bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[10.5px] tracking-[0.14em] uppercase font-medium px-8 py-3 transition-colors cursor-pointer"
                >
                  LOAD MORE
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recently Viewed Products Section (Matches Screenshot 2) */}
      <RecentlyViewedSection />
    </div>
  );
}
