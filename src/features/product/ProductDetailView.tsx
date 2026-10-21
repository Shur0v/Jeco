'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Plus,
  Minus,
  Sparkles,
  Tag,
  Plane,
  X,
  ChevronLeft,
  ChevronRight,
  Ruler,
} from 'lucide-react';
import { MetalFinish, Product } from '@/types/commerce';
import { FINISH_SWATCH_COLORS } from '@/config/design-tokens';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { formatMoney } from '@/lib/format';
import {
  getEditorialBannerSvg,
  getLifestyleModelSvg,
  getProductStudioSvg,
} from '@/lib/artwork';
import { ProductCard } from '@/components/shared/ProductCard';
import { RecentlyViewedSection } from '@/features/recommendations/RecentlyViewedSection';
import { ReviewsSection } from '@/features/reviews/ReviewsSection';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product: initialProduct }: ProductDetailViewProps) {
  const { isHydrated } = useStore();
  const product = isHydrated ? commerceService.catalog.getProductById(initialProduct.id) || initialProduct : initialProduct;
  const {
    currency,
    addToCart,
    trackProductView,
  } = useStore();

  const [selectedFinish, setSelectedFinish] = useState<MetalFinish>(
    product.availableFinishes[0]
  );

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    availableSizes[0]
  );
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    trackProductView(product.id);
  }, [product.id, trackProductView]);

  const activeVariant = useMemo(() => {
    return (
      product.variants.find(
        (v) =>
          v.finish === selectedFinish &&
          (!selectedSize || v.size === selectedSize)
      ) || product.variants[0]
    );
  }, [product.variants, selectedFinish, selectedSize]);

  // Build 7-tile gallery matching Screenshot 5
  const galleryImages = useMemo(() => {
    const studioMain = getProductStudioSvg(
      product.visualSpec,
      selectedFinish,
      0
    );
    const studioZoom = getProductStudioSvg(
      product.visualSpec,
      selectedFinish,
      1,
      '#EFECE8'
    );
    const studioCardStand = getProductStudioSvg(
      product.visualSpec,
      selectedFinish,
      0,
      '#EBEBEB'
    );

    return [
      { src: studioMain, alt: `${product.name} (${selectedFinish}) Studio View` },
      {
        src: product.lifestyleImages[0] || getLifestyleModelSvg(0, product.name),
        alt: `${product.name} Editorial Ear Stack View 1`,
      },
      {
        src: product.lifestyleImages[1] || getLifestyleModelSvg(1, product.name),
        alt: `${product.name} Editorial Portrait View 2`,
      },
      {
        src: product.lifestyleImages[2] || getLifestyleModelSvg(2, product.name),
        alt: `${product.name} Close-Up Ear Detail View 3`,
      },
      {
        src: studioZoom,
        alt: `${product.name} Macro Metallic Finish View 4`,
      },
      {
        src: product.lifestyleImages[3] || getLifestyleModelSvg(3, product.name),
        alt: `${product.name} Everyday Styling View 5`,
      },
      {
        src: studioCardStand,
        alt: `${product.name} Presentation Card Display`,
      },
    ];
  }, [product, selectedFinish]);

  const relatedProducts = useMemo(
    () => commerceService.catalog.getRecommendationsForProduct(product.id, 4),
    [product.id]
  );

  const isAvailable = product.inStock && (activeVariant?.inStock ?? true);

  return (
    <div className="bg-white">
      {/* Main Top PDP Split (Matches Screenshot 4 & 5) */}
      <div className="pdp-layout w-full mx-auto pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          {/* Left 7 cols: 2-Column Editorial Product Gallery */}
          <div className="pdp-gallery lg:col-span-8 grid grid-cols-2 gap-0">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square bg-[#F6F6F6] overflow-hidden block cursor-zoom-in focus:outline-none"
                aria-label={`Zoom image ${idx + 1}: ${img.alt}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </button>
            ))}
          </div>

          {/* Right 5 cols: Sticky Contiguous Purchase Module */}
          <div className="pdp-info lg:col-span-4 px-5 sm:px-2 lg:sticky lg:top-20 pt-2 lg:pt-6">
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#777777] mb-3"
            >
              <Link href="/" className="hover:text-[#292929]">
                Home
              </Link>
              <span>/</span>
              <Link
                href={`/collections/${product.collections[1] || 'shop-all'}`}
                className="hover:text-[#292929] capitalize"
              >
                {(product.collections[1] || product.category).replace(
                  /-/g,
                  ' '
                )}
              </Link>
              <span>/</span>
              <Link
                href={`/collections/${product.category}`}
                className="hover:text-[#292929] capitalize"
              >
                {product.category.replace(/-/g, ' ')}
              </Link>
              <span>/</span>
              <span className="text-[#292929] truncate max-w-[180px]">
                {product.name}
              </span>
            </nav>

            {/* Product Title */}
            <h1 className="text-[22px] sm:text-[26px] font-medium text-[#292929] leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-2 flex items-center gap-3 text-[13.5px] tabular-nums">
              <span className="font-medium text-[#292929]">
                {formatMoney(
                  activeVariant?.price || product.basePrice,
                  currency
                )}
              </span>
              {activeVariant?.compareAtPrice && (
                <span className="text-[#777777] line-through">
                  {formatMoney(activeVariant.compareAtPrice, currency)}
                </span>
              )}
            </div>

            {/* Rating & Review Count */}
            <a
              href="#reviews"
              className="mt-2.5 inline-flex items-center gap-2 text-[11.5px] text-[#777777] hover:text-[#292929]"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3 h-3 text-[#E7A7AA]"
                    fill="#E7A7AA"
                  />
                ))}
              </div>
              <span>
                {product.reviewCount.toLocaleString()} Verified Reviews
              </span>
            </a>

            {/* Finish Swatches */}
            <div className="mt-6">
              <p className="text-[12px] text-[#292929] mb-2.5">
                {selectedFinish}
              </p>
              <div className="flex items-center gap-3">
                {product.availableFinishes.map((finish) => {
                  const isSelected = finish === selectedFinish;
                  const bgStyle = FINISH_SWATCH_COLORS[finish] || '#D5C185';
                  return (
                    <button
                      key={finish}
                      type="button"
                      onClick={() => setSelectedFinish(finish)}
                      aria-label={`Select ${finish} finish`}
                      className={`w-6 h-6 rounded-full transition-all ${
                        isSelected
                          ? 'ring-1 ring-offset-2 ring-[#292929]'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{ background: bgStyle }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Optional Ring / Necklace Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-[#292929]">Size: {selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 text-[12px] border transition-colors ${
                        selectedSize === sz
                          ? 'border-[#292929] bg-[#292929] text-white'
                          : 'border-[#EAE6E4] text-[#292929] hover:border-[#292929]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability + Size Guide Row (Matches Screenshot 4 & 5) */}
            <div className="mt-6 flex items-center justify-between text-[11.5px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-[#2E7D32]' : 'bg-[#888888]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[#292929]">
                  {isAvailable ? 'In stock' : 'Currently Sold Out'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] text-[#777777] hover:text-[#292929] underline flex items-center gap-1"
              >
                <Ruler className="w-3 h-3" />
                <span>Size Guide</span>
              </button>
            </div>

            {/* Full-width primary action, matching the reference product panel. */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2.5">

                {/* Primary Dusty Rose ADD TO BAG Button */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() =>
                    addToCart(product, {
                      finish: selectedFinish,
                      size: selectedSize,
                      quantity: 1,
                      openDrawer: true,
                    })
                  }
                  className="flex-1 h-[44px] bg-[#E7A7AA] hover:bg-[#dc9599] disabled:bg-[#CCCCCC] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium transition-colors cursor-pointer"
                >
                  {isAvailable ? 'ADD TO BAG' : 'SOLD OUT'}
                </button>

              </div>
            </div>

            {/* 3 Value Propositions (Matches Screenshot 4 & 5) */}
            <div className="mt-6 space-y-3 text-[12px] text-[#292929]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 stroke-[1.4] text-[#292929] shrink-0" />
                <span>Gentle on sensitive skin</span>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 stroke-[1.4] text-[#292929] shrink-0" />
                <span>Fair prices &amp; ethical sourcing</span>
              </div>
              <div className="flex items-center gap-3">
                <Plane className="w-4 h-4 stroke-[1.4] text-[#292929] shrink-0" />
                <span>Worldwide shipping</span>
              </div>
            </div>

            {/* Product Details / Shipping & Returns / Material Accordions (Matches Screenshot 4 & 5) */}
            <div className="mt-8 border-t border-[#EAE6E4] divide-y divide-[#EAE6E4]">
              {/* Accordion 1: Product Details */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === 'details' ? null : 'details'
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-[12.5px] text-[#292929] hover:text-[#777777]"
                  aria-expanded={openAccordion === 'details'}
                >
                  <span>Product Details</span>
                  {openAccordion === 'details' ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
                {openAccordion === 'details' && (
                  <div className="pb-4 text-[12.5px] text-[#777777] space-y-2 leading-relaxed">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 pt-1">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                    <p className="pt-1 text-[11.5px] text-[#292929]">
                      {product.dimensions}
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === 'shipping' ? null : 'shipping'
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-[12.5px] text-[#292929] hover:text-[#777777]"
                  aria-expanded={openAccordion === 'shipping'}
                >
                  <span>Shipping &amp; Returns</span>
                  {openAccordion === 'shipping' ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-[12.5px] text-[#777777] space-y-2 leading-relaxed">
                    <p>
                      • Complimentary Standard Tracked Shipping on all orders
                      $60 USD+.
                    </p>
                    <p>
                      • Orders dispatch within 1–2 business days in signature
                      J&amp;CO. gift packaging.
                    </p>
                    <p>
                      • Easy 30-day returns and exchanges on unworn items in
                      original packaging.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Material */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === 'material' ? null : 'material'
                    )
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-[12.5px] text-[#292929] hover:text-[#777777]"
                  aria-expanded={openAccordion === 'material'}
                >
                  <span>Material</span>
                  {openAccordion === 'material' ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
                {openAccordion === 'material' && (
                  <div className="pb-4 text-[12.5px] text-[#777777] space-y-2 leading-relaxed">
                    <p className="font-medium text-[#292929]">
                      {product.material}
                    </p>
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AS SEEN ON IG Section (Matches Screenshot 5) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] tracking-[0.1em] uppercase font-medium text-[#292929]">
            AS SEEN ON IG
          </h2>
          <span className="text-[11px] tracking-[0.08em] uppercase text-[#777777] underline">
            @JCOJEWELLERY
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <div className="aspect-square bg-[#F6F6F6] overflow-hidden">
            <img
              src={galleryImages[1].src}
              alt="As seen on Instagram"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* A GIFT, EVERY TIME Full-Width Blush Packaging Banner (Matches Screenshot 5) */}
      <section className="w-full relative overflow-hidden my-6">
        <div className="relative w-full h-[280px] sm:h-[380px]">
          <img
            src={getEditorialBannerSvg('gift-boxes')}
            alt="A Gift, Every Time — J&CO. Blush Keepsake Boxes"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-col justify-center">
            <h2 className="text-[22px] sm:text-[28px] tracking-[0.08em] uppercase font-medium text-[#292929]">
              A GIFT, EVERY TIME
            </h2>
            <p className="text-[12.5px] text-[#292929]/85 mt-1 mb-5">
              Treat yourself or a loved one.
            </p>
            <div>
              <Link
                href="/collections/best-sellers"
                className="inline-block bg-white hover:bg-[#292929] text-[#292929] hover:text-white text-[10.5px] tracking-[0.14em] uppercase font-medium px-6 py-2.5 transition-colors"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* YOU MAY ALSO LIKE Recommendations */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-6">
          YOU MAY ALSO LIKE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} />
          ))}
        </div>
      </section>

      {/* RECENTLY VIEWED Section (Matches Screenshot 5) */}
      <RecentlyViewedSection />

      {/* REVIEWS Section (Matches Screenshot 5) */}
      <ReviewsSection
        productId={product.id}
        productName={product.name}
        productSlug={product.slug}
      />

      {/* Gallery Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Zoom"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white text-[#292929] hover:bg-[#FAF8F7]"
            aria-label="Close zoom view"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setLightboxIndex(
                (lightboxIndex - 1 + galleryImages.length) %
                  galleryImages.length
              )
            }
            className="absolute left-4 sm:left-8 p-2.5 bg-white text-[#292929]"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="max-w-2xl w-full aspect-square bg-[#F6F6F6] overflow-hidden">
            <img
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setLightboxIndex((lightboxIndex + 1) % galleryImages.length)
            }
            className="absolute right-4 sm:right-8 p-2.5 bg-white text-[#292929]"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Jewellery Size Guide"
        >
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#EAE6E4] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E4]">
              <h3 className="text-[15px] tracking-[0.12em] uppercase font-medium text-[#292929]">
                J&amp;CO. SIZE &amp; FIT GUIDE
              </h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-[#777777] hover:text-[#292929]"
                aria-label="Close size guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-5 space-y-4 text-[12.5px] text-[#777777]">
              <p className="text-[#292929] font-medium">
                Huggie &amp; Flatback Ear Guide
              </p>
              <p>
                • <strong>Inner Diameter 6mm–7mm:</strong> Snug fit for helix,
                tragus, and second/third lobe piercings.
              </p>
              <p>
                • <strong>Inner Diameter 8mm–9mm:</strong> Standard comfortable
                everyday hug for primary earlobes.
              </p>
              <p className="text-[#292929] font-medium pt-2">
                US Ring Size Diameter Chart
              </p>
              <div className="grid grid-cols-4 gap-2 text-center border border-[#EAE6E4] p-3 tabular-nums text-[#292929]">
                <div>
                  <div className="font-semibold">US 5</div>
                  <div className="text-[11px] text-[#777777]">15.7mm</div>
                </div>
                <div>
                  <div className="font-semibold">US 6</div>
                  <div className="text-[11px] text-[#777777]">16.5mm</div>
                </div>
                <div>
                  <div className="font-semibold">US 7</div>
                  <div className="text-[11px] text-[#777777]">17.3mm</div>
                </div>
                <div>
                  <div className="font-semibold">US 8</div>
                  <div className="text-[11px] text-[#777777]">18.1mm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
