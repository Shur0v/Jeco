'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { getEditorialBannerSvg } from '@/lib/artwork';

export function LoginView() {
  const router = useRouter();
  useEffect(() => { router.prefetch('/account'); }, [router]);
  const { loginDemo } = useStore();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await loginDemo(userId, password);
    if (!result.success) {
      setError(
        result.error || 'Please enter both a User ID / Email and Password.'
      );
      return;
    }
    router.replace('/account');
  }

  return (
    <div className="bg-white">
      <div className="auth-layout grid grid-cols-1 lg:grid-cols-2">
        {/* Left Editorial Heart Hands Ring Visual (Matches Screenshot 10 100%) */}
        <div className="auth-visual relative bg-[#EDE3DA] overflow-hidden">
          <img
            src={getEditorialBannerSvg('auth-heart-hands')}
            alt="Hands forming a heart wearing delicate gold stacking rings"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Panel (Matches Screenshot 10 100%) */}
        <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-14">
          <div className="w-full max-w-[450px]">
            <h1 className="text-[28px] sm:text-[34px] tracking-[0.04em] uppercase font-medium text-[#292929] text-center mb-6">
              LOG IN
            </h1>

            <form onSubmit={handleLogin} noValidate className="space-y-3.5">
              <div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Email"
                  aria-label="Email or User ID"
                  className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  aria-label="Password"
                  className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-[12px] text-[#9E2A2B] pt-0.5"
                >
                  {error}
                </p>
              )}

              <div className="pt-0.5 pb-2">
                <Link
                  href="/account/recover"
                  className="text-[11.5px] text-[#292929] underline hover:text-[#777777]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium py-3.5 transition-colors cursor-pointer"
              >
                LOG IN
              </button>
            <p className="demo-caption">Preview account · Use sample credentials only.</p></form>

            <p className="mt-5 text-center text-[11.5px] text-[#292929]">
              Don&apos;t have an account?{' '}
              <Link
                href="/account/register"
                className="underline hover:text-[#777777]"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
