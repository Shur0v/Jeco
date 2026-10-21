'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, Search, User, Heart } from 'lucide-react';
import { CURRENCIES, MAIN_NAV_ITEMS, SHOP_MEGA_MENU } from '@/config/site';
import { useStore } from '@/hooks/useStore';
import { CurrencyCode } from '@/types/commerce';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { PRIVATE_AREAS_ENABLED } from '@/config/features';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  useDialogFocus(isOpen);
  const { currency, setCurrency, session, setIsSearchOpen, wishlistIds } =
    useStore();
  const [expandedGroup, setExpandedGroup] = useState<string | null>('category');

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Store navigation" className="fixed inset-0 z-50 lg:hidden flex">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-[86vw] max-w-[360px] bg-white h-full flex flex-col justify-between overflow-y-auto z-10 shadow-xl">
        <div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE6E4]">
            <Link
              href="/"
              onClick={onClose}
              className="font-serif text-2xl tracking-tight text-[#292929]"
            >
              J&amp;CO.
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#292929] hover:text-[#777777]"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Quick Search Trigger */}
          <div className="px-5 py-3 border-b border-[#EAE6E4]">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 bg-[#F6F6F6] px-3.5 py-2.5 text-left text-[13px] text-[#777777]"
            >
              <Search className="w-4 h-4 text-[#292929]" />
              <span>Search earrings, rings, 14K gold...</span>
            </button>
          </div>

          {/* Primary Links */}
          <nav className="divide-y divide-[#EAE6E4]" aria-label="Mobile navigation">
            <div className="py-2">
              {MAIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-3 text-[14px] text-[#292929] hover:bg-[#FAF8F7]"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#777777]" />
                </Link>
              ))}
            </div>

            {/* Expandable Materials */}
            <div className="px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  setExpandedGroup(
                    expandedGroup === 'material' ? null : 'material'
                  )
                }
                className="w-full flex items-center justify-between py-2 text-[12px] tracking-[0.12em] uppercase font-medium text-[#292929]"
              >
                <span>Shop By Material</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedGroup === 'material' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedGroup === 'material' && (
                <ul className="pt-2 pb-1 space-y-2.5 pl-2">
                  {SHOP_MEGA_MENU.byMaterial.map((m) => (
                    <li key={m.label}>
                      <Link
                        href={m.href}
                        onClick={onClose}
                        className="block text-[13.5px] text-[#777777] hover:text-[#292929]"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>
        </div>

        {/* Footer Account & Currency Controls */}
        <div className="border-t border-[#EAE6E4] p-5 bg-[#FAF8F7] space-y-4">
          <div className="flex items-center justify-between">
            {PRIVATE_AREAS_ENABLED && <Link
              href={session ? '/account' : '/account/login'}
              onClick={onClose}
              className="flex items-center gap-2.5 text-[13.5px] text-[#292929] font-medium"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
              <span>
                {session ? `Account (${session.firstName})` : 'Log in / Register'}
              </span>
            </Link>}

            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-1.5 text-[13px] text-[#292929]"
            >
              <Heart className="w-4 h-4 stroke-[1.5]" />
              <span>Wishlist ({wishlistIds.length})</span>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#EAE6E4]">
            <span className="text-[12px] text-[#777777]">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label="Select store currency"
              className="text-[12.5px] text-[#292929] bg-white border border-[#EAE6E4] px-2.5 py-1.5 focus:outline-none"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
