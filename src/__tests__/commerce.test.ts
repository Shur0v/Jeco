import { describe, it, expect } from 'vitest';
import { commerceService } from '../commerce';
import { formatMoney } from '../lib/format';

describe('J&CO. Jewellery Mock Commerce Service & Catalog', () => {
  it('contains 90+ realistic deterministic jewellery products across all major categories', () => {
    const products = commerceService.catalog.getAllProducts();
    expect(products.length).toBeGreaterThanOrEqual(90);

    const slugs = new Set(products.map((p) => p.slug));
    expect(slugs.size).toBe(products.length);
    expect(slugs.has('dome-huggie-hoop-earrings')).toBe(true);
    expect(slugs.has('easy-huggie-hoop-earrings')).toBe(true);
    expect(slugs.has('organic-teardrop-flatback-earring')).toBe(true);
  });

  it('resolves all 16 required collection routes', () => {
    const requiredSlugs = [
      'shop-all',
      'new-arrivals',
      'best-sellers',
      'earrings',
      'hoop-earrings',
      'huggie-earrings',
      'piercings',
      'rings',
      'necklaces',
      'bracelets',
      'personalized',
      '14k-gold',
      'gold-filled',
      'sterling-silver',
      'diamond',
      'statement-rings',
    ];

    for (const slug of requiredSlugs) {
      const collection = commerceService.catalog.getCollectionBySlug(slug);
      expect(collection).toBeDefined();
      const collectionProducts = commerceService.catalog.getProductsForCollection(slug);
      expect(collectionProducts.length).toBeGreaterThan(0);
    }
  });

  it('filters products by material, finish, availability, and sorts accurately', () => {
    const filtered = commerceService.catalog.getProductsForCollection('shop-all', {
      material: '14K Solid Gold',
      inStockOnly: true,
      sortBy: 'price-asc',
    });

    expect(filtered.length).toBeGreaterThan(0);
    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i].basePrice).toBeGreaterThanOrEqual(filtered[i - 1].basePrice);
      expect(filtered[i].material).toBe('14K Solid Gold');
      expect(filtered[i].inStock).toBe(true);
    }
  });

  it('performs live search across product names, categories, and materials', () => {
    const results = commerceService.catalog.searchProducts('huggie');
    expect(results.length).toBeGreaterThan(3);
    expect(results.some((p) => p.slug === 'dome-huggie-hoop-earrings')).toBe(true);
  });

  it('validates promo codes and calculates percentage and fixed discounts', () => {
    const valid10 = commerceService.promotions.validatePromoCode('WELCOME10', 100);
    expect(valid10.valid).toBe(true);
    expect(valid10.discountAmount).toBe(10);

    const flat15 = commerceService.promotions.validatePromoCode('SPARKLE15', 120);
    expect(flat15.valid).toBe(true);
    expect(flat15.discountAmount).toBe(15);

    const invalid = commerceService.promotions.validatePromoCode('NOTACODE', 100);
    expect(invalid.valid).toBe(false);
    expect(invalid.discountAmount).toBe(0);
  });

  it('formats multi-currency prices deterministically', () => {
    expect(formatMoney(59, 'USD')).toBe('$59.00 USD');
    expect(formatMoney(59, 'EUR')).toContain('EUR');
    expect(formatMoney(59, 'GBP')).toContain('GBP');
  });
});
