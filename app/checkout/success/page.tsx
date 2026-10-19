import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutSuccessView } from '@/features/checkout/CheckoutSuccessView';

export const metadata: Metadata = {
  title: 'Order Confirmed (Demo) | J&CO. Jewellery',
  description: 'Demonstration order confirmation receipt.',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[13px] text-[#777777]">
          Loading order confirmation...
        </div>
      }
    >
      <CheckoutSuccessView />
    </Suspense>
  );
}
