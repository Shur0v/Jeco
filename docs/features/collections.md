# Collections & Catalog Specification

1. **Purpose**: Browse category and material collections with client-side filtering, sorting, URL parameter synchronization, and Load More pagination.
2. **Routes**: `/collections/[slug]` (`shop-all`, `new-arrivals`, `best-sellers`, `statement-rings`, `earrings`, `open-huggies`, `huggie-earrings`, `hoop-earrings`, `piercings`, `flatback`, `studs`, `rings`, `necklaces`, `bracelets`, `anklets`, `personalized`, `handmade`, `14k-gold`, `gold-filled`, `sterling-silver`, `diamond`, `accessories`).
3. **Components**: `CollectionCatalogView`, `ProductCard`, `RecentlyViewedSection`.
4. **Filtering & Sorting**:
   - In-stock only toggle (`Show only in-stock items`)
   - Material filter (`14K Solid Gold`, `Gold Filled`, `Sterling Silver`, `Titanium`, `Diamond`)
   - Metal Finish filter (`Gold`, `Silver`, `Rose Gold`, `White Gold`, `Yellow Gold`)
   - Max Price slider
   - Sort options (`featured`, `best-selling`, `newest`, `price-asc`, `price-desc`, `name-asc`).
