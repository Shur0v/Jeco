import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";
import { commerceService } from "../commerce";

describe("storefront-only launch", () => {
  it.each([
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/account",
    "/account/login",
    "/account/register",
    "/account/recover",
    "/account/addresses",
    "/dashboard/settings",
  ])(
    "returns a 404 for %s while retaining the implementation for later",
    (path) => {
      const response = middleware(
        new NextRequest(`https://example.com${path}?tab=orders`),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://example.com/unavailable",
      );
    },
  );
  it.each([
    "/",
    "/collections/shop-all",
    "/collections/festival-sale",
    "/products/dome-huggie-hoop-earrings",
    "/cart",
    "/checkout",
    "/wishlist",
    "/search",
  ])("keeps %s available", (path) => {
    const response = middleware(new NextRequest(`https://example.com${path}`));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
  it("lists genuine sale products and keeps their filtering and sorting functional", () => {
    const products =
      commerceService.catalog.getProductsForCollection("festival-sale");
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.compareAtPrice! > p.basePrice)).toBe(true);
    const filtered = commerceService.catalog.getProductsForCollection(
      "festival-sale",
      { inStockOnly: true, sortBy: "price-asc" },
    );
    expect(filtered.every((p) => p.inStock)).toBe(true);
    expect(filtered.map((p) => p.basePrice)).toEqual(
      filtered.map((p) => p.basePrice).sort((a, b) => a - b),
    );
  });
});
