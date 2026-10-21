# Storefront and dashboard preview

## Current launch mode

Only the storefront is enabled. `src/config/features.ts` keeps `PRIVATE_AREAS_ENABLED` set to `false`. Middleware returns HTTP 404 for `/admin`, `/account`, `/dashboard` and their nested paths, using the branded not-found screen with **Back to home**. Desktop/mobile account links, the footer admin link, checkout sign-in and order-history links are disconnected. Existing saved account data is retained but is not loaded into the storefront session. Guest checkout and the browser wishlist remain available.

The account screens and complete merchant dashboard implementation are preserved for later activation. To reconnect them later, enable the shared flag after the intended backend services and access controls are ready.

Desktop mega menus share one pointer region with a short close delay, keyboard access, Escape dismissal, backdrop dismissal and route-change cleanup. The pink Festival Sale option appears only within an open dropdown, without a permanent sale bar or a layout shift. Its collection uses existing products whose original prices exceed their current prices. Existing collection load-more increments, sorting and filters are unchanged.

Run `npm install`, then `npm run dev` and visit `http://localhost:3000`.

- `/` — campaign homepage, category tiles, gifting, product carousels, reviews and community gallery.
- `/collections/new-arrivals`, `/collections/shop-all`, `/collections/statement-rings` — responsive four-column desktop and two-column mobile catalogues, filters, sorting and load more.
- `/products/dome-huggie-hoop-earrings` — editorial gallery, zoom, finishes, quantities, wishlist, product details and bag drawer.
- `/account/login`, `/account/register`, `/account/recover` — account entry screens using the supplied visual direction.
- `/account` — overview, order details, wishlist, profile editing and saved delivery address.
- `/admin` — merchant overview, order fulfilment, searchable and paginated products, price/stock/visibility editing, customers, CSV exports, discount creation and store settings.
- `/checkout` — address validation, shipping methods, promotions and simulated order confirmation.
- `/pages/faq`, `/pages/shipping`, `/pages/care`, `/pages/contact`, `/pages/privacy`, `/pages/terms` — working customer-care destinations.

The browser stores all preview data locally. Login accepts any nonempty sample identifier and password. Passwords and payment credentials are never saved or transmitted. Profile details survive logging out and signing in with the same identifier. The admin is an explicitly labelled demo and has no production access control. Checkout creates a local order without charging money; recovery does not send email; the contact form saves a local draft. Connect real authentication, authorisation, payments, fulfilment and messaging services before a live launch.

Photography is online sample imagery from the public J&CO. website matching the supplied references. URL mappings are in `src/mocks/photos.json`; the shared resolver is `src/lib/artwork.ts`. Some sample variants use the closest available jewellery photograph. Replace these with the merchant’s final assets before publication.

Admin product edits update catalogue and variant prices, stock, search and availability filters. Archiving is reversible in the product editor. Discount codes created in the admin work at checkout. Order fulfilment status appears in the customer account. Settings update the announcement and footer store name when returning to the storefront.

Validation commands: `npm run typecheck`, `npm test`, `npm run build`.
