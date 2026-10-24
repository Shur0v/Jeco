"use client";
import { mergeEditorialBlocks } from "@/lib/editorial-content";
import { createContext, useContext } from "react";
import { useMerchant } from "@/hooks/useMerchant";
import { HomeBlock } from "@/lib/merchant-store";
import {
  editorialPhotos as photos,
  getEditorialBannerSvg,
} from "@/lib/artwork";
export const HOME_BLOCKS: HomeBlock[] = [
  {
    id: "header",
    label: "Header navigation & featured products",
    media: "",
    alt: "Navigation",
    href: "/collections/shop-all",
    items: [
      {
        id: "shop",
        title: "SHOP",
        media: "",
        alt: "",
        href: "/collections/shop-all",
      },
      {
        id: "new",
        title: "NEW ARRIVALS",
        media: "",
        alt: "",
        href: "/collections/new-arrivals",
      },
      {
        id: "personalized",
        title: "PERSONALIZED",
        media: "",
        alt: "",
        href: "/collections/personalized",
      },
      {
        id: "story",
        title: "OUR STORY",
        media: "",
        alt: "",
        href: "/pages/our-story",
      },
    ],
  },
  {
    id: "explore",
    label: "Explore jewellery · four tiles",
    media: "",
    alt: "Jewellery collection",
    href: "/collections/shop-all",
    eyebrow: "JEWELLERY",
    title: "Explore our jewellery collection",
    text: "Timeless rings, delicate necklaces and everyday favourites. Carefully chosen to become part of your story.",
    collection: "all",
  },
  {
    id: "lifestyle",
    label: "Everyday stories · lifestyle rail",
    media: "",
    alt: "Jewellery worn your way",
    href: "/collections/shop-all",
    title: "Time-honoured finery,\nauthored by you.",
    slides: [
      photos.rings,
      photos.demi,
      photos.personalizedBanner,
      photos.open,
      photos.giftingRight,
    ],
    items: [
      {
        id: "story-rings",
        title: "A signature, all your own",
        media: photos.rings,
        alt: "Gold rings styled for everyday",
        href: "/collections/rings",
      },
      {
        id: "story-earrings",
        title: "Little details. Lasting impressions.",
        media: photos.demi,
        alt: "Earrings worn by our community",
        href: "/collections/earrings",
      },
      {
        id: "story-personal",
        title: "Layers of your story",
        media: photos.personalizedBanner,
        alt: "Personalized gold necklace layers",
        href: "/collections/personalized",
      },
      {
        id: "story-open",
        title: "Made for your everyday",
        media: photos.open,
        alt: "Delicate huggie earrings",
        href: "/collections/open-huggies",
      },
      {
        id: "story-gifts",
        title: "For the moments that matter",
        media: photos.giftingRight,
        alt: "Thoughtful jewellery gifts",
        href: "/collections/handmade",
      },
    ],
  },
  {
    id: "collection-matrix",
    label: "Signature collection · product matrix",
    media: "",
    alt: "Signature collection",
    href: "/collections/rings",
    title: "Collection: Everyday Icons",
    family: "RINGS",
    setting: "GOLD & SILVER",
    buttonLabel: "FIND YOURS",
    collection: "rings",
  },
  {
    id: "hero",
    label: "Main hero",
    media: photos.hero,
    alt: "Everyday jewellery",
    href: "/collections/flatback",
    slides: [],
    title: "Style that stays with you.",
    text: "Thoughtfully chosen. Beautifully made. Discover everyday pieces with a little something extraordinary.",
    buttonLabel: "DISCOVER NOW",
    interval: 7000,
    items: [
      {
        id: "everyday",
        title: "Your everyday, elevated.",
        text: "Little luxuries for every version of you. Meet the pieces you will never want to take off.",
        media: photos.demi,
        alt: "Everyday gold earrings styled on a model",
        href: "/collections/earrings",
        buttonLabel: "EXPLORE EARRINGS",
      },
      {
        id: "diamonds",
        title: "A little brilliance. A lasting feeling.",
        text: "Discover delicate details and sparkling favourites, made to be part of your story.",
        media: photos.luxury,
        alt: "Fine gold jewellery details",
        href: "/collections/14k-gold",
        buttonLabel: "DISCOVER GOLD",
      },
      {
        id: "personal",
        title: "Make it unmistakably yours.",
        text: "Letters, layers and thoughtful gifts. Jewellery with a meaning only you can give it.",
        media: photos.personalizedBanner,
        alt: "Personalized initial necklaces",
        href: "/collections/personalized",
        buttonLabel: "MAKE IT PERSONAL",
      },
    ],
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
    label: "Community collage",
    title: "@jcojewellery",
    text: "FOLLOW US",
    buttonLabel: "SIGN UP TO OUR NEWSLETTER",
    secondaryLabel: "EXPLORE OUR COMMUNITY",
    secondaryHref: "/pages/our-community",
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
export const mergeHomeBlocks = (saved: HomeBlock[]) =>
  mergeEditorialBlocks(HOME_BLOCKS, saved);
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
      mergeHomeBlocks(blocks).find((b) => b.id === id) as HomeBlock,
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
