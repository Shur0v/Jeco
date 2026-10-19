# Cart & Simulated Checkout Flow

```mermaid
graph LR
  PDP[Product Card / PDP] -->|addToCart| CartStore[StoreProvider Cart]
  CartStore --> Drawer[Slide-Over Cart Drawer]
  CartStore --> CartPage[/cart Page]
  Drawer -->|SECURE CHECKOUT| Checkout[/checkout]
  CartPage -->|SECURE CHECKOUT| Checkout
  Checkout -->|Pay now Demo| Success[/checkout/success]
  Success -->|Persist| OrderHistory[/account Orders Tab]
```

## Calculation Rules
- **Subtotal**: Sum of `item.price * item.quantity` across all `cartItems`.
- **Free Shipping Threshold**: `$60.00 USD` (`Standard Tracked Shipping` becomes `$0.00` automatically).
- **Free Gift Threshold**: `$120.00 USD` (Unlocks complimentary Jewellery Travel Case progress bar).
- **Promo Codes**: `WELCOME10` (10% off), `JCO20` (20% off $100+), `SPARKLE15` ($15 off $75+).
