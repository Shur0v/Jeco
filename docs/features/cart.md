# Cart System Specification

1. **Purpose**: Manage shopping bag items, quantities, free shipping ($60 USD) and free gift ($120 USD) progress bars, and cross-sell accessories.
2. **Surfaces**:
   - Slide-over `CartDrawer` (`YOUR BAG (N)`)
   - Dedicated `/cart` page (`CartPageView`)
3. **Persistence**: Synchronized in `localStorage` (`jco_demo_cart_v1`).
4. **Upsells**: Displays `Titanium Piercing Insertion Tool Set`, `Jco Jewelry Polishing Cloth`, and `Finger Ring Sizer` with 1-click quick-add buttons.
