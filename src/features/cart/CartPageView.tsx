'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Lock } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { formatMoney } from '@/lib/format';
import { RecentlyViewedSection } from '@/features/recommendations/RecentlyViewedSection';

export function CartPageView() {
  const {
    currency,
    cartItems,
    itemCount,
    subtotal,
    freeShippingRemaining,
    freeShippingProgress,
    freeGiftRemaining,
    freeGiftProgress,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-12">
        <h1 className="text-[24px] sm:text-[28px] tracking-[0.08em] uppercase font-medium text-[#292929] mb-8">
          YOUR SHOPPING BAG ({itemCount})
        </h1>

        {cartItems.length === 0 ? (
          <div className="py-16 text-center border border-[#EAE6E4] bg-[#FAF8F7] space-y-4">
            <p className="text-[15px] text-[#777777]">
              Your shopping bag is currently empty.
            </p>
            <Link
              href="/collections/shop-all"
              className="inline-block bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 8 cols: Cart Table */}
            <div className="lg:col-span-8 space-y-6">
              {/* Progress Indicators */}
              <div className="p-4 bg-[#FAF8F7] border border-[#EAE6E4] space-y-3">
                <div>
                  <p className="text-[12px] text-[#292929] mb-1.5">
                    {freeShippingRemaining > 0 ? (
                      <>
                        You are{' '}
                        <strong>
                          {formatMoney(freeShippingRemaining, currency)}
                        </strong>{' '}
                        away from Free Shipping!
                      </>
                    ) : (
                      <strong>You have unlocked Free Shipping!</strong>
                    )}
                  </p>
                  <div className="w-full h-[2px] bg-[#EAE6E4]">
                    <div
                      className="h-full bg-[#E7A7AA]"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#292929] mb-1.5">
                    {freeGiftRemaining > 0 ? (
                      <>
                        Spend{' '}
                        <strong>
                          {formatMoney(freeGiftRemaining, currency)}
                        </strong>{' '}
                        more for a free gift.
                      </>
                    ) : (
                      <strong>
                        Complimentary Jewellery Travel Case unlocked!
                      </strong>
                    )}
                  </p>
                  <div className="w-full h-[2px] bg-[#EAE6E4]">
                    <div
                      className="h-full bg-[#E7A7AA]"
                      style={{ width: `${freeGiftProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#EAE6E4] border-y border-[#EAE6E4]">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/products/${item.slug}`}
                        className="w-20 h-20 bg-[#F6F6F6] shrink-0 overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-[14px] text-[#292929] font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[12px] text-[#777777] mt-0.5">
                          Color: {item.finish}
                          {item.size ? ` · Size: ${item.size}` : ''}
                        </p>
                        <p className="text-[12.5px] text-[#292929] mt-1 tabular-nums">
                          {formatMoney(item.price, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-[#EAE6E4] px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1 text-[#777777] hover:text-[#292929]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-[12.5px] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1 text-[#777777] hover:text-[#292929]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-24 text-right text-[13.5px] font-medium text-[#292929] tabular-nums hidden sm:block">
                        {formatMoney(item.price * item.quantity, currency)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-[#777777] hover:text-[#292929]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 cols: Summary Box */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-[#FAF8F7] border border-[#EAE6E4] space-y-4">
                <h2 className="text-[14px] tracking-[0.12em] uppercase font-medium text-[#292929]">
                  ORDER SUMMARY
                </h2>
                <div className="flex items-center justify-between text-[13.5px] pt-2 border-t border-[#EAE6E4]">
                  <span className="text-[#777777]">Subtotal</span>
                  <span className="font-medium text-[#292929] tabular-nums">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#777777]">
                  Shipping and promotional codes are calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  className="w-full bg-[#E7A7AA] hover:bg-[#dc9599] text-white py-3.5 px-6 text-[12px] tracking-[0.14em] uppercase font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>SECURE CHECKOUT</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <RecentlyViewedSection />
    </div>
  );
}
