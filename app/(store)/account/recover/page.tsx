import React from 'react';
import type { Metadata } from 'next';
import { RecoverView } from '@/features/auth/RecoverView';

export const metadata: Metadata = {
  title: 'Reset Password | J&CO. Jewellery',
  description: 'Reset your J&CO. Jewellery demo account password.',
};

export default function RecoverPage() {
  return <RecoverView />;
}
