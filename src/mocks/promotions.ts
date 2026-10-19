import { PromoCode } from '@/types/commerce';

export const MOCK_PROMO_CODES: PromoCode[] = [
  {
    code: 'WELCOME10',
    description: '10% off your first demo order',
    discountType: 'percentage',
    value: 10,
    minSubtotal: 0,
  },
  {
    code: 'JCO20',
    description: '20% off orders $100 USD+',
    discountType: 'percentage',
    value: 20,
    minSubtotal: 100,
  },
  {
    code: 'SPARKLE15',
    description: '$15 USD off orders $75 USD+',
    discountType: 'fixed',
    value: 15,
    minSubtotal: 75,
  },
];
