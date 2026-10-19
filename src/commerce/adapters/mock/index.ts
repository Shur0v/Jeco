import {
  ICatalogService,
  ICommerceService,
  IPromotionService,
  IReviewService,
} from '@/commerce/contracts';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { MOCK_COLLECTIONS } from '@/mocks/collections';
import { MOCK_REVIEWS } from '@/mocks/reviews';
import { MOCK_PROMO_CODES } from '@/mocks/promotions';
import { Product, ProductFilterState } from '@/types/commerce';

function applyFiltersAndSort(
  items: Product[],
  filters?: ProductFilterState
): Product[] {
  let result = [...items];

  if (!filters) return result;

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter(
      (p) =>
        p.category === filters.category ||
        p.collections.includes(filters.category!)
    );
  }

  if (filters.material && filters.material !== 'all') {
    result = result.filter(
      (p) => p.material.toLowerCase() === filters.material!.toLowerCase()
    );
  }

  if (filters.finish && filters.finish !== 'all') {
    result = result.filter((p) =>
      p.availableFinishes.some(
        (f) => f.toLowerCase() === filters.finish!.toLowerCase()
      )
    );
  }

  if (typeof filters.minPrice === 'number') {
    result = result.filter((p) => p.basePrice >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === 'number') {
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
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.basePrice - b.basePrice);
      break;
    case 'price-desc':
      result.sort((a, b) => b.basePrice - a.basePrice);
      break;
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      result.sort(
        (a, b) =>
          (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'best-selling':
      result.sort((a, b) => b.popularityScore - a.popularityScore);
      break;
    case 'featured':
    default:
      break;
  }

  return result;
}

class MockCatalogService implements ICatalogService {
  getAllProducts(): Product[] {
    return MOCK_PRODUCTS;
  }

  getProductBySlug(slug: string): Product | undefined {
    return MOCK_PRODUCTS.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }

  getProductsByIds(ids: string[]): Product[] {
    return ids
      .map((id) => this.getProductById(id))
      .filter((p): p is Product => Boolean(p));
  }

  getCollectionBySlug(slug: string) {
    return (
      MOCK_COLLECTIONS.find((c) => c.slug === slug) || {
        id: `col-${slug}`,
        slug,
        title: slug.replace(/-/g, ' ').toUpperCase(),
        description:
          'Explore curated luxury minimalist jewellery crafted for everyday comfort.',
        breadcrumbs: [
          { label: 'Home', href: '/' },
          {
            label: slug.replace(/-/g, ' '),
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
    filters?: ProductFilterState
  ): Product[] {
    let base: Product[] = [];
    if (collectionSlug === 'shop-all' || collectionSlug === 'all') {
      base = MOCK_PRODUCTS;
    } else if (collectionSlug === 'new-arrivals') {
      base = MOCK_PRODUCTS.filter((p) => p.isNewArrival || p.collections.includes('new-arrivals'));
    } else if (collectionSlug === 'best-sellers') {
      base = MOCK_PRODUCTS.filter((p) => p.isBestSeller || p.collections.includes('best-sellers'));
    } else {
      base = MOCK_PRODUCTS.filter(
        (p) =>
          p.collections.includes(collectionSlug) ||
          p.category === collectionSlug
      );
    }

    if (base.length === 0) {
      base = MOCK_PRODUCTS;
    }

    return applyFiltersAndSort(base, filters);
  }

  searchProducts(query: string, filters?: ProductFilterState): Product[] {
    return applyFiltersAndSort(MOCK_PRODUCTS, {
      ...filters,
      query,
    });
  }

  getRecommendationsForProduct(productId: string, limit: number = 4): Product[] {
    const current = this.getProductById(productId);
    if (!current) return MOCK_PRODUCTS.slice(0, limit);

    const scored = MOCK_PRODUCTS.filter((p) => p.id !== productId).map((p) => {
      let score = p.popularityScore / 20;
      if (p.category === current.category) score += 10;
      if (p.material === current.material) score += 6;
      const sharedCols = p.collections.filter((c) =>
        current.collections.includes(c)
      ).length;
      score += sharedCols * 3;
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.product);
  }

  getCartUpsellProducts(
    excludeProductIds: string[] = [],
    limit: number = 3
  ): Product[] {
    const preferredIds = [
      'prod-titanium-piercing-insertion-tool',
      'prod-jco-jewelry-polishing-cloth',
      'prod-finger-ring-sizer-tool',
      'prod-easy-huggie-hoop',
      'prod-little-ball-huggies-hoop',
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
    const others = MOCK_REVIEWS.filter((r) => r.productId !== productId);
    return [...exact, ...others];
  }

  getAllReviews() {
    return MOCK_REVIEWS;
  }
}

class MockPromotionService implements IPromotionService {
  validatePromoCode(code: string, subtotal: number) {
    const normalized = code.trim().toUpperCase();
    const promo = MOCK_PROMO_CODES.find((p) => p.code === normalized);
    if (!promo) {
      return {
        valid: false,
        discountAmount: 0,
        errorMessage: 'Invalid discount code. Try WELCOME10, JCO20, or SPARKLE15.',
      };
    }

    if (subtotal < promo.minSubtotal) {
      return {
        valid: false,
        promo,
        discountAmount: 0,
        errorMessage: `Code ${promo.code} requires a minimum subtotal of $${promo.minSubtotal.toFixed(2)} USD.`,
      };
    }

    const discountAmount =
      promo.discountType === 'percentage'
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
