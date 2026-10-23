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
    description: '20% off orders ৳10,000+',
    discountType: 'percentage',
    value: 20,
    minSubtotal: 10000,
  },
  {
    code: 'SPARKLE15',
    description: '৳1,500 off orders ৳7,500+',
    discountType: 'fixed',
    value: 1500,
    minSubtotal: 7500,
  },
];
