# Routing Architecture

## Implemented App Router Routes

| Route | Route Group | Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `(store)` | `HomepageView` | 14-section editorial luxury storefront homepage |
| `/collections/[slug]` | `(store)` | `CollectionCatalogView` | Dynamic collection catalog (`shop-all`, `new-arrivals`, `statement-rings`, `14k-gold`, etc.) |
| `/products/[slug]` | `(store)` | `ProductDetailView` | 7-image editorial gallery + sticky variant & purchase module |
| `/search` | `(store)` | `SearchPageView` | Full client-side search & sorting page |
| `/cart` | `(store)` | `CartPageView` | Dedicated shopping bag page |
| `/account` | `(store)` | `AccountDashboardView` | Demo customer overview, order history, wishlist, and profile |
| `/account/login` | `(store)` | `LoginView` | Permissive demo login (any non-empty ID & password) |
| `/account/register` | `(store)` | `RegisterView` | Permissive demo registration |
| `/account/recover` | `(store)` | `RecoverView` | Demo password reset simulation |
| `/checkout` | `root` | `CheckoutView` | Distraction-free 2-column simulated checkout |
| `/checkout/success` | `root` | `CheckoutSuccessView` | Demo order confirmation & receipt |
