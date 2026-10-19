# Filters & Search Specification

1. **Purpose**: Instant client-side search across product titles, materials, categories, and tags.
2. **Routes & Surfaces**:
   - Header `SearchOverlay` modal with debounced live suggestions and popular quick-filter chips.
   - Dedicated `/search` page (`SearchPageView`) with full sorting controls.
3. **Data Source**: `commerceService.catalog.searchProducts(query, filters)`.
