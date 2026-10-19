# Homepage Feature Specification

1. **Purpose**: Present the complete editorial jewellery storefront experience following the 14-section reference sequence.
2. **Route**: `/` (`app/(store)/page.tsx`)
3. **Components**: `HomepageView`, `ProductCard`, `ReviewsSection`.
4. **Data Models & Mock Sources**: `HOMEPAGE_CONTENT` (`src/mocks/banners.ts`), `MOCK_PRODUCTS` (`src/mocks/products.ts`).
5. **Interactive Capabilities**:
   - Tabbed `NEW ARRIVALS` carousel (`Piercing`, `14K Gold`, `Earrings`, `All`) with previous/next controls.
   - Tabbed `BEST SELLERS` carousel (`14K Gold`, `Earrings`, `Rings`, `Necklaces`, `All`).
   - Interactive finish swatches and quick-add buttons on every product card.
6. **Responsive & Accessibility**: 2-column product grid on mobile, 4-column on desktop; semantic `<section>` landmarks and ARIA labels.
