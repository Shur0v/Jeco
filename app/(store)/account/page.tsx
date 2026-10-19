import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountDashboardView } from '@/features/auth/AccountDashboardView';

export const metadata: Metadata = {
  title: 'My Account | J&CO. Jewellery',
  description: 'Manage your demo account, order history, and saved wishlist.',
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[13px] text-[#777777]">
          Loading account...
        </div>
      }
    >
      <AccountDashboardView />
    </Suspense>
  );
}
