import type { HomeBlock } from "./merchant-store";
import type { Product } from "@/types/commerce";
export function selectEditorialProducts(
  block: HomeBlock,
  products: Product[],
  count: number,
) {
  const publicProducts = products.filter(
    (p) => !("status" in p) || p.status === "published",
  );
  if (block.productIds?.length)
    return block.productIds
      .map((id) => publicProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p)
      .slice(0, count);
  return publicProducts
    .filter(
      (p) =>
        !block.collection ||
        block.collection === "all" ||
        p.category === block.collection ||
        p.collections.includes(block.collection),
    )
    .slice(0, count);
}
export function mergeEditorialBlocks(
  defaults: HomeBlock[],
  saved: HomeBlock[],
): HomeBlock[] {
  return defaults.map((base) => {
    const previous = saved.find((b) => b.id === base.id),
      result = { ...base, ...previous };
    if (
      ["hero", "personalized"].includes(base.id) &&
      previous &&
      !previous.items &&
      base.items
    ) {
      result.items = [
        {
          ...base.items[0],
          media: previous.media || base.items[0].media,
          mobileMedia: previous.mobileMedia,
          title: previous.title || base.items[0].title,
          text: previous.text || base.items[0].text,
          href: previous.href || base.items[0].href,
          alt: previous.alt || base.items[0].alt,
        },
        ...(previous.slides || []).map((media, i) => ({
          ...base.items![0],
          id: "legacy-" + i,
          media,
        })),
        ...base.items.slice(1),
      ];
    }
    if (
      base.id === "personalized" &&
      previous?.showcaseVersion !== 1 &&
      base.showcaseVersion === 1
    ) {
      if (result.items?.length === 1)
        result.items = [...result.items, ...(base.items || []).slice(1)];
      result.showcaseVersion = 1;
    }
    return result;
  });
}
export function validateEditorialBlocks(blocks: HomeBlock[]) {
  const path = (href: string) => href.startsWith("/") && !href.startsWith("//");
  if (new Set(blocks.map((b) => b.id)).size !== blocks.length)
    throw new Error("Homepage sections must have unique IDs.");
  for (const b of blocks) {
    if (!path(b.href) || (b.secondaryHref && !path(b.secondaryHref)))
      throw new Error("Use a local storefront destination beginning with /.");
    if (
      b.interval !== undefined &&
      (!Number.isFinite(b.interval) ||
        b.interval < (b.id === "hero" ? 3000 : 4000) ||
        b.interval > 60000)
    )
      throw new Error(
        "Story intervals must be between 3 seconds (hero) or 4 seconds (other stories) and 60 seconds.",
      );
    if (b.items) {
      if (
        !b.items.length ||
        new Set(b.items.map((i) => i.id)).size !== b.items.length
      )
        throw new Error(
          "Keep at least one item with a unique ID in each editorial section.",
        );
      for (const item of b.items) {
        if (!item.title.trim() || !path(item.href))
          throw new Error(
            "Give every item a title and local storefront destination.",
          );
        if (
          ["hero", "personalized", "lifestyle"].includes(b.id) &&
          !item.media.trim()
        )
          throw new Error("Choose an image for every story.");
      }
    }
  }
}
