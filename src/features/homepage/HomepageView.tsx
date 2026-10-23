"use client";

import { useMemo, useState, useEffect } from "react";
import { HomeSection, HomeMedia, useHomeContent } from "./home-content";
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
  const home = useHomeContent();
  const [slide, setSlide] = useState(0);
  const heroSlides = [home.id("hero").media, ...(home.id("hero").slides || [])];
  useEffect(() => {
    if (
      heroSlides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [heroSlides.length]);
  const { isHydrated } = useStore();
  const all = useMemo(
    () => commerceService.catalog.getAllProducts(),
    [isHydrated, home.data],
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
      <HomeSection id="hero" className="campaign-hero">
        <Link href={home.id("hero").href} aria-label="Find your flatbacks">
          <HomeMedia
            block={{
              ...home.id("hero"),
              media: heroSlides[slide] || heroSlides[0],
            }}
          />
        </Link>
        {heroSlides.length > 1 && (
          <div className="home-slide-controls">
            {heroSlides.map((_, i) => (
              <button
                aria-label={`Hero slide ${i + 1}`}
                aria-pressed={slide === i}
                key={i}
                onClick={() => setSlide(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </HomeSection>
      <HomeSection id="categories" className="home-category">
        <h2>CATEGORY</h2>
        <div className="category-grid">
          {categories.map(([label, slug, image]) => (
            <HomeSection key={slug} id={`tile-${slug}`}>
              <Link
                href={home.id(`tile-${slug}`).href || `/collections/${slug}`}
              >
                <HomeMedia block={home.id(`tile-${slug}`)} />
                <span>{home.id(`tile-${slug}`).title || label}</span>
              </Link>
            </HomeSection>
          ))}
        </div>
      </HomeSection>
      <section className="home-gifting">
        <h2>GIFTING</h2>
        <div className="gifting-grid">
          {["gifting-left", "gifting-right"].map((id) => (
            <HomeSection key={id} id={id}>
              <Link href={home.id(id).href}>
                <HomeMedia block={home.id(id)} />
                <span>{home.id(id).title}</span>
              </Link>
            </HomeSection>
          ))}
        </div>
      </section>
      <HomeSection id="new-arrivals">
        <ProductRow
          title="NEW ARRIVALS"
          tabs={["Piercing", "14K Gold", "Earrings", "All"]}
          products={
            home.id("new-arrivals").mode === "manual"
              ? all.filter((p) =>
                  home.id("new-arrivals").productIds?.includes(p.id),
                )
              : all.filter((p) =>
                  home.id("new-arrivals").source === "featured"
                    ? p.isFeatured
                    : home.id("new-arrivals").source === "best-sellers"
                      ? p.isBestSeller
                      : p.isNewArrival,
                )
          }
          href="/collections/new-arrivals"
        />
      </HomeSection>
      <HomeSection className="heart-spotlight" id="above-marquee">
        <Link href={home.id("above-marquee").href}>
          <HomeMedia block={home.id("above-marquee")} />
        </Link>
      </HomeSection>
      <HomeSection id="marquee">
        <div
          className="managed-marquee"
          tabIndex={0}
          aria-label="Our jewellery values"
        >
          <div
            style={{
              animationDuration: `${home.data.marquee.speed}s`,
              animationDirection:
                home.data.marquee.direction === "right" ? "reverse" : "normal",
            }}
          >
            {[0, 1].map((n) => (
              <div className="marquee-copy" key={n} aria-hidden={n === 1}>
                {home.data.marquee.messages.map((text, i) => (
                  <span key={i}>{text}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </HomeSection>
      <HomeSection id="below-marquee">
        <Link
          className="editorial-interlude"
          href={home.id("below-marquee").href}
        >
          <HomeMedia block={home.id("below-marquee")} />
        </Link>
      </HomeSection>
      <HomeSection id="best-sellers">
        <ProductRow
          title="BEST SELLERS"
          tabs={["14K Gold", "Earrings", "Rings", "Necklaces", "All"]}
          products={
            home.id("best-sellers").mode === "manual"
              ? all.filter((p) =>
                  home.id("best-sellers").productIds?.includes(p.id),
                )
              : all.filter((p) =>
                  home.id("best-sellers").source === "featured"
                    ? p.isFeatured
                    : home.id("best-sellers").source === "new-arrivals"
                      ? p.isNewArrival
                      : p.isBestSeller,
                )
          }
          href="/collections/best-sellers"
        />
      </HomeSection>
      <HomeSection id="personalized">
        <Link
          href={home.id("personalized").href}
          className="personalized-campaign"
        >
          <HomeMedia block={home.id("personalized")} />
          <div>
            <h2>{home.id("personalized").title}</h2>
            <p>{home.id("personalized").text}</p>
            <span className="white-cta">SHOP NOW</span>
          </div>
        </Link>
      </HomeSection>
      <HomeSection className="unboxing" id="unboxing">
        <div className="section-heading">
          <div>
            <h2>{home.id("unboxing").title}</h2>
            <p>{home.id("unboxing").text}</p>
          </div>
          <Link
            href="/collections/shop-all"
            aria-label="Explore jewellery gifts"
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <Link href={home.id("unboxing").href}>
          <HomeMedia block={home.id("unboxing")} />
        </Link>
      </HomeSection>
      <ReviewsSection />
      <HomeSection id="gallery" className="sparkle-gallery">
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
          {(home.id("gallery").slides || []).map((image, i) => (
            <Link
              href={`/collections/${categories[i % categories.length][1]}`}
              key={i}
            >
              <img
                src={image}
                alt={`Shop our community favourites ${i + 1}`}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </HomeSection>
    </div>
  );
}
