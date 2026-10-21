'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Lock, ShoppingBag } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { commerceService } from '@/commerce';
import { formatMoney } from '@/lib/format';
import { useDialogFocus } from '@/hooks/useDialogFocus';

export function CartDrawer() {
  const router = useRouter();
  const {
    currency,
    cartItems,
    itemCount,
    subtotal,
    freeShippingRemaining,
    freeShippingProgress,
    freeGiftRemaining,
    freeGiftProgress,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    addToCart,
  } = useStore();

  useDialogFocus(isCartDrawerOpen);
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const upsellProducts = commerceService.catalog.getCartUpsellProducts(
    cartItems.map((i) => i.productId),
    3
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      {/* Dimmed Overlay */}
      <div
        className="fixed inset-0 bg-black/45 transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Right Slide-Over Panel (Matches Screenshot 4 100%) */}
      <div className="relative z-10 w-full max-w-[420px] bg-white h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#EAE6E4] flex items-center justify-between">
          <h2 className="text-[19px] tracking-[0.06em] uppercase font-medium text-[#292929]">
            YOUR BAG ({itemCount})
          </h2>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-[#292929] hover:text-[#777777] transition-colors"
            aria-label="Close shopping bag"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Free Shipping & Free Gift Progress Bars */}
          <div className="space-y-3.5">
            <div>
              <p className="text-[12px] text-[#292929] mb-2">
                {freeShippingRemaining > 0 ? (
                  <>
                    You are{' '}
                    <span className="font-semibold">
                      {formatMoney(freeShippingRemaining, currency)}
                    </span>{' '}
                    away from Free Shipping!
                  </>
                ) : (
                  <span className="font-medium text-[#292929]">
                    You’ve unlocked{' '}
                    <span className="font-semibold">Free Shipping!</span>
                  </span>
                )}
              </p>
              <div className="w-full h-[2px] bg-[#EAE6E4] overflow-hidden">
                <div
                  className="h-full bg-[#E7A7AA] transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-[12px] text-[#292929] mb-2">
                {freeGiftRemaining > 0 ? (
                  <>
                    Spend{' '}
                    <span className="font-semibold">
                      {formatMoney(freeGiftRemaining, currency)}
                    </span>{' '}
                    more for a free gift.
                  </>
                ) : (
                  <span className="font-medium text-[#292929]">
                    Complimentary{' '}
                    <span className="font-semibold">Jewellery Travel Case</span>{' '}
                    unlocked!
                  </span>
                )}
              </p>
              <div className="relative w-full h-[2px] bg-[#EAE6E4] flex items-center">
                <div
                  className="h-full bg-[#E7A7AA] transition-all duration-300"
                  style={{ width: `${freeGiftProgress}%` }}
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAE6E4] border border-white ml-auto" />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <div className="py-14 text-center space-y-4">
              <p className="text-[14px] text-[#777777]">
                Your shopping bag is currently empty.
              </p>
              <Link
                href="/collections/new-arrivals"
                onClick={() => setIsCartDrawerOpen(false)}
                className="inline-block bg-[#E7A7AA] text-white text-[12px] tracking-[0.12em] uppercase px-6 py-3 font-medium hover:bg-[#dc9699] transition-colors"
              >
                Explore New Arrivals
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE6E4] border-b border-[#EAE6E4]">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="w-[72px] h-[72px] bg-[#F6F6F6] shrink-0 overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-[13px] text-[#292929] font-normal hover:underline block truncate"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11.5px] text-[#777777] mt-0.5">
                          Color: {item.finish}
                          {item.size ? ` · Size: ${item.size}` : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#777777] hover:text-[#292929] p-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[12.5px] text-[#292929] tabular-nums">
                        {formatMoney(item.price * item.quantity, currency)}
                      </span>

                      <div className="flex items-center gap-3 text-[13px] text-[#292929]">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="p-1 text-[#777777] hover:text-[#292929]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center tabular-nums text-[12.5px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="p-1 text-[#777777] hover:text-[#292929]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* You May Also Like Section (Matches Screenshot 4) */}
          <div className="pt-2">
            <h3 className="text-[13px] font-medium text-[#292929] mb-3.5">
              You May Also Like
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {upsellProducts.map((up) => (
                <div key={up.id} className="group flex flex-col">
                  <div className="relative aspect-square bg-[#F6F6F6] mb-2 overflow-hidden">
                    <Link
                      href={`/products/${up.slug}`}
                      onClick={() => setIsCartDrawerOpen(false)}
                    >
                      <img
                        src={up.images[0]}
                        alt={up.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(up, {
                          finish: up.availableFinishes[0],
                          quantity: 1,
                          openDrawer: true,
                        })
                      }
                      aria-label={`Add ${up.name} to bag`}
                      className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-[#292929] hover:bg-[#292929] hover:text-white transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>
                  <Link
                    href={`/products/${up.slug}`}
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="text-[11.5px] text-[#292929] leading-snug line-clamp-2 hover:underline"
                  >
                    {up.name}
                  </Link>
                  <span className="text-[11px] text-[#292929] mt-1 tabular-nums">
                    {formatMoney(up.basePrice, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Checkout Footer */}
        <div className="border-t border-[#EAE6E4] px-6 py-5 bg-white space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#292929]">
              Subtotal
            </span>
            <span className="text-[14px] font-medium text-[#292929] tabular-nums">
              {formatMoney(subtotal, currency)}
            </span>
          </div>

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={() => {
              setIsCartDrawerOpen(false);
              router.push('/checkout');
            }}
            className="w-full bg-[#E7A7AA] hover:bg-[#dd969a] disabled:opacity-50 text-white py-3.5 px-6 text-[12.5px] tracking-[0.12em] uppercase font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>SECURE CHECKOUT</span>
          </button>

          <div className="flex items-center justify-between text-[11.5px] text-[#777777] pt-0.5">
            <span>Got a code? Redeem it on the next step</span>
            <Link
              href="/cart"
              onClick={() => setIsCartDrawerOpen(false)}
              className="underline hover:text-[#292929]"
            >
              View Bag
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
