# Test & Verification Plan

## Verification Coverage
1. **TypeScript Static Analysis**: `npx tsc --noEmit`
2. **Next.js Production Build**: `npm run build` (`compile_applet`)
3. **Functional User Journeys**:
   - Browse Homepage -> Open `Shop` & `14K Gold` Mega Menus -> Navigate to `/collections/new-arrivals` & `/collections/statement-rings`.
   - Filter by `In-stock only`, `Material`, `Finish`, and Sort by `Price: Low to High`.
   - Open `/products/dome-huggie-hoop-earrings` -> Switch finish between `Gold` and `Silver` -> Add to Bag -> Verify `CartDrawer` progress bars and upsells.
   - Proceed to `/checkout` -> Apply promo code `WELCOME10` -> Complete simulated demo order -> Verify `/checkout/success` and `/account` Order History.
   - Sign in at `/account/login` with any non-empty User ID and Password -> Verify session persistence and Logout.
