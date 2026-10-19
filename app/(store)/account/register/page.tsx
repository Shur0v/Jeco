import React from 'react';
import type { Metadata } from 'next';
import { RegisterView } from '@/features/auth/RegisterView';

export const metadata: Metadata = {
  title: 'Create an Account | J&CO. Jewellery',
  description: 'Create a J&CO. Jewellery demo account.',
};

export default function RegisterPage() {
  return <RegisterView />;
}
