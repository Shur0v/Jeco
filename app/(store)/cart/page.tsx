import React from 'react';
import type { Metadata } from 'next';
import { CartPageView } from '@/features/cart/CartPageView';

export const metadata: Metadata = {
  title: 'Your Shopping Bag | J&CO. Jewellery',
  description: 'Review the jewellery pieces in your J&CO. shopping bag.',
};

export default function CartPage() {
  return <CartPageView />;
}
