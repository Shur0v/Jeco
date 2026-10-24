"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { HomeSection, HomeMedia, useHomeContent } from "./home-content";
export function MainHero() {
  const home = useHomeContent(),
    block = home.id("hero"),
    slides = block.items?.length
      ? block.items
      : [
          {
            id: "main",
            title: block.title || "Everyday luxury",
            text: block.text,
            media: block.media,
            alt: block.alt,
            href: block.href,
            buttonLabel: block.buttonLabel,
          },
        ];
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    touch = useRef<number | null>(null);
  const active = index % slides.length,
    current = slides[active];
  useEffect(() => {
    if (
      paused ||
      home.edit ||
      slides.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      block.interval || 7000,
    );
    return () => clearTimeout(timer);
  }, [index, paused, home.edit, slides.length, block.interval]);
  const move = (delta: number) =>
    setIndex((i) => (i + delta + slides.length) % slides.length);
  return (
    <HomeSection id="hero" className="main-image-hero">
      <section
        aria-label="Featured collections"
        aria-roledescription="carousel"
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
        <div className="main-image-slide" key={current.id}>
          <HomeMedia
            block={{
              ...block,
              ...current,
              id: "hero",
              mediaType:
                current.media === block.media ? block.mediaType : "image",
            }}
          />
          <div className="main-image-copy">
            <p>{block.eyebrow}</p>
            <h1>{current.title}</h1>
            {current.text && <p>{current.text}</p>}
            <Link href={current.href}>{current.buttonLabel || "DISCOVER"}</Link>
          </div>
        </div>
        <div className="main-image-pagination" aria-label="Hero pagination">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              aria-current={active === i ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <i />
            </button>
          ))}
        </div>
        <div className="main-image-arrows">
          <button aria-label="Previous hero slide" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <button aria-label="Next hero slide" onClick={() => move(1)}>
            <ChevronRight />
          </button>
          <button
            aria-label={paused ? "Play hero slideshow" : "Pause hero slideshow"}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </section>
    </HomeSection>
  );
}
