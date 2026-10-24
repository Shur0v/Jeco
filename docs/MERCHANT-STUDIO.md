# J&CO. merchant studio and connected browser preview

The interactive frontend preview is available at `/admin`. Panels use `/admin?tab=overview`, `orders`, `payments`, `products`, `inventory`, `statistics`, `customers`, `categories`, `homepage`, `discounts`, `documentation`, or `settings`. Navigation supports shareable URLs and back/forward without document reloads.

## Data ownership

IndexedDB `jco-merchant-preview` uses physical schema version 3. `browser-db.ts` provides transactional storage. MerchantState retains shape version 2 for compatibility; backup format has its own version 1.

- `entities`: complete catalog records plus categories, menus, content, settings, orders and inventory records. Existing catalog products are seeded once as ordinary editable records, retaining IDs and overrides.
- `media`: content-addressed uploaded media. Product/content records reference media IDs rather than containing repeated bytes.
- `shopper`: customer profiles/addresses/wishlists, cart, recent views, custom reviews, newsletter and contact messages.
- `records`: entity manifest, separate capped analytics events and migration markers. Previous state remains available as a migration recovery source.

The migration preserves existing data and legacy USD order snapshots, while BDT remains the only current storefront currency. Empty discount lists are preserved. Corrupt migrations and failed writes report errors instead of silently resetting data. Queued merchant writes and Web Locks serialize operations; BroadcastChannel updates other tabs. Customer profiles merge changed fields into current saved records. Shopper writes expose pending/errors and roll back to committed values when persistence fails. No password is stored.

`src/commerce/contracts/domain.ts` defines domain service interfaces. `browser-services.ts` implements the current catalog, customer, cart, order, inventory, payment, promotion, content, media and analytics boundaries. Screens call these services for product saves, media, checkout, click capture, inventory and homepage publication. Complex local configuration/order editors still use merchant command orchestration; future server integration must map these commands to authenticated APIs.

## Owner workflows

- Products: immutable IDs, stable existing slugs on rename, unique slug/SKU guards, ordered media/alt text, variant images/prices/costs/stock, personalization, flags and publication. Image reordering/removal preserves variant image ownership. Order-linked products are archived instead of erased.
- Inventory: variant quantities, thresholds, reasoned adjustments and history; stale adjustment conflicts. Successful demo checkout checks price and quantity and atomically commits stock/order changes once per order ID.
- Orders/payments: separate fulfillment/payment/return states, bKash/Nagad simulation, tracking/notes, partial/full refunds, explicit one-time restocking, timeline, print and CSV. Historical item/address/price snapshots remain independent of current product edits.
- Customers: shared registered profiles and historical customers; cards show known wishlist/active-order counts. Profile/address edits appear across tabs. Duplicate registrations preserve the existing account by directing users to mock login.
- Categories/menus: visual tree, parent links and ordering; deletion guards all product references, children and menu destinations. Publishing updates desktop/mobile navigation. Category renames retain previous URL aliases and migrate collection assignments, while product flag changes synchronize reserved collection membership.
- Homepage: real storefront component canvas; desktop/mobile preview; media, section links/content, manual/automatic rows, marquee and review intervals. Draft/publish and undo/reset remain explicit.
- Discounts/sales: targeted scheduled coupons; campaign layout, hover/always mode, height/color/background and isolated preview.
- Statistics: browser-only observed data, separate sample week, charts/rankings, named button activity and chronological events. Breadcrumbs represent page → section → action. Both tables paginate at 25 rows, support filters/exports and drilldown. Old breadcrumbs remain Unavailable. The latest 20,000 events are retained; reports use Asia/Dhaka days.
- Settings: shared shipping thresholds/provider flags/content and full local backup export/import/reset. Import validates references before replacement. Import/reset is transactional, confirmed, and reloads other tabs. Backups contain personal preview data and should be kept private.

## Media and performance

`public/media` holds optimized local WebP imagery; `asset-map.json` maps original URLs, including persisted older image references. Run `node scripts/optimize-assets.cjs` to prepare assets and update `docs/asset-audit.json`. All generated image files are below 1,000,000 bytes with neither dimension exceeding 1300px. Six missing original remote images use disclosed fallbacks from their own product photo groups. Animated GIF sources use static posters.

New image uploads are resized/recompressed in the browser with aspect ratio/transparency preserved. Input caps are 5 MB for product images and 25 MB for homepage media; optimized image output is below 1 MB. MP4 video remains a separate 25 MB workflow. Hero loading is prioritized, lower imagery is lazy, and analytics-only updates do not rerender public catalog subscribers.

## Production boundary

This remains a browser-local frontend preview. There is no shared database, production authorization, real gateway charge, external email delivery or cross-visitor analytics. Browser-created product/category routes resolve after hydration and require a shared server catalog for production metadata and other devices. PostgreSQL, media hosting, verified webhooks, real sessions/roles and VPS deployment belong to the next phase.

The detailed PostgreSQL/API/VPS handoff and local agent instructions are intentionally excluded from Git. Keep those local documents current after functional/logical changes.

## Verification

Run `npm test`, `npm run typecheck` and `npm run build`. Tests cover catalog migration/editing, media ownership, stock/order idempotency, financial totals, discount eligibility, analytics grouping, local persistence rollback, backup validation/atomic aborts and every mapped image's dimensions/byte size. See `docs/testing/connected-preview-checklist.md` for browser evidence.
