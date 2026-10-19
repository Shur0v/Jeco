/**
 * Playwright End-to-End Browser Test Specification
 * Target: J&CO. Jewellery Storefront (Next.js App Router)
 */

export const E2E_USER_JOURNEYS = [
  {
    name: 'Homepage & Mega Menu Navigation',
    steps: [
      'Visit / and verify announcement bar ("Free Shipping on Orders $60 USD+") and sticky header render',
      'Hover over SHOP and 14K GOLD mega menu triggers and verify category/material links',
      'Click through to /collections/statement-rings and verify collection hero and product count',
    ],
  },
  {
    name: 'Catalog Filtering, Sorting, and Product Variant Selection to Cart',
    steps: [
      'Navigate to /collections/new-arrivals',
      'Toggle "In stock only" filter and sort by "Price: Low to High"',
      'Open /products/dome-huggie-hoop-earrings',
      'Switch finish swatch between Gold and Silver and verify gallery and variant SKU update',
      'Click ADD TO BAG and verify slide-over CartDrawer opens with free shipping and free gift progress bars',
    ],
  },
  {
    name: 'Simulated Checkout & Permissive Demo Authentication',
    steps: [
      'Navigate to /checkout from CartDrawer',
      'Apply promo code WELCOME10 and verify 10% discount calculation',
      'Complete shipping address form and submit with "Demo Payment — No Charge"',
      'Verify redirect to /checkout/success with generated Demo Order number',
      'Navigate to /account/login, enter any non-empty user ID and any non-empty password, and verify redirect to /account with order history',
    ],
  },
];
