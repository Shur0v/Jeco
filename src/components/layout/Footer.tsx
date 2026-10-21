'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import { FOOTER_LINKS } from '@/config/site';
import { useStore } from '@/hooks/useStore';
import { PRIVATE_AREAS_ENABLED } from '@/config/features';

export function Footer() {
  const { subscribeNewsletter } = useStore();
  const [storeName, setStoreName] = useState('J&CO Jewellery');
  useEffect(() => { try { setStoreName(JSON.parse(localStorage.getItem('jco_admin_settings_v1') || '{}').storeName || 'J&CO Jewellery'); } catch {} }, []);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const ok = subscribeNewsletter(email);
    if (ok) {
      setSubmitted(true);
      setEmail('');
    }
  }

  return (
    <footer className="bg-[#FADADD] text-[#292929] pt-14 pb-8 border-t border-[#F2C6CA]">
      <div className="w-full mx-auto px-6 sm:px-10 lg:px-[60px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14">
          {/* Left Columns: HELP + SHOWROOM & ABOUT */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#292929] mb-4">
                HELP
              </h3>
              <ul className="space-y-2.5 text-[12.5px] text-[#292929]/90">
                {FOOTER_LINKS.help.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:underline transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#292929] mt-7 mb-3">
                SHOWROOM
              </h3>
              <Link
                href="/#showroom"
                className="text-[12.5px] text-[#292929]/90 hover:underline block"
              >
                Visit our Showroom
              </Link>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#292929] mb-4">
                ABOUT
              </h3>
              <ul className="space-y-2.5 text-[12.5px] text-[#292929]/90">
                {FOOTER_LINKS.about.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:underline transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: JOIN US JEWELS Newsletter */}
          <div className="md:col-span-5 max-w-md">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#292929] mb-2">
              JOIN US JEWELS
            </h3>
            <p className="text-[12.5px] text-[#292929]/85 mb-4">
              Get exclusive access to promotions &amp; new releases.
            </p>

            <form onSubmit={handleSubscribe} noValidate className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address for newsletter"
                className="w-full bg-[#FAF8F7] text-[#292929] placeholder-[#777777] text-[13px] px-4 py-3 pr-10 focus:outline-none border border-transparent focus:border-[#292929]"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#292929] hover:text-[#777777]"
              >
                <ChevronRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            </form>
            {error && (
              <p className="text-[11.5px] text-[#9E2A2B] mt-1.5">{error}</p>
            )}
            {submitted && (
              <p className="text-[11.5px] text-[#292929] mt-1.5 font-medium">
                Thank you for joining J&amp;CO. Jewels! (Demo subscription active)
              </p>
            )}

            {/* Social Links Row */}
            <div className="flex items-center gap-5 mt-5 text-[#292929]">
              <a
                href="https://www.instagram.com/jcojewellery/"
                target="_blank" rel="noreferrer"
                aria-label="Instagram"
                className="text-[13px] font-medium hover:opacity-70 transition-opacity"
              >
                IG
              </a>
              <a
                href="https://www.facebook.com/jcojewellery/"
                target="_blank" rel="noreferrer"
                aria-label="Facebook"
                className="text-[13px] font-medium hover:opacity-70 transition-opacity"
              >
                FB
              </a>
              <a
                href="https://www.pinterest.com/jcojewellery/"
                target="_blank" rel="noreferrer"
                aria-label="Pinterest"
                className="text-[13px] font-medium hover:opacity-70 transition-opacity"
              >
                PI
              </a>
              <a
                href="https://www.youtube.com/@jcojewellery"
                target="_blank" rel="noreferrer"
                aria-label="YouTube"
                className="text-[13px] font-medium hover:opacity-70 transition-opacity"
              >
                YT
              </a>
              <a
                href="https://www.tiktok.com/@jcojewellery"
                target="_blank" rel="noreferrer"
                aria-label="TikTok"
                className="text-[13px] font-medium hover:opacity-70 transition-opacity"
              >
                TT
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Language Bar */}
        <div className="pt-6 border-t border-[#EFC2C6] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-[#292929]/85">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 {storeName} All Rights Reserved.</span>
            <Link href="/pages/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">|</span>
            <Link href="/pages/terms" className="hover:underline">
              Terms &amp; Conditions
            </Link>
          </div>

          <div className="flex items-center gap-1 cursor-pointer">
            {PRIVATE_AREAS_ENABLED && <Link href="/admin" className="mr-5 hover:underline">Admin</Link>}<span>English</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
