# Mock Services Architecture

## Contracts (`src/commerce/contracts/index.ts`)
- `ICatalogService`: Queries products, collections, recommendations, search, and cart upsells.
- `IReviewService`: Queries product and store-wide reviews.
- `IPromotionService`: Validates promotional codes (`WELCOME10`, `JCO20`, `SPARKLE15`) against cart subtotals.

## Adapter (`src/commerce/adapters/mock/index.ts`)
Implements `ICommerceService` over deterministic in-memory datasets in `src/mocks/`.
