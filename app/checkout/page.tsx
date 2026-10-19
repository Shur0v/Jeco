import React from 'react';
import type { Metadata } from 'next';
import { CheckoutView } from '@/features/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout (Demo Simulation) | J&CO. Jewellery',
  description: 'Simulated luxury jewellery checkout experience.',
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
