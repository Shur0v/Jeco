'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getEditorialBannerSvg } from '@/lib/artwork';

export function RegisterView() {
  const router = useRouter();
  useEffect(() => { router.prefetch('/account'); }, [router]);
  const { registerDemo } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await registerDemo({
      firstName,
      lastName,
      birthDate,
      email,
      password,
    });
    if (!res.success) {
      setError(res.error || 'Please complete required fields.');
      return;
    }
    router.replace('/account');
  }

  return (
    <div className="bg-white">
      <div className="auth-layout grid grid-cols-1 lg:grid-cols-2">
        {/* Left Editorial Heart Hands Ring Visual (Matches Screenshot 1 100%) */}
        <div className="auth-visual relative bg-[#EDE3DA] overflow-hidden">
          <img
            src={getEditorialBannerSvg('auth-heart-hands')}
            alt="Hands forming a heart wearing delicate gold stacking rings"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Panel (Matches Screenshot 1 100%) */}
        <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-14">
          <div className="w-full max-w-[450px]">
            <h1 className="text-[28px] sm:text-[34px] tracking-[0.04em] uppercase font-medium text-[#292929] text-center mb-6">
              CREATE AN ACCOUNT
            </h1>

            <form onSubmit={handleRegister} noValidate className="space-y-3.5">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                aria-label="First Name"
                required
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                aria-label="Last Name"
                required
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              <div className="relative">
                <input
                  type="text"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="Birth Date"
                  aria-label="Birth Date"
                  className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 pr-10 focus:outline-none border border-transparent focus:border-[#292929]"
                />
                <Calendar className="w-4 h-4 text-[#292929] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.5]" />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                required
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                required
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              {error && (
                <p role="alert" className="text-[12px] text-[#9E2A2B]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium py-3.5 mt-2 transition-colors cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            <p className="demo-caption">Preview account · Use sample credentials only.</p></form>

            <p className="mt-5 text-center text-[11.5px] text-[#292929]">
              Already have an account?{' '}
              <Link
                href="/account/login"
                className="underline hover:text-[#777777]"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
