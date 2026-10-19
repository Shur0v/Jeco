# Simulated Checkout Specification

1. **Purpose**: Realistic 2-column checkout experience with React Hook Form + Zod validation, shipping method selection, promo codes, and safe no-charge payment simulation.
2. **Routes**: `/checkout` (`CheckoutView`) and `/checkout/success` (`CheckoutSuccessView`).
3. **Promo Codes**: `WELCOME10` (10% off), `JCO20` (20% off $100+), `SPARKLE15` ($15 off $75+).
4. **Demo Safety**: Explicitly displays `"Demo Payment — No Charge"` and never collects real credit card numbers or CVV values.
