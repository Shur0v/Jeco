import { getMerchant } from "@/lib/merchant-store";
import {
  ICatalogService,
  ICommerceService,
  IPromotionService,
  IReviewService,
} from "@/commerce/contracts";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { applyCatalogUpdates } from "@/lib/admin-catalog";
import { MOCK_COLLECTIONS } from "@/mocks/collections";
import { MOCK_REVIEWS } from "@/mocks/reviews";
import { MOCK_PROMO_CODES } from "@/mocks/promotions";
import { Product, ProductFilterState } from "@/types/commerce";

function applyFiltersAndSort(
  items: Product[],
  filters?: ProductFilterState,
): Product[] {
  let result = [...items];

  if (!filters) return result;

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  if (filters.category && filters.category !== "all") {
    result = result.filter(
      (p) =>
        p.category === filters.category ||
        p.collections.includes(filters.category!),
    );
  }

  if (filters.material && filters.material !== "all") {
    result = result.filter(
      (p) => p.material.toLowerCase() === filters.material!.toLowerCase(),
    );
  }

  if (filters.finish && filters.finish !== "all") {
    result = result.filter((p) =>
      p.availableFinishes.some(
        (f) => f.toLowerCase() === filters.finish!.toLowerCase(),
      ),
    );
  }

  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.basePrice >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.basePrice <= filters.maxPrice!);
  }

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.basePrice - b.basePrice);
      break;
    case "price-desc":
      result.sort((a, b) => b.basePrice - a.basePrice);
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      result.sort(
        (a, b) =>
          (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "best-selling":
      result.sort((a, b) => b.popularityScore - a.popularityScore);
      break;
    case "featured":
    default:
      break;
  }

  return result;
}

class MockCatalogService implements ICatalogService {
  getAllProducts(): Product[] {
    return applyCatalogUpdates(MOCK_PRODUCTS);
  }

  getProductBySlug(slug: string): Product | undefined {
    return applyCatalogUpdates(MOCK_PRODUCTS).find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return applyCatalogUpdates(MOCK_PRODUCTS).find((p) => p.id === id);
  }

  getProductsByIds(ids: string[]): Product[] {
    return ids
      .map((id) => this.getProductById(id))
      .filter((p): p is Product => Boolean(p));
  }

  getCollectionBySlug(slug: string) {
    const custom = getMerchant().categories.find((c) => (c.slug === slug || c.aliases?.includes(slug)));
    if (custom)
      return {
        id: custom.id,
        slug,
        title: custom.name,
        description: "Explore our thoughtfully curated collection.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: custom.name, href: "/collections/" + slug },
        ],
      };
    return (
      MOCK_COLLECTIONS.find((c) => c.slug === slug) || {
        id: `col-${slug}`,
        slug,
        title: slug.replace(/-/g, " ").toUpperCase(),
        description:
          "Explore curated luxury minimalist jewellery crafted for everyday comfort.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          {
            label: slug.replace(/-/g, " "),
            href: `/collections/${slug}`,
          },
        ],
      }
    );
  }

  getAllCollections() {
    return MOCK_COLLECTIONS;
  }

  getProductsForCollection(
    collectionSlug: string,
    filters?: ProductFilterState,
  ): Product[] {
    const catalog = this.getAllProducts();
    let base: Product[] = [];
    if (collectionSlug === "shop-all" || collectionSlug === "all") {
      base = catalog;
    } else if (collectionSlug === "festival-sale") {
      base = catalog.filter(
        (p) => p.compareAtPrice !== undefined && p.compareAtPrice > p.basePrice,
      );
    } else if (collectionSlug === "new-arrivals") {
      base = catalog.filter(
        (p) => p.isNewArrival || p.collections.includes("new-arrivals"),
      );
    } else if (collectionSlug === "best-sellers") {
      base = catalog.filter(
        (p) => p.isBestSeller || p.collections.includes("best-sellers"),
      );
    } else if(collectionSlug==='featured'){
      base=catalog.filter(p=>p.isFeatured);
    } else {
      base = catalog.filter(
        (p) =>
          p.collections.includes(collectionSlug) ||
          p.collections.includes(getMerchant().categories.find(c=>c.aliases?.includes(collectionSlug))?.slug || collectionSlug) ||
          p.category ===
            (getMerchant().categories.find((c) => (c.slug === collectionSlug || c.aliases?.includes(collectionSlug)))
              ?.id || collectionSlug) ||
          (Boolean(
            getMerchant().categories.find((c) => (c.slug === collectionSlug || c.aliases?.includes(collectionSlug))),
          ) &&
            (p as import("@/lib/merchant-store").MerchantProduct)
              .subcategoryId ===
              getMerchant().categories.find((c) => (c.slug === collectionSlug || c.aliases?.includes(collectionSlug)))
                ?.id),
      );
    }

    // Preserve the reference collection's editorial product order before user sorting.
    const featuredIds =
      collectionSlug === "new-arrivals"
        ? ["prod-easy-huggie-hoop", "prod-dome-huggie-hoop"]
        : collectionSlug === "shop-all"
          ? [
              "prod-little-ball-huggies-hoop",
              "prod-mini-hugging-hoop-pair",
              "prod-pave-huggie-hoop-earrings",
              "prod-little-heart-huggie-earrings",
              "prod-ball-huggies-hoop-gold",
              "prod-mini-bezel-huggie-earrings",
              "prod-luxe-simple-huggie-earrings",
              "prod-bar-open-huggies-earrings",
              "prod-mini-cz-threaded-labret",
              "prod-sparkly-open-huggies-earrings",
              "prod-little-star-huggie-earrings",
              "prod-little-opal-huggies-hoops",
              "prod-little-disc-huggie-earrings",
              "prod-little-endless-hoop-earrings",
              "prod-conch-pave-hug-clicker-hoop",
              "prod-pearl-huggies-earrings",
            ]
          : [];
    if (featuredIds.length) {
      const rank = (id: string) => {
        const index = featuredIds.indexOf(id);
        return index < 0 ? featuredIds.length : index;
      };
      base = [...base].sort((a, b) => rank(a.id) - rank(b.id));
    }

    return applyFiltersAndSort(base, filters);
  }

  searchProducts(query: string, filters?: ProductFilterState): Product[] {
    return applyFiltersAndSort(applyCatalogUpdates(MOCK_PRODUCTS), {
      ...filters,
      query,
    });
  }

  getRecommendationsForProduct(
    productId: string,
    limit: number = 4,
  ): Product[] {
    const current = this.getProductById(productId);
    if (!current) return MOCK_PRODUCTS.slice(0, limit);

    const scored = applyCatalogUpdates(MOCK_PRODUCTS)
      .filter((p) => p.id !== productId)
      .map((p) => {
        let score = p.popularityScore / 20;
        if (p.category === current.category) score += 10;
        if (p.material === current.material) score += 6;
        const sharedCols = p.collections.filter((c) =>
          current.collections.includes(c),
        ).length;
        score += sharedCols * 3;
        return { product: p, score };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.product);
  }

  getCartUpsellProducts(
    excludeProductIds: string[] = [],
    limit: number = 3,
  ): Product[] {
    const preferredIds = [
      "prod-titanium-piercing-insertion-tool",
      "prod-jco-jewelry-polishing-cloth",
      "prod-finger-ring-sizer-tool",
      "prod-easy-huggie-hoop",
      "prod-little-ball-huggies-hoop",
    ];
    const upsells = preferredIds
      .filter((id) => !excludeProductIds.includes(id))
      .map((id) => this.getProductById(id))
      .filter((p): p is Product => Boolean(p));

    return upsells.slice(0, limit);
  }
}

