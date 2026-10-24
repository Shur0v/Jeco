# Connected preview verification — 2026-10-24

Automated checks: 53 tests across 8 files; TypeScript check. Production build passed with all 21 static pages generated. Standalone production Statistics loaded with zero captured console errors; public/admin/account/checkout routes returned HTTP 200.

| Workflow | Verification |
| --- | --- |
| All 12 admin screens | Opened through client navigation; correct heading and connected data |
| Existing catalog migration | 111 editable records in this browser (110 seed products + earlier custom product); permanent IDs retained |
| Exact product update | Renamed prior custom product, explicitly restored original slug; product URL refresh displayed the new name |
| Customer registration | Mock account persisted, redirected to account, appeared in other-tab customer cards |
| Customer address | Saved Dhaka address, displayed in admin customer modal and prefilled checkout |
| Checkout/payment/order | Simulated bKash order JCO-557092 for BDT 1600 appeared in other-tab orders with correct customer/product snapshot |
| Financial preservation | Prior Nagad receipt/refund and legacy USD record retained separately; legacy excluded from BDT totals |
| Analytics | Exactly 26 wishlist activations produced aggregate count 26 and Rings → Features → Wishlist; event pages showed 25 then 1 |
| Backup | Complete JSON backup downloaded from Settings; import validation and atomic rollback tested automatically |
| Media | Every mapped local image checked with Sharp: encoded size <1,000,000 bytes; width/height <=1300px; missing-source fallbacks disclosed |
| Responsive | 390px viewport: homepage and Statistics had 375px document width without page overflow; viewport reset afterward |
| Existing guards | Category dependencies, publication, discount eligibility, duplicate order IDs and inventory conflicts retained in automated tests |

Browser preview records are local demo data, not real visitors or charges. Individual menus that were previously exercised remain subject to the automated regression checks; this list does not assert production backend readiness.
