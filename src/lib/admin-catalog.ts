import { Product } from "@/types/commerce";

export type ProductUpdate = Pick<
  Product,
  "id" | "name" | "basePrice" | "inStock"
> & { hidden?: boolean; stockCount?: number };
let overrides: Record<string, ProductUpdate> = {};
export function hydrateCatalog() {
  try {
    overrides = JSON.parse(
      localStorage.getItem("jco_admin_catalog_v1") || "{}",
    );
  } catch {
    overrides = {};
  }
}
export function saveCatalogProduct(update: ProductUpdate) {
  overrides = { ...overrides, [update.id]: update };
  localStorage.setItem("jco_admin_catalog_v1", JSON.stringify(overrides));
  window.dispatchEvent(new Event("jco:catalog-update"));
}
export function applyCatalogUpdates(
  products: Product[],
  includeHidden = false,
): Product[] {
  return products
    .filter((p) => includeHidden || !overrides[p.id]?.hidden)
    .map((p) => {
      const change = overrides[p.id];
      if (!change) return p;
      return {
        ...p,
        name: change.name,
        basePrice: change.basePrice,
        inStock: change.inStock,
        variants: p.variants.map((v) => ({
          ...v,
          price: change.basePrice,
          inStock: change.inStock,
          stockCount: change.inStock ? (change.stockCount ?? v.stockCount) : 0,
        })),
      };
    });
}
