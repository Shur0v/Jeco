'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getEditorialBannerSvg } from '@/lib/artwork';

export function RegisterView() {
  const router = useRouter();
  const { registerDemo } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = registerDemo({
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
    router.push('/account');
  }

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[680px]">
        {/* Left Editorial Heart Hands Ring Visual (Matches Screenshot 1 100%) */}
        <div className="relative bg-[#EDE3DA] min-h-[340px] lg:min-h-[680px] overflow-hidden">
          <img
            src={getEditorialBannerSvg('auth-heart-hands')}
            alt="Hands forming a heart wearing delicate gold stacking rings"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Panel (Matches Screenshot 1 100%) */}
        <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-14">
          <div className="w-full max-w-[380px]">
            <h1 className="text-[24px] sm:text-[26px] tracking-[0.12em] uppercase font-medium text-[#292929] text-center mb-6">
              CREATE AN ACCOUNT
            </h1>

            <div className="mb-5 p-3 bg-[#FAF8F7] border border-[#EAE6E4] text-[11.5px] text-[#777777] text-center">
              Demo Access — Any user ID and password will work. Do not enter
              real credentials.
            </div>

            <form onSubmit={handleRegister} noValidate className="space-y-3.5">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                aria-label="First Name"
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                aria-label="Last Name"
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
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
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
            </form>

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