class MockReviewService implements IReviewService {
  getReviewsForProduct(productId?: string) {
    if (!productId) return MOCK_REVIEWS;
    const exact = MOCK_REVIEWS.filter((r) => r.productId === productId);
    return exact;
  }

  getAllReviews() {
    return MOCK_REVIEWS;
  }
}

class MockPromotionService implements IPromotionService {
  validatePromoCode(
    code: string,
    subtotal: number,
    items?: import("@/types/commerce").CartItem[],
  ) {
    const normalized = code.trim().toUpperCase();
    const codes: import("@/types/commerce").PromoCode[] = [];
    const merchant = getMerchant();
    const managed = merchant.discounts.find((p) => p.code === normalized);
    if (managed) {
      const now = Date.now();
      const uses = merchant.orders.filter(
        (o) => o.promoCode === managed.code,
      ).length;
      if (
        !managed.active ||
        (managed.start && new Date(managed.start).getTime() > now) ||
        (managed.end && new Date(managed.end).getTime() < now) ||
        (managed.limit && uses >= managed.limit)
      )
        return {
          valid: false,
          discountAmount: 0,
          errorMessage: "This offer is inactive, expired or fully used.",
        };
      if (subtotal < managed.minSubtotal)
        return {
          valid: false,
          discountAmount: 0,
          errorMessage: "This order does not meet the minimum spend.",
        };
      const scoped = Boolean(
        managed.productIds?.length || managed.categoryIds?.length,
      );
      const eligible = items
        ? items
            .filter((item) => {
              const p = mockCommerceAdapter.catalog.getProductById(
                item.productId,
              );
              return (
                !scoped ||
                managed.productIds?.includes(item.productId) ||
                managed.categoryIds?.includes(p?.category || "") ||
                managed.categoryIds?.includes(
                  (p as import("@/lib/merchant-store").MerchantProduct)
                    ?.subcategoryId || "",
                )
              );
            })
            .reduce((n, i) => n + i.price * i.quantity, 0)
        : scoped
          ? 0
          : subtotal;
      if (eligible <= 0)
        return {
          valid: false,
          discountAmount: 0,
          errorMessage: "This code does not apply to the products in your bag.",
        };
      return {
        valid: true,
        promo: managed,
        discountAmount:
          managed.discountType === "percentage"
            ? Number(((eligible * managed.value) / 100).toFixed(2))
            : Math.min(eligible, managed.value),
      };
    }
    const promo = codes.find((p) => p.code === normalized);
    if (!promo) {
      return {
        valid: false,
        discountAmount: 0,
        errorMessage:
          "Invalid discount code. Try WELCOME10, JCO20, or SPARKLE15.",
      };
    }

    if (subtotal < promo.minSubtotal) {
      return {
        valid: false,
        promo,
        discountAmount: 0,
        errorMessage: `Code ${promo.code} requires a minimum subtotal of ৳${promo.minSubtotal.toFixed(2)} BDT.`,
      };
    }

    const discountAmount =
      promo.discountType === "percentage"
        ? Number(((subtotal * promo.value) / 100).toFixed(2))
        : Math.min(subtotal, promo.value);

    return {
      valid: true,
      promo,
      discountAmount,
    };
  }
}

export const mockCommerceAdapter: ICommerceService = {
  catalog: new MockCatalogService(),
  reviews: new MockReviewService(),
  promotions: new MockPromotionService(),
};
