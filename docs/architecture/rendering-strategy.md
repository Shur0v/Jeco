# Rendering Strategy

## Server vs. Client Components
- **Server Components**: Root and route-group layouts (`app/layout.tsx`, `app/(store)/layout.tsx`), route entry points (`app/(store)/collections/[slug]/page.tsx`, `app/(store)/products/[slug]/page.tsx`), dynamic SEO metadata (`generateMetadata`), and Schema.org JSON-LD payloads.
- **Client Components (`'use client'`)**: Interactive UI surfaces requiring browser state, event listeners, or `localStorage` access (`Header`, `MegaMenu`, `CartDrawer`, `SearchOverlay`, `ProductCard`, `CollectionCatalogView`, `ProductDetailView`, `CheckoutView`, `LoginView`, `RegisterView`, `AccountDashboardView`).
- **Hydration Safety**: All `window.localStorage` reads are deferred inside a `useEffect` in `StoreProvider.tsx` after initial mount to prevent SSR/CSR hydration mismatches.
