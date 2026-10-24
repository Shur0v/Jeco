"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
} from "lucide-react";
import { HomeSection, HomeMedia, useHomeContent } from "./home-content";
import { HomeBlock } from "@/lib/merchant-store";
import { useStore } from "@/hooks/useStore";
import { Product } from "@/types/commerce";
import { getProductStudioSvg } from "@/lib/artwork";

export { selectEditorialProducts } from "@/lib/editorial-content";
import { selectEditorialProducts } from "@/lib/editorial-content";
export function EditorialProduct({
  product,
  caption = true,
}: {
  product: Product;
  caption?: boolean;
}) {
  return (
    <Link
      className="editorial-product"
      href={`/products/${product.slug}`}
      data-product-id={product.id}
      data-track-label={`View ${product.name}`}
    >
      <div className="editorial-product-image">
        <img
          src={product.images[0] || getProductStudioSvg(product.visualSpec)}
          alt={product.name}
          width={650}
          height={650}
          loading="lazy"
        />
      </div>
      {caption && (
        <div className="editorial-product-caption">
          <h3>{product.name}</h3>
          <p>৳{product.basePrice.toLocaleString("en-BD")}</p>
          <span>
            See product <ArrowUpRight size={13} />
          </span>
        </div>
      )}
    </Link>
  );
}
export function EditorialHero({ products }: { products: Product[] }) {
  const home = useHomeContent(),
    block = home.id("hero");
  const slides = block.items?.length
    ? block.items
    : [
        {
          id: "main",
          title: block.title || "Your everyday, elevated.",
          text: block.text,
          media: block.media,
          alt: block.alt,
          href: block.href,
          buttonLabel: block.buttonLabel,
        },
        ...(block.slides || []).map((media, i) => ({
          id: `legacy-${i}`,
          media,
          alt: block.alt,
          title: block.title || "Everyday luxury",
          text: block.text,
          href: block.href,
          buttonLabel: block.buttonLabel,
        })),
      ];
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [interacting, setInteracting] = useState(false);
  const current = slides[index % slides.length];
  const touch = useRef<number | null>(null);
  useEffect(() => {
    if (
      paused ||
      interacting ||
      home.edit ||
      slides.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      Math.max(4000, block.interval || 7000),
    );
    return () => clearInterval(timer);
  }, [slides.length, paused, interacting, block.interval, home.edit]);
  const featured = selectEditorialProducts(
    {
      ...block,
      productIds: current.productIds || block.productIds,
      collection:
        block.collection && block.collection !== "all"
          ? block.collection
          : current.href.split("/").pop(),
    },
    products,
    2,
  );
  const show = featured.length
    ? featured
    : products.filter((p) => p.isFeatured).slice(0, 2);
  const move = (delta: number) =>
    setIndex((i) => (i + delta + slides.length) % slides.length);
  return (
    <HomeSection id="hero" className="editorial-hero">
      <section
        aria-roledescription="carousel"
        aria-label="Jewellery stories"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false);
        }}
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (
            touch.current !== null &&
            Math.abs(e.changedTouches[0].clientX - touch.current) > 60
          )
            move(e.changedTouches[0].clientX < touch.current ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="editorial-hero-panel" key={current.id}>
          <Link
            className="editorial-hero-art"
            href={current.href}
            aria-label={current.title}
          >
            <HomeMedia
              block={{
                ...block,
                ...current,
                id: "hero",
                mediaType:
                  current.media === block.media ? block.mediaType : "image",
              }}
            />
          </Link>
          <div className="editorial-hero-story">
            <div className="editorial-hero-copy">
              <p className="editorial-eyebrow">
                {block.eyebrow || "THE WORLD OF J&CO."}
              </p>
              <h1>{current.title}</h1>
              <p>{current.text}</p>
            </div>
            <div className="editorial-hero-products">
              {show.map((p) => (
                <EditorialProduct key={p.id} product={p} />
              ))}
            </div>
            <Link className="editorial-dark-button" href={current.href}>
              {current.buttonLabel || block.buttonLabel || "DISCOVER NOW"}
            </Link>
          </div>
        </div>
        <div className="editorial-hero-tabs" aria-label="Choose story">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Show story ${i + 1}: ${s.title}`}
              aria-pressed={i === index % slides.length}
              onClick={() => setIndex(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{i === index % slides.length ? s.title : ""}</span>
            </button>
          ))}
        </div>
        <div className="editorial-hero-controls">
          <button aria-label="Previous story" onClick={() => move(-1)}>
            <ChevronLeft size={17} />
          </button>
          <span>
            {String((index % slides.length) + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
          <button aria-label="Next story" onClick={() => move(1)}>
            <ChevronRight size={17} />
          </button>
          <button
            aria-label={paused ? "Play stories" : "Pause stories"}
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      </section>
    </HomeSection>
  );
}
export function ExploreCollection({ products }: { products: Product[] }) {
  const b = useHomeContent().id("explore");
  // Four different jewellery families make the automatic collection useful from day one.
  const automatic = ["rings", "necklaces", "earrings", "bracelets"]
    .map((category) =>
      products.find(
        (p) => p.category === category || p.collections.includes(category),
      ),
    )
    .filter((p): p is Product => !!p);
  const selected =
    b.productIds?.length || b.collection !== "all"
      ? selectEditorialProducts(b, products, 4)
      : automatic;
  return (
    <HomeSection id="explore" className="editorial-explore">
      <div className="editorial-section-intro">
        <p className="editorial-eyebrow">{b.eyebrow}</p>
        <h2>{b.title}</h2>
        <p>{b.text}</p>
        {b.buttonLabel && (
          <Link
            className="editorial-outline-button editorial-explore-link"
            href={b.href}
          >
            {b.buttonLabel}
          </Link>
        )}
      </div>
      <div className="editorial-four-grid">
        {selected.map((p) => (
          <EditorialProduct key={p.id} product={p} />
        ))}
      </div>
    </HomeSection>
  );
}
export function LifestyleRail() {
  const b = useHomeContent().id("lifestyle"),
    rail = useRef<HTMLDivElement>(null);
  const cards = b.items?.length
    ? b.items
    : (b.slides || []).map((media, i) => ({
        id: String(i),
        media,
        alt: b.alt,
        title: b.title || "Everyday stories",
        href: b.href,
      }));
  return (
    <HomeSection id="lifestyle" className="editorial-lifestyle">
      <div className="editorial-section-intro">
        <h2>{b.title}</h2>
        <p>{b.text}</p>
      </div>
      <div className="editorial-lifestyle-rail" ref={rail}>
        {cards.map((c) => (
          <Link key={c.id} href={c.href} className="editorial-lifestyle-card">
            <img
              src={c.media}
              alt={c.alt}
              loading="lazy"
              width={650}
              height={900}
            />
            <span>
              {c.title}
              <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </div>
      <div className="editorial-rail-controls">
        <span>JEWELLERY, WORN YOUR WAY</span>
        <div>
          <button
            aria-label="Previous everyday stories"
            onClick={() =>
              rail.current?.scrollBy({
                left: -400,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next everyday stories"
            onClick={() =>
              rail.current?.scrollBy({
                left: 400,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </HomeSection>
  );
}
export function SignatureMatrix({ products }: { products: Product[] }) {
  const b = useHomeContent().id("collection-matrix");
  return (
    <HomeSection id="collection-matrix" className="editorial-matrix">
      <div className="editorial-matrix-heading">
        <h2>{b.title}</h2>
        <div className="editorial-matrix-meta">
          <p>
            <span>FAMILY</span>
            {b.family}
          </p>
          <p>
            <span>SETTING</span>
            {b.setting}
          </p>
          <Link className="editorial-outline-button" href={b.href}>
            {b.buttonLabel || "FIND YOURS"}
          </Link>
        </div>
      </div>
      <div className="editorial-matrix-grid">
        {selectEditorialProducts(b, products, 16).map((p) => (
          <EditorialProduct key={p.id} product={p} caption={false} />
        ))}
      </div>
    </HomeSection>
  );
}
export function CommunityCollage() {
  const b = useHomeContent().id("gallery");
  const [open, setOpen] = useState(false),
    [email, setEmail] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const { subscribeNewsletter } = useStore();
  return (
    <HomeSection id="gallery" className="editorial-community">
      <div className="editorial-collage-photos">
        {(b.slides || []).slice(0, 6).map((media, i) => (
          <Link key={i} href={b.href} className={`collage-photo photo-${i}`}>
            <img
              src={media}
              alt={`${b.alt} ${i + 1}`}
              width={650}
              height={800}
              loading="lazy"
            />
          </Link>
        ))}
      </div>
      <div className="editorial-community-copy">
        <p className="editorial-eyebrow">
          {b.eyebrow || b.text || "FOLLOW US"}
        </p>
        <a
          href="https://www.instagram.com/jcojewellery/"
          target="_blank"
          rel="noreferrer"
          className="editorial-social-handle"
        >
          {b.title || "@jcojewellery"}
        </a>
        <button
          className="editorial-text-link"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {b.buttonLabel || "SIGN UP TO OUR NEWSLETTER"}
        </button>
        {open && (
          <form
            className="editorial-newsletter"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                setStatus(
                  (await subscribeNewsletter(email))
                    ? "You’re on the list. Welcome to J&CO.!"
                    : "Unable to save. Please try again.",
                );
              } catch {
                setStatus("Unable to save. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label htmlFor="community-email">Your email address</label>
            <div>
              <input
                id="community-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button disabled={busy} aria-label="Join newsletter">
                {busy ? "…" : <ArrowUpRight size={20} />}
              </button>
            </div>
            <p role="status">{status}</p>
          </form>
        )}
        {b.secondaryLabel && (
          <Link
            className="editorial-community-secondary"
            href={b.secondaryHref || b.href}
          >
            {b.secondaryLabel} ↗
          </Link>
        )}
      </div>
    </HomeSection>
  );
}
