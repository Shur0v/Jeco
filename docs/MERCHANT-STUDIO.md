# J&CO. merchant studio

The interactive frontend preview is available at `/admin`. Panels use `/admin?tab=overview`, `orders`, `payments`, `products`, `inventory`, `statistics`, `customers`, `categories`, `homepage`, `discounts`, `documentation`, or `settings`. Navigation uses Next.js-integrated browser history without document reloads.

## Data and persistence

`src/lib/merchant-store.ts` owns the versioned browser data model and replaceable persistence boundary. IndexedDB database `jco-merchant-preview` stores catalog records, uploaded image/video data, published navigation/homepage configuration, orders, payment details, stock adjustments and events. Changes are committed only after the transaction succeeds. A queued write path and Web Locks serialize same-browser writes; BroadcastChannel refreshes other open tabs. Upload limits are 5 MB for images and 25 MB for homepage media. Media is local to this browser and origin.

Existing catalog overrides are migrated when initializing the merchant store. Customer sessions/profiles and legacy local orders are retained. The catalog seeds sample BDT prices and exposes BDT as the only storefront currency. Legacy USD orders retain their purchase-time figures and are excluded from BDT summaries. Sample overview/order/customer data and sample statistics are explicitly separated from observed data.

The catalog adapter merges seed and merchant-created records before filtering. Product routes resolve browser records after hydration rather than rejecting unknown local slugs on the server. Production SEO for browser-created products requires a shared server catalog later.

## Owner workflows

- Products: permanent ID, unique slug/SKU validation, variants, pricing, images, category/subcategory, costs, personalization, product flags, draft/published/archived state, duplication and guarded deletion. Order-linked records are archived rather than erased. Product forms warn about unsaved changes.
- Inventory: per-variant quantities and availability, low-stock thresholds, reasoned adjustments and history. Demo checkout checks current stock/prices and commits the order and stock deductions together. Duplicate order IDs do not deduct twice.
- Orders/payments: separate fulfillment, payment and return states; bKash/Nagad simulation; courier/tracking/notes; partial/full simulated refunds; explicit one-time restocking; history, print view and CSV exports. No real gateway request or real charge occurs.
- Customers: cards with active-order and known-wishlist counts, with profile/order/address/payment/note tabs. A dash means another customer's wishlist is unavailable in the local dataset, rather than a fabricated zero.
- Categories/menus: two-level visual tree, click-to-connect selectors, ordering controls and leaf drag connections. Deletion checks all products, including drafts/archives, child categories and menu destinations. A three-second clickable alert opens a linked product. Publishing updates both desktop and mobile storefront navigation.
- Homepage: shares actual storefront sections inside a desktop/mobile editing canvas. Media, hero slides, gallery, product sources, campaign copy/links, marquee and content-review intervals are editable. Draft changes are separate until Publish. Review intervals create dashboard reminders, not automatic scheduled publishing.
- Discounts/sales: targeted codes with dates, minimum spend and usage limits; campaign placement/layout, hover preview, 28–52 px height (40 px baseline), hex/color picker and background image. Checkout validates scope and computes discounts against eligible cart lines.
- Documentation: searchable topic workflows, connected steps, hover/focus tips and links to each workspace screen.

## Analytics

One capture listener records storefront click activations, including non-link areas, without recording nested handlers twice. Page/product views are separate. Events use permanent product IDs, path without query values, section/category references and fixed safe labels. Admin routes and form input contents are excluded. Observed traffic is from this browser only; the latest 20,000 events are retained for this preview. Sample statistics are generated separately and never added to observed events. Reports use Asia/Dhaka calendar days and show zero-activity days.

## Production boundary

This is not an authenticated production administration system. Shared databases, hosted media, roles/permissions, secure gateway verification/webhooks, remote analytics, transactional emails and accounting reconciliation remain integration work. Store settings deliberately do not collect live payment credentials. Do not treat local preview records or sample dashboards as real business accounts.

## Verification

Run `npm test`, `npm run typecheck` and `npm run build`. The merchant tests exercise catalog creation/filtering, unique slugs/SKUs, category deletion constraints, persistence rollback, idempotent stock deductions, payment totals, discount eligibility and stable product IDs. Browser checks should cover uploaded-product publish/refresh/checkout, cross-tab orders, category alerts, homepage publishing, sale preview/color selection, customer modals, statistics, keyboard navigation and mobile sidebar behavior.
