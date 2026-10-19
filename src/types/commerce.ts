export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'AUD' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateFromUSD: number;
}

export type JewelleryCategory =
  | 'earrings'
  | 'huggie-earrings'
  | 'open-huggies'
  | 'hoop-earrings'
  | 'piercings'
  | 'flatback'
  | 'studs'
  | 'rings'
  | 'statement-rings'
  | 'necklaces'
  | 'bracelets'
  | 'anklets'
  | 'personalized'
  | 'accessories';

export type JewelleryMaterial =
  | '14K Solid Gold'
  | 'Gold Filled'
  | 'Sterling Silver'
  | '18K Gold Vermeil'
  | 'Titanium'
  | 'Diamond'
  | 'Accessory';

export type MetalFinish =
  | 'Gold'
  | 'Silver'
  | 'Rose Gold'
  | 'White Gold'
  | 'Yellow Gold'
  | 'Silver/Gold';

export type ProductBadge =
  | 'NEW ARRIVAL'
  | 'BEST SELLER'
  | 'PIERCING'
  | '14K GOLD'
  | 'GOLD FILLED'
  | 'SOLD OUT'
  | 'SALE';

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  finish: MetalFinish;
  size?: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  stockCount: number;
  imageIndex?: number;
}

export interface ProductVisualSpec {
  shape:
    | 'dome-huggie'
    | 'easy-huggie'
    | 'ball-huggie'
    | 'mini-hoop'
    | 'pave-huggie'
    | 'heart-huggie'
    | 'bezel-huggie'
    | 'bar-open-huggie'
    | 'sparkle-open-huggie'
    | 'star-huggie'
    | 'opal-huggie'
    | 'disc-huggie'
    | 'endless-hoop'
    | 'conch-pave'
    | 'pearl-huggie'
    | 'baguette-open-huggie'
    | 'moon-huggie'
    | 'seashore-hoop'
    | 'french-mixed-hoop'
    | 'round-ball-hoop'
    | 'two-tone-ball-hoop'
    | 'pearly-petal-hoop'
    | 'teardrop-flatback'
    | 'pebble-flatback'
    | 'pear-cz-flatback'
    | 'dangle-pear-flatback'
    | 'micro-bar-flatback'
    | 'pave-heart-flatback'
    | 'flower-diamond-flatback'
    | 'marquise-curve-flatback'
    | 'gradient-cz-flatback'
    | 'sparkly-dangle-flatback'
    | 'trinity-cz-flatback'
    | 'seahorse-flatback'
    | 'pearl-trinity-flatback'
    | 'pearl-cubic-flatback'
    | 'mini-cz-labret'
    | 'ball-tragus-labret'
    | 'bezel-stud'
    | 'ball-stud'
    | 'spike-dome-ring'
    | 'twin-dome-enamel-ring'
    | 'single-enamel-dome-ring'
    | 'ruby-talisman-ring'
    | 'enamel-heart-band-ring'
    | 'sparkle-heart-dome-ring'
    | 'open-heart-band-ring'
    | 'pave-twin-dome-ring'
    | 'twin-dome-mixed-ring'
    | 'chain-ring'
    | 'chain-cz-ring'
    | 'baguette-eternity-ring'
    | 'oval-solitaire-ring'
    | 'skinny-stacking-ring'
    | 'croissant-dome-ring'
    | 'woven-dome-ring'
    | 'butterfly-necklace'
    | 'disc-initial-necklace'
    | 'pendant-necklace'
    | 'layered-chain-necklace'
    | 'pearly-bracelet'
    | 'chain-bracelet'
    | 'insertion-tool'
    | 'polishing-cloth'
    | 'ring-sizer';
  primaryFinish: MetalFinish;
  enamelColor?: string;
  gemColor?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  category: JewelleryCategory;
  collections: string[];
  material: JewelleryMaterial;
  availableFinishes: MetalFinish[];
  variants: ProductVariant[];
  basePrice: number;
  compareAtPrice?: number;
  currency: CurrencyCode;
  images: string[];
  lifestyleImages: string[];
  visualSpec: ProductVisualSpec;
  inStock: boolean;
  tags: string[];
  badges: ProductBadge[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  popularityScore: number;
  rating: number;
  reviewCount: number;
  details: string[];
  dimensions: string;
  careInstructions: string;
  relatedProductIds: string[];
  createdAt: string;
}

export interface SubCollectionBubble {
  id: string;
  title: string;
  slug: string;
  image: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage?: string;
  breadcrumbs: { label: string; href: string }[];
  subCollections?: SubCollectionBubble[];
  featuredInNav?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantTitle: string;
  reviewerName: string;
  reviewerInitials: string;
  verifiedBuyer: boolean;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  avatarImage?: string;
  productThumb?: string;
  helpfulCount: number;
}

export interface CartItem {
  id: string; // `${productId}__${variantId}`
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  finish: MetalFinish;
  size?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image: string;
  maxStock: number;
  giftNote?: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSubtotal: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  freeOverSubtotal?: number;
}

export interface ShippingAddress {
  email: string;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  country: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  giftNote?: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  accountIdentifier?: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  shippingCost: number;
  total: number;
  currency: CurrencyCode;
  paymentMethodLabel: string;
  status: 'Confirmed (Demo)' | 'Preparing Shipment (Demo)';
}

export interface DemoUserSession {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  defaultAddress?: Partial<ShippingAddress>;
  loggedInAt: string;
  isDemoSession: true;
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'best-selling'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc';

export interface ProductFilterState {
  category?: string;
  material?: string;
  finish?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: SortOption;
  query?: string;
}
