import React from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/features/auth/LoginView';

export const metadata: Metadata = {
  title: 'Log In | J&CO. Jewellery',
  description: 'Sign in to your J&CO. Jewellery demo account.',
};

export default function LoginPage() {
  return <LoginView />;
}
