'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { commerceService } from '@/commerce';
import { HOMEPAGE_CONTENT } from '@/mocks/banners';
import { ProductCard } from '@/components/shared/ProductCard';
import { ReviewsSection } from '@/features/reviews/ReviewsSection';
import {
  getEditorialBannerSvg,
  getLifestyleModelSvg,
  getProductStudioSvg,
} from '@/lib/artwork';

export function HomepageView() {
  const allProducts = useMemo(
    () => commerceService.catalog.getAllProducts(),
    []
  );

  // New Arrivals Carousel State
  const [newArrivalTab, setNewArrivalTab] = useState<
    'Piercing' | '14K Gold' | 'Earrings' | 'All'
  >('Piercing');
  const [newArrivalOffset, setNewArrivalOffset] = useState(0);

  const newArrivalProducts = useMemo(() => {
    const base = allProducts.filter((p) => p.isNewArrival);
    if (newArrivalTab === 'Piercing') {
      return base.filter(
        (p) => p.category === 'flatback' || p.category === 'piercings'
      );
    }
    if (newArrivalTab === '14K Gold') {
      return base.filter((p) => p.material === '14K Solid Gold');
    }
    if (newArrivalTab === 'Earrings') {
      return base.filter(
        (p) =>
          p.category === 'huggie-earrings' ||
          p.category === 'hoop-earrings' ||
          p.category === 'earrings'
      );
    }
    return base;
  }, [allProducts, newArrivalTab]);

  // Best Sellers Carousel State
  const [bestSellerTab, setBestSellerTab] = useState<
    '14K Gold' | 'Earrings' | 'Rings' | 'Necklaces' | 'All'
  >('14K Gold');
  const [bestSellerOffset, setBestSellerOffset] = useState(0);

  const bestSellerProducts = useMemo(() => {
    const base = allProducts.filter((p) => p.isBestSeller);
    if (bestSellerTab === '14K Gold') {
      return base.filter((p) => p.material === '14K Solid Gold');
    }
    if (bestSellerTab === 'Earrings') {
      return base.filter(
        (p) =>
          p.category === 'huggie-earrings' ||
          p.category === 'open-huggies' ||
          p.category === 'studs'
      );
    }
    if (bestSellerTab === 'Rings') {
      return base.filter((p) => p.category.includes('ring'));
    }
    if (bestSellerTab === 'Necklaces') {
      return base.filter(
        (p) => p.category === 'necklaces' || p.category === 'personalized'
      );
    }
    return base;
  }, [allProducts, bestSellerTab]);

  const featuredHeartFlatback = useMemo(
    () =>
      commerceService.catalog.getProductById('prod-14k-pave-cz-heart-flatback') ||
      allProducts[0],
    [allProducts]
  );

  return (
    <div className="bg-white">
      {/* 1. HERO CAMPAIGN BANNER (Matches Screenshot 7 Triptych "YOUR EVERYDAY EARRINGS, SORTED") */}
      <section
        className="w-full bg-[#ECE7E1] overflow-hidden border-b border-[#EAE6E4]"
        aria-label="Hero Campaign"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center bg-[#F4F1EC] shadow-md border border-[#E2DCD5]">
            {/* Left Ear Close-up */}
            <div className="md:col-span-4 aspect-[4/3] md:aspect-[4/4.2] relative overflow-hidden">
              <img
                src={getLifestyleModelSvg(0, 'Gold Flatbacks')}
                alt="Curated gold flatback ear stack"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center Pinned Editorial Card */}
            <div className="md:col-span-4 px-6 py-10 sm:py-12 text-center bg-gradient-to-b from-[#FAF8F6] to-[#EFECE6] relative flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-[#E2DCD5]">
              {/* Decorative metallic paper clip indicators */}
              <span
                className="hidden md:block absolute top-1/3 -left-3 w-6 h-2.5 rounded-full border-2 border-[#777777] bg-white/80"
                aria-hidden="true"
              />
              <span
                className="hidden md:block absolute top-2/3 -left-3 w-6 h-2.5 rounded-full border-2 border-[#777777] bg-white/80"
                aria-hidden="true"
              />
              <span
                className="hidden md:block absolute top-1/2 -right-3 w-6 h-2.5 rounded-full border-2 border-[#777777] bg-white/80"
                aria-hidden="true"
              />

              <h1 className="font-serif text-[28px] sm:text-[34px] lg:text-[38px] leading-[1.12] tracking-[0.02em] text-[#292929] uppercase max-w-[12ch] mx-auto">
                {HOMEPAGE_CONTENT.hero.headline}
              </h1>

              <p className="mt-4 text-[12px] sm:text-[13px] italic tracking-[0.14em] uppercase text-[#555555]">
                {HOMEPAGE_CONTENT.hero.kicker}
              </p>

              <Link
                href={HOMEPAGE_CONTENT.hero.ctaHref}
                className="mt-6 inline-block bg-[#3A3A3A] hover:bg-[#292929] text-white text-[11px] tracking-[0.16em] uppercase font-medium px-7 py-3 rounded-full transition-colors"
              >
                {HOMEPAGE_CONTENT.hero.ctaLabel}
              </Link>
            </div>

            {/* Right Ear Close-up */}
            <div className="md:col-span-4 aspect-[4/3] md:aspect-[4/4.2] relative overflow-hidden">
              <img
                src={getLifestyleModelSvg(2, 'Silver Flatbacks')}
                alt="Curated silver flatback ear piercings"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED JEWELLERY CATEGORY 8-TILE GRID (Matches Screenshot 7) */}
      <section
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12"
        aria-label="Shop by Category"
      >
        <h2 className="text-[16px] sm:text-[18px] tracking-[0.08em] uppercase font-medium text-[#292929] mb-5">
          CATEGORY
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {HOMEPAGE_CONTENT.categoriesGrid.map((cat) => {
            const tileImg = getProductStudioSvg(
              { shape: cat.shape, primaryFinish: cat.finish },
              cat.finish,
              0,
              '#EAE3DC'
            );
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative aspect-square bg-[#EAE3DC] overflow-hidden block"
              >
                <img
                  src={tileImg}
                  alt={cat.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-3 bottom-3 bg-white/80 backdrop-blur-[2px] py-2 text-center transition-colors group-hover:bg-white">
                  <span className="text-[10.5px] tracking-[0.16em] uppercase font-medium text-[#292929]">
                    {cat.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. GIFTING SPLIT PROMOTIONAL CAMPAIGN (Matches Screenshot 7) */}
      <section
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6"
        aria-label="Gifting Campaign"
      >
        <h2 className="text-[16px] sm:text-[18px] tracking-[0.08em] uppercase font-medium text-[#292929] mb-5">
          GIFTING
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left: Holiday Medallion Necklaces */}
          <Link
            href={HOMEPAGE_CONTENT.giftingSplit.leftHref}
            className="group relative aspect-[16/10] bg-[#FAF4F0] overflow-hidden flex flex-col justify-between border border-[#EAE6E4]"
          >
            <div className="flex-1 relative flex items-center justify-center p-6">
              <img
                src={getProductStudioSvg(
                  { shape: 'disc-initial-necklace', primaryFinish: 'Gold' },
                  'Gold',
                  0,
                  '#FAF4F0'
                )}
                alt="Gold Medallion Necklaces"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-[260px] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="bg-[#9E2A2B] text-white py-2.5 px-4 text-center text-[10.5px] tracking-[0.18em] uppercase font-medium">
              {HOMEPAGE_CONTENT.giftingSplit.leftCta}
            </div>
          </Link>

          {/* Right: Handwritten Love Note & Pearl Bracelet */}
          <Link
            href={HOMEPAGE_CONTENT.giftingSplit.rightHref}
            className="group relative aspect-[16/10] bg-[#F5F1EB] overflow-hidden flex flex-col justify-between border border-[#EAE6E4]"
          >
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center">
              <img
                src={getProductStudioSvg(
                  { shape: 'pearly-bracelet', primaryFinish: 'Gold' },
                  'Gold',
                  0,
                  '#F5F1EB'
                )}
                alt="Pearl Jewellery Gift Set"
                referrerPolicy="no-referrer"
                className="w-44 h-44 object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <p className="font-serif italic text-[20px] sm:text-[23px] text-[#292929] -mt-2">
                &ldquo;A little gift, a lot of love, Just for you ♥&rdquo;
              </p>
            </div>
            <div className="bg-[#1E6B3A] text-white py-2.5 px-4 text-center text-[10.5px] tracking-[0.18em] uppercase font-medium">
              {HOMEPAGE_CONTENT.giftingSplit.rightCta}
            </div>
          </Link>
        </div>
      </section>

      {/* 4. NEW ARRIVALS TABBED CAROUSEL (Matches Screenshot 7) */}
      <section
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12"
        aria-label="New Arrivals"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] tracking-[0.08em] uppercase font-medium text-[#292929]">
              NEW ARRIVALS
            </h2>
            <div className="flex items-center gap-4 mt-2.5">
              {(['Piercing', '14K Gold', 'Earrings', 'All'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setNewArrivalTab(tab);
                      setNewArrivalOffset(0);
                    }}
                    className={`text-[11.5px] pb-1 border-b transition-colors ${
                      newArrivalTab === tab
                        ? 'text-[#292929] border-[#292929] font-medium'
                        : 'text-[#777777] border-transparent hover:text-[#292929]'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end">
            <Link
              href="/collections/new-arrivals"
              className="border border-[#EAE6E4] hover:border-[#292929] px-4 py-1.5 text-[10px] tracking-[0.14em] uppercase text-[#292929] transition-colors"
            >
              VIEW ALL
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setNewArrivalOffset((prev) => Math.max(0, prev - 1))
                }
                disabled={newArrivalOffset === 0}
                aria-label="Previous new arrivals"
                className="p-1.5 border border-[#EAE6E4] text-[#292929] disabled:opacity-35 hover:border-[#292929]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewArrivalOffset((prev) =>
                    prev + 4 < newArrivalProducts.length ? prev + 1 : 0
                  )
                }
                aria-label="Next new arrivals"
                className="p-1.5 border border-[#EAE6E4] text-[#292929] hover:border-[#292929]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {newArrivalProducts
            .slice(newArrivalOffset, newArrivalOffset + 4)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      {/* 5. FEATURED SINGLE-PRODUCT FLOATING FLATBACK SPOTLIGHT + TICKER + EDITORIAL SHADOW (Matches Screenshot 7 Centerpiece) */}
      <section
        id="story"
        className="w-full border-y border-[#EAE6E4] bg-white"
        aria-label="Featured Piece Spotlight"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 flex flex-col items-center text-center">
          <Link
            href={`/products/${featuredHeartFlatback.slug}`}
            className="group relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
          >
            <img
              src={getProductStudioSvg(
                { shape: 'pave-heart-flatback', primaryFinish: 'Yellow Gold' },
                'Yellow Gold',
                0,
                '#FFFFFF'
              )}
              alt={featuredHeartFlatback.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#777777] mt-2">
            SIGNATURE 14K SOLID GOLD PAVÉ HEART FLATBACK
          </p>
          <Link
            href={`/products/${featuredHeartFlatback.slug}`}
            className="mt-2 text-[13px] text-[#292929] underline hover:text-[#777777]"
          >
            Discover {featuredHeartFlatback.name} — $149.00 USD
          </Link>
        </div>

        {/* Minimalist Value Proposition Strip */}
        <div className="border-t border-b border-[#EAE6E4] py-2.5 px-4 bg-[#FAF8F7] overflow-x-auto no-scrollbar">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 text-[10px] tracking-[0.16em] uppercase text-[#292929] whitespace-nowrap">
            <span>✓ GENTLE ON SENSITIVE SKIN</span>
            <span>✓ POKE-FREE FLATBACK COMFORT</span>
            <span>✓ 14K SOLID GOLD &amp; 925 STERLING SILVER</span>
            <span>✓ WATER-SAFE &amp; TARNISH RESISTANT</span>
            <span>✓ ETHICALLY SOURCED LAB DIAMONDS</span>
            <span>✓ WORLDWIDE TRACKED SHIPPING</span>
          </div>
        </div>

        {/* Atmospheric Shadow Studio Rest Section (Matching Screenshot 7) */}
        <div className="w-full h-[260px] sm:h-[340px] bg-gradient-to-r from-[#D5D8DC] via-[#E2E5E8] to-[#CFD3D7] relative overflow-hidden flex items-center justify-center">
          <div
            className="w-[420px] h-[220px] rounded-full border-[36px] border-[#BCC0C6]/60 blur-[6px] rotate-12"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#555555] mb-2">
              CRAFTED FOR EVERYDAY INTIMACY
            </p>
            <h3 className="font-serif text-[24px] sm:text-[32px] text-[#292929] tracking-wide max-w-xl">
              Weightless silhouettes engineered to move with you from morning to
              midnight.
            </h3>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS TABBED CAROUSEL (Matches Screenshot 7) */}
      <section
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14"
        aria-label="Best Sellers"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] tracking-[0.08em] uppercase font-medium text-[#292929]">
              BEST SELLERS
            </h2>
            <div className="flex items-center gap-4 mt-2.5">
              {(
                ['14K Gold', 'Earrings', 'Rings', 'Necklaces', 'All'] as const
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setBestSellerTab(tab);
                    setBestSellerOffset(0);
                  }}
                  className={`text-[11.5px] pb-1 border-b transition-colors ${
                    bestSellerTab === tab
                      ? 'text-[#292929] border-[#292929] font-medium'
                      : 'text-[#777777] border-transparent hover:text-[#292929]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end">
            <Link
              href="/collections/best-sellers"
              className="border border-[#EAE6E4] hover:border-[#292929] px-4 py-1.5 text-[10px] tracking-[0.14em] uppercase text-[#292929] transition-colors"
            >
              VIEW ALL
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setBestSellerOffset((prev) => Math.max(0, prev - 1))
                }
                disabled={bestSellerOffset === 0}
                aria-label="Previous best sellers"
                className="p-1.5 border border-[#EAE6E4] text-[#292929] disabled:opacity-35 hover:border-[#292929]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setBestSellerOffset((prev) =>
                    prev + 4 < bestSellerProducts.length ? prev + 1 : 0
                  )
                }
                aria-label="Next best sellers"
                className="p-1.5 border border-[#EAE6E4] text-[#292929] hover:border-[#292929]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {bestSellerProducts
            .slice(bestSellerOffset, bestSellerOffset + 4)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      {/* 7. PERSONALIZED JEWELLERY BANNER (Matches Screenshot 7 Hands holding R K S R N disc necklaces) */}
      <section
        className="w-full relative overflow-hidden"
        aria-label="Personalized Jewellery Campaign"
      >
        <div className="relative w-full h-[340px] sm:h-[440px]">
          <img
            src={HOMEPAGE_CONTENT.personalizedBanner.image}
            alt="Personalized engraved initial disc necklaces"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-end max-w-[1440px] mx-auto px-6 sm:px-14">
            <div className="text-right max-w-sm">
              <h2 className="text-[24px] sm:text-[30px] tracking-[0.1em] uppercase font-medium text-[#292929]">
                {HOMEPAGE_CONTENT.personalizedBanner.title}
              </h2>
              <p className="text-[12.5px] text-[#292929]/85 mt-1.5 mb-5">
                {HOMEPAGE_CONTENT.personalizedBanner.subtitle}
              </p>
              <Link
                href={HOMEPAGE_CONTENT.personalizedBanner.ctaHref}
                className="inline-block bg-white hover:bg-[#292929] text-[#292929] hover:text-white text-[11px] tracking-[0.14em] uppercase font-medium px-6 py-2.5 transition-colors shadow-xs"
              >
                {HOMEPAGE_CONTENT.personalizedBanner.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. UNBOX A TOUCH OF LUXURY / PACKAGING SHOWCASE (Matches Screenshot 7 & Screenshot 5) */}
      <section
        id="showroom"
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-8"
        aria-label="Luxury Packaging"
      >
        <div className="relative overflow-hidden border border-[#EAE6E4]">
          <img
            src={getEditorialBannerSvg('gift-boxes')}
            alt="J&CO. embossed floral blush pink jewellery gift boxes"
            referrerPolicy="no-referrer"
            className="w-full h-[280px] sm:h-[360px] object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 max-w-lg">
            <h2 className="text-[22px] sm:text-[28px] tracking-[0.08em] uppercase font-medium text-[#292929]">
              UNBOX A TOUCH OF LUXURY
            </h2>
            <p className="text-[12.5px] text-[#292929]/85 mt-2 mb-5">
              Every piece arrives nestled in our signature floral-embossed blush
              keepsake drawer box with a complimentary polishing cloth.
            </p>
            <div>
              <Link
                href="/collections/best-sellers"
                className="inline-block bg-white hover:bg-[#292929] text-[#292929] hover:text-white text-[10.5px] tracking-[0.14em] uppercase font-medium px-6 py-2.5 transition-colors"
              >
                EXPLORE GIFTS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS SHOWCASE (Matches Screenshot 7) */}
      <ReviewsSection />

      {/* 10. SHARE THE SPARKLE / INSTAGRAM COMMUNITY GALLERY (Matches Screenshot 7) */}
      <section
        className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12"
        aria-label="Share the Sparkle Gallery"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] sm:text-[15px] tracking-[0.1em] uppercase font-medium text-[#292929]">
            SHARE THE SPARKLE
          </h2>
          <a
            href="#jcojewellery"
            onClick={(e) => e.preventDefault()}
            className="text-[11px] tracking-[0.1em] uppercase text-[#777777] hover:text-[#292929] underline"
          >
            @JCOJEWELLERY
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            {
              title: 'Pink Jewellery Box',
              href: '/collections/flatback',
              img: getEditorialBannerSvg('gift-boxes'),
            },
            {
              title: 'Dome Huggie Stack',
              href: '/products/dome-huggie-hoop-earrings',
              img: getProductStudioSvg(
                { shape: 'dome-huggie', primaryFinish: 'Gold' },
                'Gold',
                0,
                '#EFEAE3'
              ),
            },
            {
              title: '14K Gold Flatbacks',
              href: '/collections/14k-gold',
              img: getProductStudioSvg(
                { shape: 'pave-heart-flatback', primaryFinish: 'Yellow Gold' },
                'Yellow Gold',
                0,
                '#F6EFEA'
              ),
            },
            {
              title: 'Insertion Tool Guide',
              href: '/products/titanium-piercing-insertion-tool-set',
              img: getProductStudioSvg(
                { shape: 'insertion-tool', primaryFinish: 'Silver' },
                'Silver',
                0,
                '#E5C9B5'
              ),
            },
            {
              title: 'Curated Ear Styling',
              href: '/collections/piercings',
              img: getLifestyleModelSvg(1, 'Curated Ear'),
            },
            {
              title: 'Statement Enamel Rings',
              href: '/collections/statement-rings',
              img: getProductStudioSvg(
                {
                  shape: 'twin-dome-enamel-ring',
                  primaryFinish: 'Gold',
                  enamelColor: '#27B9E8',
                },
                'Gold',
                0,
                '#F2ECE4'
              ),
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group relative aspect-square bg-[#F6F6F6] overflow-hidden block"
            >
              <img
                src={item.img}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] tracking-[0.14em] uppercase font-medium bg-[#292929]/80 px-3 py-1.5 transition-opacity">
                  Shop Look
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
