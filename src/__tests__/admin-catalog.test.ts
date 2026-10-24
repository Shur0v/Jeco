import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hydrateCatalog, saveCatalogProduct } from "../lib/admin-catalog";
import {initMerchant,changeMerchant,freshMerchantState,replaceMerchantSnapshot} from "../lib/merchant-store";
import {IDBFactory} from "fake-indexeddb";
import { commerceService } from "../commerce";

describe("merchant edits reach the storefront", () => {
  beforeEach(async () => {
    vi.stubGlobal("indexedDB",new IDBFactory());
    const memory = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    });
    vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
    await initMerchant();
    await replaceMerchantSnapshot(freshMerchantState());
    hydrateCatalog();
  });
  afterEach(() => {
    localStorage.setItem("jco_admin_catalog_v1", "{}");
    hydrateCatalog();
    vi.unstubAllGlobals();
  });
  it("persists an edited price and name across catalogue hydration, including variant prices", async () => {
    const original = commerceService.catalog.getAllProducts()[0];
    await saveCatalogProduct({
      id: original.id,
      name: "Edited gold hoops",
      basePrice: 79,
      inStock: true,
      stockCount: 8,
    });
    hydrateCatalog();
    const product = commerceService.catalog.getProductBySlug(original.slug)!;
    expect(product.name).toBe("Edited gold hoops");
    expect(
      product.variants.every((v) => v.price === 79 && v.stockCount === 8),
    ).toBe(true);
    expect(
      commerceService.catalog
        .searchProducts("Edited gold hoops")
        .some((p) => p.id === original.id),
    ).toBe(true);
  });
  it("removes sold-out items from the in-stock filter", async () => {
    const product = commerceService.catalog.getAllProducts()[0];
    await saveCatalogProduct({
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      inStock: false,
      stockCount: 0,
    });
    expect(
      commerceService.catalog
        .getProductsForCollection("shop-all", { inStockOnly: true })
        .some((p) => p.id === product.id),
    ).toBe(false);
    expect(
      commerceService.catalog
        .getProductById(product.id)
        ?.variants.every((v) => !v.inStock),
    ).toBe(true);
  });
  it("archives and restores a product without losing its catalogue record", async () => {
    const product = commerceService.catalog.getAllProducts()[0];
    const update = {
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      inStock: product.inStock,
    };
    await saveCatalogProduct({ ...update, hidden: true });
    expect(
      commerceService.catalog
        .getProductsForCollection("shop-all")
        .some((p) => p.id === product.id),
    ).toBe(false);
    await saveCatalogProduct({ ...update, hidden: false });
    expect(commerceService.catalog.getProductById(product.id)).toBeDefined();
  });
  it("accepts merchant-created discount codes and honours their minimum spend", async () => {
    await changeMerchant(s=>{s.discounts=[{id:'new15',active:true,code:'NEW15',description:'15% off',discountType:'percentage',value:15,minSubtotal:50}];});
    expect(
      commerceService.promotions.validatePromoCode("new15", 100),
    ).toMatchObject({ valid: true, discountAmount: 15 });
    expect(
      commerceService.promotions.validatePromoCode("NEW15", 40).valid,
    ).toBe(false);
    await changeMerchant(s=>{s.discounts=[];});
    expect(
      commerceService.promotions.validatePromoCode("NEW15", 100).valid,
    ).toBe(false);
  });
});
