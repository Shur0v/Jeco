# Browser Storage Specification

| Storage Key | Scope | Purpose |
| :--- | :--- | :--- |
| `jco_demo_cart_v1` | `localStorage` | Persists active shopping bag items & quantities |
| `jco_demo_wishlist_v1` | `localStorage` | Persists saved wishlist product IDs |
| `jco_demo_recent_v1` | `localStorage` | Persists up to 8 recently viewed product IDs |
| `jco_demo_auth_session_v1` | `localStorage` | Stores harmless demo session marker & user identifier (never stores passwords) |
| `jco_demo_orders_v1` | `localStorage` | Stores simulated checkout order receipts |
| `jco_demo_currency_v1` | `localStorage` | Persists selected display currency (`USD`, `CAD`, `EUR`, `GBP`, `AUD`, `SGD`) |
| `jco_demo_custom_reviews_v1` | `localStorage` | Stores user-submitted demo reviews |
| `jco_demo_newsletter_v1` | `localStorage` | Stores demo newsletter email subscriptions |
| `jco_last_demo_order` | `sessionStorage` | Holds most recent order snapshot for `/checkout/success` |
