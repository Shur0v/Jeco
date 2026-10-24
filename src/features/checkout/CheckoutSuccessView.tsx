'use client';

import { ProductPriceText } from "@/components/shared/ProductPriceText";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ShieldAlert } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { DemoOrder } from '@/types/commerce';
import { formatMoney } from '@/lib/format';
import { PRIVATE_AREAS_ENABLED } from '@/config/features';

export function CheckoutSuccessView() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order');
  const { orders, currency } = useStore();

  const order = React.useMemo<DemoOrder | null>(() => {
    const found = orders.find((o) => o.orderNumber === orderParam) || orders[0];
    if (found) return found;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.sessionStorage.getItem('jco_last_demo_order');
        if (saved) return JSON.parse(saved) as DemoOrder;
      } catch {}
    }
    return null;
  }, [orderParam, orders]);

  return (
    <div className="min-h-screen bg-[#FAF8F7] py-14 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto bg-white border border-[#EAE6E4] p-6 sm:p-10 space-y-7">
        {/* Prominent Demo Disclaimer Banner */}
        <div className="bg-[#FCE8E8] border border-[#E7A7AA] px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#292929]">
          <ShieldAlert className="w-4 h-4 text-[#292929] shrink-0 mt-0.5" />
          <div>
            <strong>Demonstration Order Confirmation:</strong> No real payment
            was charged and no physical shipment has been scheduled. This order
            is stored locally in your browser’s demo order history.
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#F6D9D9] text-[#292929] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[1.6]" />
          </div>
          <p className="text-[11px] tracking-[0.16em] uppercase text-[#777777]">
            THANK YOU FOR YOUR DEMO ORDER
          </p>
          <h1 className="font-serif text-[28px] text-[#292929]">
            Order #{order?.orderNumber || orderParam || 'JCO-104288'} Confirmed
          </h1>
          <p className="text-[13px] text-[#777777]">
            Your receipt is saved in this browser. Keep your order number for reference.
          </p>
        </div>

        {order && (
          <>
            {/* Order Items */}
            <div className="border-t border-b border-[#EAE6E4] py-5 space-y-4">
              <h2 className="text-[11.5px] tracking-[0.14em] uppercase font-medium text-[#292929]">
                ITEMS IN THIS DEMO ORDER
              </h2>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 text-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 bg-[#F6F6F6] object-cover"
                    />
                    <div>
                      <p className="text-[#292929] font-medium">{item.name}</p>
                      <p className="text-[11.5px] text-[#777777]">
                        {item.finish}
                        {item.size ? ` · ${item.size}` : ''} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="tabular-nums text-[#292929]">
                    <ProductPriceText>{formatMoney(item.price * item.quantity, currency)}</ProductPriceText>
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[12.5px]">
              <div>
                <h3 className="text-[11px] tracking-[0.12em] uppercase text-[#777777] mb-2">
                  SHIPPING ADDRESS
                </h3>
                <p className="text-[#292929] font-medium">
                  {order.shippingAddress.firstName}{' '}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-[#777777]">{order.shippingAddress.address}</p>
                <p className="text-[#777777]">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-[#777777]">{order.shippingAddress.country}</p>
              </div>

              <div>
                <h3 className="text-[11px] tracking-[0.12em] uppercase text-[#777777] mb-2">
                  DELIVERY &amp; PAYMENT SUMMARY
                </h3>
                <p className="text-[#292929]">{order.shippingMethod.name}</p>
                <p className="text-[#777777] mt-1">{order.paymentMethodLabel}</p>
                <p className="text-[#292929] font-semibold mt-2 tabular-nums">
                  Total Simulated Amount: {formatMoney(order.total, currency)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/collections/shop-all"
            className="w-full sm:w-auto text-center bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href={PRIVATE_AREAS_ENABLED ? '/account' : '/'}
            className="w-full sm:w-auto text-center border border-[#292929] text-[#292929] hover:bg-[#292929] hover:text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>{PRIVATE_AREAS_ENABLED ? 'View Demo Order History' : 'Back to home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
