# State Management

## StoreProvider (`src/providers/StoreProvider.tsx`)
Central React Context provider accessed via `useStore()`:
- **Cart State**: `cartItems`, `itemCount`, `subtotal`, `freeShippingRemaining`, `freeShippingProgress`, `freeGiftRemaining`, `freeGiftProgress`, `isCartDrawerOpen`.
- **Promotions State**: `appliedPromo`, `discountAmount`, `applyPromoCode`, `removePromoCode`.
- **Wishlist State**: `wishlistIds`, `toggleWishlist`, `isInWishlist`.
- **Recently Viewed State**: `recentlyViewedIds`, `trackProductView`.
- **Demo Session State**: `session`, `loginDemo`, `registerDemo`, `updateDemoProfile`, `logoutDemo`.
- **Order History State**: `orders`, `recordDemoOrder`.
- **UI & Currency State**: `currency`, `setCurrency`, `isSearchOpen`, `toast`, `showToast`.
