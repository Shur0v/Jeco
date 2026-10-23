# Storefront and dashboard preview

## Current launch mode

The storefront, customer dashboard and merchant dashboard are enabled. `src/config/features.ts` sets `PRIVATE_AREAS_ENABLED` to `true`, reconnecting the storefront account icon, mobile login/registration link, footer admin link and checkout account links. `/account` and `/admin` are the dashboard entry points; unrelated or nonexistent routes still return the branded 404 page.

Login accepts any nonempty mock identifier and password. Registration accepts mock names, an identifier/email and password without requiring a real email address. Both forms immediately replace the auth route with `/account`. These remain browser-local preview sessions, not production authentication.

Both dashboards render their panels from already-loaded React components. `src/hooks/useDashboardNavigation.ts` updates the `?tab=` query with the native History API, integrated with Next.js `useSearchParams`, without a document reload or server-component navigation. Direct tab links, refresh and browser Back/Forward preserve the selected panel. Examples: `/account?tab=orders`, `/account?tab=profile`, `/admin?tab=products`, `/admin?tab=settings`.

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
