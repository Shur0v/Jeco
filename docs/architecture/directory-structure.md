# Directory Structure

```text
/
├── app/
│   ├── (store)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── collections/[slug]/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── cart/page.tsx
│   │   └── account/
│   │       ├── page.tsx
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       └── recover/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── layout/          # AnnouncementBar, Header, Footer
│   │   ├── navigation/      # MegaMenu, MobileNavDrawer
│   │   └── shared/          # ProductCard, ToastContainer
│   ├── features/
│   │   ├── homepage/        # HomepageView
│   │   ├── catalog/         # CollectionCatalogView
│   │   ├── product/         # ProductDetailView
│   │   ├── search/          # SearchOverlay, SearchPageView
│   │   ├── cart/            # CartDrawer, CartPageView
│   │   ├── checkout/        # CheckoutView, CheckoutSuccessView
│   │   ├── auth/            # LoginView, RegisterView, RecoverView, AccountDashboardView
│   │   ├── reviews/         # ReviewsSection
│   │   └── recommendations/ # RecentlyViewedSection
│   ├── commerce/
│   │   ├── contracts/       # ICatalogService, IReviewService, IPromotionService
│   │   ├── adapters/mock/   # MockCommerceAdapter
│   │   ├── factory.ts
│   │   └── index.ts
│   ├── mocks/               # products.ts, collections.ts, reviews.ts, banners.ts, promotions.ts
│   ├── providers/           # StoreProvider.tsx
│   ├── hooks/               # useStore.ts
│   ├── lib/                 # artwork.ts, format.ts
│   ├── types/               # commerce.ts
│   └── config/              # site.ts, design-tokens.ts
└── docs/                    # Complete architecture & feature documentation
```
