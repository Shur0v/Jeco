import { CurrencyConfig, CurrencyCode, ShippingMethod } from '@/types/commerce';

export const SITE_CONFIG = {
  brandName: 'J&CO.',
  brandSubtitle: 'JEWELLERY',
  fullTitle: 'J&CO. Jewellery — Everyday Luxury & Minimalist Demi-Fine Jewellery',
  description:
    'Thoughtfully crafted 14K solid gold, gold filled, sterling silver, flatback piercings, huggie hoops, statement rings, and personalized jewellery for 24/7 comfort.',
  announcementMessages: [
    'Free Shipping On Orders ৳6,000+',
    'Spend ৳12,000+ to Receive a Complimentary Jewellery Travel Case',
    'Gentle on Sensitive Skin · 14K Solid Gold, Gold Filled & 925 Sterling Silver',
  ],
  freeShippingThresholdBDT: 6000,
  freeGiftThresholdBDT: 12000,
};

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BDT: { code: 'BDT', symbol: '৳', label: 'BD (BDT ৳)', rateFromUSD: 1 },
  USD: { code: 'USD', symbol: '$', label: 'US (USD $)', rateFromUSD: 1 },
  CAD: { code: 'CAD', symbol: '$', label: 'CA (CAD $)', rateFromUSD: 1.36 },
  EUR: { code: 'EUR', symbol: '€', label: 'EU (EUR €)', rateFromUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', label: 'UK (GBP £)', rateFromUSD: 0.79 },
  AUD: { code: 'AUD', symbol: '$', label: 'AU (AUD $)', rateFromUSD: 1.52 },
  SGD: { code: 'SGD', symbol: '$', label: 'SG (SGD $)', rateFromUSD: 1.34 },
};

export interface NavItem {
  label: string;
  href: string;
  megaMenuType?: 'shop' | '14k-gold' | 'earrings';
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Shop', href: '/collections/shop-all', megaMenuType: 'shop' },
  { label: 'New Arrival', href: '/collections/new-arrivals' },
  { label: 'Best Seller', href: '/collections/best-sellers' },
  { label: 'Earrings', href: '/collections/earrings', megaMenuType: 'earrings' },
  { label: 'Open Huggies', href: '/collections/open-huggies' },
  { label: 'Hoop Earrings', href: '/collections/hoop-earrings' },
  { label: 'Piercings', href: '/collections/piercings' },
  { label: 'Flatback', href: '/collections/flatback' },
  { label: 'Rings', href: '/collections/rings' },
  { label: 'Personalized', href: '/collections/personalized' },
  { label: 'Handmade', href: '/collections/handmade' },
  { label: '14K Gold', href: '/collections/14k-gold', megaMenuType: '14k-gold' },
  { label: 'Diamond', href: '/collections/diamond' },
];

export const SHOP_MEGA_MENU = {
  discover: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Best Seller', href: '/collections/best-sellers' },
    { label: 'Luxury', href: '/collections/14k-gold' },
    { label: 'Diamond', href: '/collections/diamond' },
    { label: 'Statement Rings', href: '/collections/statement-rings' },
  ],
  byCategoryCol1: [
    { label: 'Earrings', href: '/collections/earrings' },
    { label: 'Studs', href: '/collections/studs' },
    { label: 'Necklaces', href: '/collections/necklaces' },
    { label: 'Anklets', href: '/collections/anklets' },
    { label: 'Others', href: '/collections/accessories' },
  ],
  byCategoryCol2: [
    { label: 'Piercings', href: '/collections/piercings' },
    { label: 'Rings', href: '/collections/rings' },
    { label: 'Bracelets', href: '/collections/bracelets' },
    { label: 'Personalize', href: '/collections/personalized' },
  ],
  byMaterial: [
    { label: '14K Solid Gold', href: '/collections/14k-gold' },
    { label: 'Diamond', href: '/collections/diamond' },
    { label: 'Sterling Silver', href: '/collections/sterling-silver' },
    { label: 'Gold Filled', href: '/collections/gold-filled' },
  ],
};

export const GOLD_14K_MEGA_MENU = {
  byCategory: [
    { label: 'All', href: '/collections/14k-gold' },
    { label: '14K Gold Flatback', href: '/collections/flatback' },
    { label: '14K Gold Piercings', href: '/collections/piercings' },
    { label: '14K Gold Studs', href: '/collections/studs' },
    { label: '14K Gold Hoops', href: '/collections/hoop-earrings' },
    { label: '14K Gold Earrings', href: '/collections/earrings' },
    { label: '14K Gold Necklaces', href: '/collections/necklaces' },
    { label: '14K Gold Rings', href: '/collections/rings' },
  ],
  byCollection: [
    { label: 'AdoreMe', href: '/collections/best-sellers' },
    { label: 'In Bloom', href: '/collections/new-arrivals' },
    { label: 'Celestial', href: '/collections/piercings' },
    { label: 'Baby Diamond', href: '/collections/diamond' },
  ],
  byMaterial: [
    { label: '14K Yellow Gold', href: '/collections/14k-gold?finish=Yellow+Gold' },
    { label: '14K White Gold', href: '/collections/14k-gold?finish=White+Gold' },
    { label: 'Diamond', href: '/collections/diamond' },
  ],
};

export const EARRINGS_MEGA_MENU = {
  discover: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Best Sellers', href: '/collections/best-sellers' },
    { label: '14K Gold Earrings', href: '/collections/14k-gold' },
    { label: 'Diamond', href: '/collections/diamond' },
  ],
  byCategoryCol1: [
    { label: 'All Earrings', href: '/collections/earrings' },
    { label: 'Studs', href: '/collections/studs' },
    { label: 'Open Huggies', href: '/collections/open-huggies' },
    { label: 'Hoop Earrings', href: '/collections/hoop-earrings' },
  ],
  byCategoryCol2: [
    { label: 'Huggie Earrings', href: '/collections/huggie-earrings' },
    { label: 'Flatback Earrings', href: '/collections/flatback' },
    { label: 'Piercings', href: '/collections/piercings' },
  ],
  byMaterial: SHOP_MEGA_MENU.byMaterial,
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Tracked Shipping',
    description: 'Complimentary on orders ৳6,000+',
    estimatedDays: '4–7 business days',
    price: 100,
    freeOverSubtotal: 6000,
  },
  {
    id: 'express',
    name: 'DHL Express Priority',
    description: 'Signature delivery with full insurance',
    estimatedDays: '2–3 business days',
    price: 200,
  },
  {
    id: 'next-day',
    name: 'Overnight Courier',
    description: 'Next business day air delivery',
    estimatedDays: '1 business day',
    price: 300,
  },
];

export const FOOTER_LINKS = {
  help: [
    { label: 'FAQ', href: '/pages/faq' },
    { label: 'Shipping & Delivery', href: '/pages/shipping' },
    { label: 'Contact us', href: '/pages/contact' },
    { label: 'Materials and Care', href: '/pages/care' },
    { label: 'Ring Sizer', href: '/products/finger-ring-sizer-tool' },
  ],
  about: [
    { label: 'Our Story', href: '/#story' },
    { label: 'Our Handmade Products', href: '/collections/handmade' },
    { label: 'Visit our Showroom', href: '/#showroom' },
    { label: 'Our Community', href: '/#reviews' },
  ],
};
