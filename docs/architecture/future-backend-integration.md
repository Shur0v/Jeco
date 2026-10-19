# Future Backend Integration Guide

To transition this frontend from local mock adapters to a production commerce backend (e.g., Shopify Storefront GraphQL API, Medusa, or custom headless API):

1. **Implement a Production Adapter**: Create `src/commerce/adapters/production/index.ts` implementing `ICommerceService` (`ICatalogService`, `IReviewService`, `IPromotionService`).
2. **Switch Factory Binding**: Update `src/commerce/factory.ts` to instantiate the production adapter based on environment configuration.
3. **Replace Demo Auth & Checkout**: Connect `loginDemo`, `registerDemo`, and `CheckoutView` submission handlers to real OAuth/JWT endpoints and a PCI-compliant payment processor (e.g., Stripe Elements or Shopify Checkout).
