import {
  Collection,
  Product,
  ProductFilterState,
  PromoCode,
  Review,
} from '@/types/commerce';

export interface ICatalogService {
  getAllProducts(): Product[];
  getProductBySlug(slug: string): Product | undefined;
  getProductById(id: string): Product | undefined;
  getProductsByIds(ids: string[]): Product[];
  getCollectionBySlug(slug: string): Collection | undefined;
  getAllCollections(): Collection[];
  getProductsForCollection(
    collectionSlug: string,
    filters?: ProductFilterState
  ): Product[];
  searchProducts(query: string, filters?: ProductFilterState): Product[];
  getRecommendationsForProduct(productId: string, limit?: number): Product[];
  getCartUpsellProducts(excludeProductIds?: string[], limit?: number): Product[];
}

export interface IReviewService {
  getReviewsForProduct(productId?: string): Review[];
  getAllReviews(): Review[];
}

export interface IPromotionService {
  validatePromoCode(
    code: string,
    subtotal: number
  ): {
    valid: boolean;
    promo?: PromoCode;
    discountAmount: number;
    errorMessage?: string;
  };
}

export interface ICommerceService {
  catalog: ICatalogService;
  reviews: IReviewService;
  promotions: IPromotionService;
}
