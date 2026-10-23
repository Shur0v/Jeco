import { MetalFinish, ProductVisualSpec } from "@/types/commerce";
import photoData from "@/mocks/photos.json";

// Online sample photography. Keep this mapping isolated for the final asset swap.
const products = photoData.products as Record<string, string[]>;
const names = photoData.byName as Record<string, string[]>;
const finishes = photoData.finishes as Record<string, Record<string, string>>;
export const editorialPhotos = photoData.editorial;

export function getProductStudioSvg(
  spec: ProductVisualSpec,
  finishOverride?: MetalFinish,
  _viewIndex = 0,
  _bgHex?: string,
): string {
  if (spec.customImage) return spec.customImage;
  const finish = finishOverride || spec.primaryFinish;
  const finishPhotos =
    (spec.photoKey && finishes[spec.photoKey]) || finishes[spec.shape];
  const photos =
    (spec.photoKey && names[spec.photoKey]) || products[spec.shape];
  if (photos?.length) return finishPhotos?.[finish] || photos[0];
  if (spec.shape.includes("ring")) return products["chain-ring"][0];
  if (spec.shape.includes("necklace")) return editorialPhotos.necklaces;
  if (spec.shape.includes("bracelet")) return products["pearly-bracelet"][0];
  return products["bezel-stud"][0];
}

export function getLifestyleModelSvg(
  variantIndex = 0,
  label = "J&CO.",
): string {
  const photos = names[label] || products["dome-huggie"];
  const editorial = photos.slice(1);
  return (
    editorial[Math.abs(variantIndex) % editorial.length] || editorialPhotos.demi
  );
}

type Banner =
  | "hero-flatbacks"
  | "gifting-candy"
  | "gifting-card"
  | "personalized-hands"
  | "gift-boxes"
  | "auth-heart-hands"
  | "statement-rings-hero"
  | "shop-all-hero"
  | "demi-fine"
  | "luxury-14k";
export function getEditorialBannerSvg(type: Banner): string {
  const banners: Record<Banner, string> = {
    "hero-flatbacks": editorialPhotos.hero,
    "gifting-candy": editorialPhotos.giftingLeft,
    "gifting-card": editorialPhotos.giftingRight,
    "personalized-hands": editorialPhotos.personalizedBanner,
    "gift-boxes": editorialPhotos.giftBoxes,
    "auth-heart-hands":
      "https://www.jcojewellery.com/cdn/shop/files/signup_170b06cf-cde8-4444-a609-211e6dc00de0.jpg?v=1715223570&width=1400",
    "statement-rings-hero":
      "https://www.jcojewellery.com/cdn/shop/collections/Gemini_Generated_Image_f8i4znf8i4znf8i4_copy.png?v=1777962482&width=2000",
    "shop-all-hero":
      "https://www.jcojewellery.com/cdn/shop/files/BANNER_SHOP_ALLDesktop_e6b17a08-52c3-4429-ad0c-e60db7ddd56d.jpg?v=1785399439&width=2000",
    "demi-fine": editorialPhotos.demi,
    "luxury-14k": editorialPhotos.luxury,
  };
  return banners[type];
}
