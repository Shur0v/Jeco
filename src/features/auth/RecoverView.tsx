'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getEditorialBannerSvg } from '@/lib/artwork';

export function RecoverView() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  }

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
        <div className="relative bg-[#EDE3DA] min-h-[300px] lg:min-h-[640px] overflow-hidden">
          <img
            src={getEditorialBannerSvg('auth-heart-hands')}
            alt="Hands forming a heart wearing delicate gold stacking rings"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-14">
          <div className="w-full max-w-[380px] text-center">
            <h1 className="text-[22px] sm:text-[24px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-3">
              RESET PASSWORD
            </h1>
            <p className="text-[12.5px] text-[#777777] mb-6">
              Demo Mode Note: You can log in immediately on the Log In screen
              using any non-empty User ID and any non-empty Password.
            </p>

            {sent ? (
              <div className="p-4 bg-[#FAF8F7] border border-[#EAE6E4] text-[12.5px] text-[#292929] space-y-3">
                <p>
                  Simulated password reset instructions have been prepared for{' '}
                  <strong>{email}</strong>.
                </p>
                <Link
                  href="/account/login"
                  className="inline-block bg-[#E7A7AA] text-white text-[11px] tracking-[0.14em] uppercase px-6 py-2.5 font-medium"
                >
                  Return to Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRecover} className="space-y-4">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  aria-label="Email"
                  className="w-full bg-[#F6F6F6] text-[#292929] placeholder-[#999999] text-[13px] px-4 py-3.5 focus:outline-none border border-transparent focus:border-[#292929]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium py-3.5 transition-colors cursor-pointer"
                >
                  SUBMIT
                </button>
                <div>
                  <Link
                    href="/account/login"
                    className="text-[11.5px] text-[#292929] underline"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
