"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { commerceService } from "@/commerce";
import { ProductCard } from "@/components/shared/ProductCard";
import { ReviewsSection } from "@/features/reviews/ReviewsSection";
import {
  editorialPhotos as photos,
  getEditorialBannerSvg,
  getProductStudioSvg,
} from "@/lib/artwork";
import { useStore } from "@/hooks/useStore";
import { Product } from "@/types/commerce";

function ProductRow({
  title,
  tabs,
  products,
  href,
}: {
  title: string;
  tabs: string[];
  products: Product[];
  href: string;
}) {
  const [tab, setTab] = useState(tabs[0]);
  const [offset, setOffset] = useState(0);
  const filtered = useMemo(() => {
    const matching = products.filter(
      (p) =>
        tab === "All" ||
        (tab === "14K Gold"
          ? p.material === "14K Solid Gold"
          : tab === "Piercing"
            ? /piercing|flatback/.test(p.category)
            : p.category
                .toLowerCase()
                .includes(tab.toLowerCase().replace(/s$/, ""))),
    );
    return matching.length ? matching : products;
  }, [tab, products]);
  return (
    <section className="home-products">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <div className="home-tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => {
                  setTab(t);
                  setOffset(0);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="row-controls">
          <Link href={href}>VIEW ALL</Link>
          <button
            aria-label={`Previous ${title}`}
            disabled={!offset}
            onClick={() => setOffset(Math.max(0, offset - 1))}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            aria-label={`Next ${title}`}
            disabled={offset + 4 >= filtered.length}
            onClick={() => setOffset(offset + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="home-product-grid">
        {filtered.slice(offset, offset + 4).map((p) => (
          <ProductCard product={p} key={p.id} />
        ))}
      </div>
    </section>
  );
}

export function HomepageView() {
  const { isHydrated } = useStore();
  const all = useMemo(
    () => commerceService.catalog.getAllProducts(),
    [isHydrated],
  );
  const categories = [
    ["STUDS", "studs", photos.studs],
    ["HUGGIES", "huggie-earrings", photos.open],
    ["NECKLACES", "necklaces", photos.necklaces],
    ["PIERCINGS", "piercings", photos.piercings],
    ["OPEN HUGGIES", "open-huggies", photos.huggies],
    ["HOOPS", "hoop-earrings", photos.hoops],
    ["RINGS", "rings", photos.rings],
    ["PERSONALIZED", "personalized", photos.personalized],
  ];
  const heart = all.find((p) => p.visualSpec.shape === "pave-heart-flatback")!;
  return (
    <div className="home-page">
      <section
        className="campaign-hero"
        aria-label="Your everyday earrings, sorted"
      >
        <Link href="/collections/flatback" aria-label="Find your flatbacks">
          <img
            src={photos.hero}
            alt="Your everyday earrings, sorted. Secure and comfortable 24/7. Find your flatbacks."
            fetchPriority="high"
          />
        </Link>
      </section>
      <section className="home-category">
        <h2>CATEGORY</h2>
        <div className="category-grid">
          {categories.map(([label, slug, image]) => (
            <Link key={slug} href={`/collections/${slug}`}>
              <img src={image} alt={label} loading="lazy" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="home-gifting">
        <h2>GIFTING</h2>
        <div className="gifting-grid">
          <Link href="/collections/personalized">
            <img
              src={photos.giftingLeft}
              alt="Gold birth flower necklaces, a meaningful gift"
              loading="lazy"
            />
            <span>PERSONALIZED</span>
          </Link>
          <Link href="/collections/handmade">
            <img
              src={photos.giftingRight}
              alt="Handmade pearl and gold jewellery"
              loading="lazy"
            />
            <span>HANDMADE</span>
          </Link>
        </div>
      </section>
      <ProductRow
        title="NEW ARRIVALS"
        tabs={["Piercing", "14K Gold", "Earrings", "All"]}
        products={all.filter((p) => p.isNewArrival)}
        href="/collections/new-arrivals"
      />
      <section className="heart-spotlight" id="story">
        <Link href={`/products/${heart.slug}`}>
          <img
            src={getProductStudioSvg(heart.visualSpec)}
            alt="Discover our signature pavé heart flatback"
            loading="lazy"
          />
        </Link>
      </section>
      <div className="value-ticker">
        <span>GENTLE ON SENSITIVE SKIN</span>
        <span>POKE-FREE COMFORT</span>
        <span>14K SOLID GOLD</span>
        <span>MADE FOR YOUR EVERYDAY</span>
        <span>WORLDWIDE SHIPPING</span>
      </div>
      <Link className="editorial-interlude" href="/collections/14k-gold">
        <img
          src={getEditorialBannerSvg("shop-all-hero")}
          alt="Jewellery made for the moments that matter"
          loading="lazy"
        />
      </Link>
      <ProductRow
        title="BEST SELLERS"
        tabs={["14K Gold", "Earrings", "Rings", "Necklaces", "All"]}
        products={all.filter((p) => p.isBestSeller)}
        href="/collections/best-sellers"
      />
      <Link href="/collections/personalized" className="personalized-campaign">
        <img
          src={photos.personalizedBanner}
          alt="Personalized initial necklaces"
          loading="lazy"
        />
        <div>
          <h2>PERSONALIZED</h2>
          <p>A little letter. A story only you can tell.</p>
          <span className="white-cta">SHOP NOW</span>
        </div>
      </Link>
      <section className="unboxing" id="showroom">
        <div className="section-heading">
          <div>
            <h2>UNBOX A TOUCH OF LUXURY</h2>
            <p>A little luxury, in every detail.</p>
          </div>
          <Link
            href="/collections/shop-all"
            aria-label="Explore jewellery gifts"
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <Link href="/collections/shop-all">
          <img
            src={photos.giftBoxes}
            alt="Signature blush floral jewellery gift boxes"
            loading="lazy"
          />
        </Link>
      </section>
      <ReviewsSection />
      <section className="sparkle-gallery">
        <div className="section-heading">
          <h2>SHARE THE SPARKLE</h2>
          <a
            href="https://www.instagram.com/jcojewellery/"
            target="_blank"
            rel="noreferrer"
          >
            @JCOJEWELLERY
          </a>
        </div>
        <div>
          {[
            photos.giftBoxes,
            photos.huggies,
            photos.studs,
            photos.giftingLeft,
            photos.piercings,
            photos.rings,
          ].map((image, i) => (
            <Link href={`/collections/${categories[i][1]}`} key={i}>
              <img
                src={image}
                alt={`Shop our community favourites ${i + 1}`}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
