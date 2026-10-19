'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  LogOut,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { ProductCard } from '@/components/shared/ProductCard';
import { formatMoney } from '@/lib/format';

export function AccountDashboardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    session,
    logoutDemo,
    updateDemoProfile,
    orders,
    wishlistIds,
    recentlyViewedIds,
    currency,
  } = useStore();

  const initialTab =
    (searchParams.get('tab') as 'overview' | 'orders' | 'wishlist' | 'profile') ||
    'overview';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'wishlist' | 'profile'
  >(initialTab);

  const [firstName, setFirstName] = useState(session?.firstName || '');
  const [lastName, setLastName] = useState(session?.lastName || '');
  const [birthDate, setBirthDate] = useState(session?.birthDate || '');

  const wishlistedProducts =
    commerceService.catalog.getProductsByIds(wishlistIds);
  const recentProducts =
    commerceService.catalog.getProductsByIds(recentlyViewedIds);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-5">
        <p className="text-[11px] tracking-[0.16em] uppercase text-[#777777]">
          DEMO ACCOUNT AREA
        </p>
        <h1 className="font-serif text-[28px] text-[#292929]">
          Sign in to view your J&amp;CO. Jewels Account
        </h1>
        <p className="text-[13px] text-[#777777]">
          Demo Access — Any non-empty user ID and password will establish a
          local simulated session. You can also view your local Wishlist ({wishlistIds.length} items) below.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/account/login"
            className="bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors"
          >
            Log In (Demo)
          </Link>
          <Link
            href="/account/register"
            className="border border-[#292929] text-[#292929] text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5"
          >
            Create Account
          </Link>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="pt-12 text-left">
            <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-5">
              YOUR SAVED WISHLIST ({wishlistedProducts.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateDemoProfile({
      firstName: firstName.trim() || session!.firstName,
      lastName: lastName.trim(),
      birthDate: birthDate.trim(),
    });
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
      {/* Top Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#EAE6E4]">
        <div>
          <p className="text-[11px] tracking-[0.16em] uppercase text-[#777777]">
            DEMO CUSTOMER SESSION ACTIVE
          </p>
          <h1 className="text-[24px] sm:text-[28px] tracking-[0.06em] uppercase font-medium text-[#292929] mt-1">
            Welcome, {session.firstName} ({session.userId})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            logoutDemo();
            router.push('/account/login');
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 border border-[#EAE6E4] hover:border-[#292929] px-5 py-2.5 text-[11.5px] tracking-[0.12em] uppercase text-[#292929] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-[#EAE6E4] py-3 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'orders', label: `Order History (${orders.length})`, icon: Package },
          { id: 'wishlist', label: `Wishlist (${wishlistedProducts.length})`, icon: Heart },
          { id: 'profile', label: 'Edit Demo Profile', icon: CheckCircle2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase py-1.5 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#292929] text-[#292929] font-medium'
                  : 'border-transparent text-[#777777] hover:text-[#292929]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Identifier Card */}
            <div className="p-6 bg-[#FAF8F7] border border-[#EAE6E4] space-y-2">
              <h2 className="text-[11.5px] tracking-[0.14em] uppercase font-medium text-[#777777]">
                DEMO ACCOUNT DETAILS
              </h2>
              <p className="text-[15px] font-medium text-[#292929]">
                {session.firstName} {session.lastName}
              </p>
              <p className="text-[13px] text-[#777777]">
                Identifier: <span className="text-[#292929]">{session.userId}</span>
              </p>
              {session.birthDate && (
                <p className="text-[12.5px] text-[#777777]">
                  Birthday: {session.birthDate}
                </p>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-[12px] text-[#292929] underline pt-2 inline-block"
              >
                Edit profile details
              </button>
            </div>

            {/* Recent Order Summary Card */}
            <div className="p-6 bg-[#FAF8F7] border border-[#EAE6E4] space-y-2">
              <h2 className="text-[11.5px] tracking-[0.14em] uppercase font-medium text-[#777777]">
                DEMO ORDERS
              </h2>
              <p className="text-[22px] font-medium text-[#292929] tabular-nums">
                {orders.length}
              </p>
              <p className="text-[12.5px] text-[#777777]">
                {orders.length > 0
                  ? `Latest order #${orders[0].orderNumber}`
                  : 'No simulated orders placed yet.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-[12px] text-[#292929] underline pt-2 inline-block"
              >
                View all demo orders
              </button>
            </div>

            {/* Wishlist Summary Card */}
            <div className="p-6 bg-[#FAF8F7] border border-[#EAE6E4] space-y-2">
              <h2 className="text-[11.5px] tracking-[0.14em] uppercase font-medium text-[#777777]">
                SAVED WISHLIST
              </h2>
              <p className="text-[22px] font-medium text-[#292929] tabular-nums">
                {wishlistedProducts.length}
              </p>
              <p className="text-[12.5px] text-[#777777]">
                Synchronized locally across your browser session.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className="text-[12px] text-[#292929] underline pt-2 inline-block"
              >
                Manage wishlist
              </button>
            </div>
          </div>

          {/* Recently Viewed */}
          {recentProducts.length > 0 && (
            <div>
              <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>RECENTLY VIEWED PIECES</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {recentProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-[15px] tracking-[0.12em] uppercase font-medium text-[#292929]">
            SIMULATED ORDER HISTORY
          </h2>
          {orders.length === 0 ? (
            <div className="p-10 bg-[#FAF8F7] border border-[#EAE6E4] text-center space-y-4">
              <p className="text-[14px] text-[#777777]">
                You haven&apos;t placed any simulated demo orders yet.
              </p>
              <Link
                href="/collections/shop-all"
                className="inline-block bg-[#E7A7AA] text-white text-[11.5px] tracking-[0.14em] uppercase px-7 py-3 font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 border border-[#EAE6E4] bg-white space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE6E4]">
                    <div>
                      <span className="text-[13px] font-semibold text-[#292929]">
                        Order #{ord.orderNumber}
                      </span>
                      <span className="text-[12px] text-[#777777] ml-3">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 bg-[#FAF8F7] border border-[#EAE6E4] text-[#292929]">
                        {ord.status}
                      </span>
                      <span className="text-[13.5px] font-medium text-[#292929] tabular-nums">
                        {formatMoney(ord.total, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 bg-[#F6F6F6] object-cover"
                        />
                        <div className="text-[12px]">
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-[#292929] hover:underline font-medium block"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[#777777]">
                            {item.finish} × {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          <h2 className="text-[15px] tracking-[0.12em] uppercase font-medium text-[#292929] mb-6">
            YOUR WISHLIST ({wishlistedProducts.length})
          </h2>
          {wishlistedProducts.length === 0 ? (
            <div className="p-10 bg-[#FAF8F7] border border-[#EAE6E4] text-center space-y-4">
              <p className="text-[14px] text-[#777777]">
                Your wishlist is empty. Tap the heart icon on any piece to save
                it here.
              </p>
              <Link
                href="/collections/new-arrivals"
                className="inline-block bg-[#E7A7AA] text-white text-[11.5px] tracking-[0.14em] uppercase px-7 py-3 font-medium"
              >
                Explore New Arrivals
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-md space-y-4 bg-[#FAF8F7] p-6 border border-[#EAE6E4]"
        >
          <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929]">
            EDIT DEMO PROFILE
          </h2>
          <div>
            <label className="block text-[11.5px] text-[#777777] mb-1">
              Demo Account Identifier
            </label>
            <input
              type="text"
              disabled
              value={session.userId}
              className="w-full bg-[#EFEFEF] text-[#777777] px-3.5 py-2.5 text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11.5px] text-[#777777] mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-white border border-[#EAE6E4] px-3.5 py-2.5 text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11.5px] text-[#777777] mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-white border border-[#EAE6E4] px-3.5 py-2.5 text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11.5px] text-[#777777] mb-1">
              Birth Date
            </label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full bg-white border border-[#EAE6E4] px-3.5 py-2.5 text-[13px]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-6 py-3 cursor-pointer"
          >
            Save Demo Profile
          </button>
        </form>
      )}
    </div>
  );
}
