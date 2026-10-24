"use client";
import { createContext, useContext } from "react";
import { useMerchant } from "@/hooks/useMerchant";
import { HomeBlock } from "@/lib/merchant-store";
import {
  editorialPhotos as photos,
  getEditorialBannerSvg,
} from "@/lib/artwork";
export const HOME_BLOCKS: HomeBlock[] = [
  {
    id: "hero",
    label: "Main hero",
    media: photos.hero,
    alt: "Everyday jewellery",
    href: "/collections/flatback",
    slides: [],
  },
  {
    id: "categories",
    label: "Category tiles",
    media: "",
    alt: "Categories",
    href: "/collections/shop-all",
  },
  {
    id: "gifting-left",
    label: "Gifting · personalized",
    media: photos.giftingLeft,
    alt: "Personalized jewellery gifts",
    title: "PERSONALIZED",
    href: "/collections/personalized",
  },
  {
    id: "gifting-right",
    label: "Gifting · handmade",
    media: photos.giftingRight,
    alt: "Handmade jewellery",
    title: "HANDMADE",
    href: "/collections/handmade",
  },
  {
    id: "new-arrivals",
    label: "New arrivals",
    media: "",
    alt: "New arrivals",
    href: "/collections/new-arrivals",
    mode: "automatic",
    productIds: [],
  },
  {
    id: "above-marquee",
    label: "Media above marquee",
    media: getEditorialBannerSvg("shop-all-hero"),
    alt: "A little everyday luxury",
    href: "/collections/14k-gold",
    mediaType: "image",
  },
  {
    id: "marquee",
    label: "Moving marquee",
    media: "",
    alt: "Our values",
    href: "/",
  },
  {
    id: "below-marquee",
    label: "Media below marquee",
    media: getEditorialBannerSvg("shop-all-hero"),
    alt: "Jewellery made for the moments that matter",
    href: "/collections/14k-gold",
    mediaType: "image",
  },
  {
    id: "best-sellers",
    label: "Best sellers",
    media: "",
    alt: "Best sellers",
    href: "/collections/best-sellers",
    mode: "automatic",
    productIds: [],
  },
  {
    id: "personalized",
    label: "Personalized campaign",
    media: photos.personalizedBanner,
    alt: "Personalized initial necklaces",
    title: "PERSONALIZED",
    text: "A little letter. A story only you can tell.",
    href: "/collections/personalized",
  },
  {
    id: "unboxing",
    label: "Unbox a touch of luxury",
    media: photos.giftBoxes,
    alt: "Signature blush jewellery gift boxes",
    title: "UNBOX A TOUCH OF LUXURY",
    text: "A little luxury, in every detail.",
    href: "/collections/shop-all",
  },
  {
    id: "gallery",
    label: "Community gallery",
    media: "",
    alt: "Community favourites",
    href: "/collections/shop-all",
    slides: [
      photos.giftBoxes,
      photos.huggies,
      photos.studs,
      photos.giftingLeft,
      photos.piercings,
      photos.rings,
    ],
  },
  ...[
    "studs",
    "huggie-earrings",
    "necklaces",
    "piercings",
    "open-huggies",
    "hoop-earrings",
    "rings",
    "personalized",
  ].map((id, i) => ({
    id: `tile-${id}`,
    label: `Category tile · ${id}`,
    media: [
      photos.studs,
      photos.open,
      photos.necklaces,
      photos.piercings,
      photos.huggies,
      photos.hoops,
      photos.rings,
      photos.personalized,
    ][i],
    alt: id,
    title: id.replace(/-/g, " ").toUpperCase(),
    href: `/collections/${id}`,
  })),
];
export const HomeEditContext = createContext<{
  blocks: HomeBlock[];
  marquee?: { messages: string[]; speed: number; direction: "left" | "right" };
  onSelect: (id: string) => void;
} | null>(null);
export function useHomeContent() {
  const { data } = useMerchant();
  const edit = useContext(HomeEditContext);
  const blocks = edit?.blocks || data.home;
  return {
    id: (id: string) =>
      ({
        ...HOME_BLOCKS.find((b) => b.id === id),
        ...blocks.find((b) => b.id === id),
      }) as HomeBlock,
    data: edit?.marquee ? { ...data, marquee: edit.marquee } : data,
    edit,
  };
}
export function HomeSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const home = useHomeContent();
  const b = home.id(id);
  if (b.hidden && !home.edit) return null;
  return (
    <div
      className={`${className} ${home.edit ? "home-edit-region" : ""}`}
      data-home-section={id}
    >
      {children}
      {home.edit && (
        <button
          className="home-edit-control"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            home.edit?.onSelect(id);
          }}
        >
          Edit {b.label}
          {b.hidden ? " · hidden" : ""}
        </button>
      )}
    </div>
  );
}
export function HomeMedia({
  block,
  className = "",
}: {
  block: HomeBlock;
  className?: string;
}) {
  return block.mediaType === "video" ? (
    <video
      className={className}
      src={block.media}
      poster={block.poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      controls
      aria-label={block.alt}
    />
  ) : (
    <picture>
      {block.mobileMedia && (
        <source media="(max-width: 767px)" srcSet={block.mobileMedia} />
      )}
      <img
        className={className}
        src={block.media}
        alt={block.alt}
        width={1300}
        height={650}
        decoding="async"
        fetchPriority={block.id === "hero" ? "high" : "auto"}
        loading={block.id === "hero" ? "eager" : "lazy"}
      />
    </picture>
  );
}
