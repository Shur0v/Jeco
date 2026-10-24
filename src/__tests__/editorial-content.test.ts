import { describe, it, expect } from "vitest";
import {
  mergeEditorialBlocks,
  selectEditorialProducts,
  validateEditorialBlocks,
} from "@/lib/editorial-content";
import type { HomeBlock } from "@/lib/merchant-store";
import type { Product } from "@/types/commerce";
const hero: HomeBlock = {
  id: "hero",
  label: "Hero",
  media: "/default.webp",
  alt: "Hero",
  href: "/collections/shop-all",
  items: [
    {
      id: "one",
      title: "First",
      media: "/one.webp",
      alt: "First",
      href: "/collections/rings",
    },
    {
      id: "two",
      title: "Second",
      media: "/two.webp",
      alt: "Second",
      href: "/collections/earrings",
    },
  ],
};
describe("editorial publishing and compatibility", () => {
  it("retains legacy hero media, links and slide order when upgrading", () => {
    const merged = mergeEditorialBlocks(
      [hero],
      [
        {
          ...hero,
          items: undefined,
          media: "/custom.webp",
          href: "/collections/gifts",
          slides: ["/extra.webp"],
        },
      ],
    );
    expect(merged[0].items?.map((i) => i.media)).toEqual([
      "/custom.webp",
      "/extra.webp",
      "/two.webp",
    ]);
    expect(merged[0].items?.[0].href).toBe("/collections/gifts");
  });
  it("does not reinsert defaults into an intentionally edited story list", () => {
    const edited = { ...hero, items: [hero.items![1]] };
    expect(mergeEditorialBlocks([hero], [edited])[0].items).toEqual(
      edited.items,
    );
  });
  it("adds new section defaults without resetting existing sections", () => {
    const defaults = [hero, { ...hero, id: "lifestyle" }];
    expect(
      mergeEditorialBlocks(defaults, [{ ...hero, title: "Saved" }]),
    ).toMatchObject([{ title: "Saved" }, { id: "lifestyle" }]);
  });
  it("rejects external destinations and empty stories before persisting", () => {
    expect(() =>
      validateEditorialBlocks([
        { ...hero, items: [{ ...hero.items![0], href: "//outside.test" }] },
      ]),
    ).toThrow();
    expect(() => validateEditorialBlocks([{ ...hero, items: [] }])).toThrow();
    expect(() =>
      validateEditorialBlocks([{ ...hero, interval: 1000 }]),
    ).toThrow();
    expect(() => validateEditorialBlocks([hero])).not.toThrow();
  });
  it("selects in configured order and excludes draft, archived and missing products", () => {
    const products = [
      { id: "a", status: "published" },
      { id: "b", status: "draft" },
      { id: "c", status: "archived" },
      { id: "d", status: "published" },
    ] as unknown as Product[];
    expect(
      selectEditorialProducts(
        { ...hero, productIds: ["d", "b", "missing", "a", "c"] },
        products,
        4,
      ).map((p) => p.id),
    ).toEqual(["d", "a"]);
  });
  it("matches collections as well as primary product categories", () => {
    const products = [
      { id: "a", category: "huggie-earrings", collections: ["earrings"] },
      { id: "b", category: "rings", collections: [] },
    ] as Product[];
    expect(
      selectEditorialProducts(
        { ...hero, collection: "earrings" },
        products,
        4,
      ).map((p) => p.id),
    ).toEqual(["a"]);
  });
});

it("preserves old personalized artwork when upgrading it to a split showcase", () => {
  const base = { ...hero, id: "personalized" };
  const saved = {
    ...base,
    items: undefined,
    media: "/my-personalized.webp",
    title: "My personal edit",
    productIds: ["my-product"],
  };
  const result = mergeEditorialBlocks([base], [saved])[0];
  expect(result.items?.[0].media).toBe("/my-personalized.webp");
  expect(result.items?.[0].title).toBe("My personal edit");
  expect(result.productIds).toEqual(["my-product"]);
});
