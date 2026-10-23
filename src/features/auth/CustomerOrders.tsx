"use client";
import { DemoOrder } from "@/types/commerce";
import { Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {useMerchant} from '@/hooks/useMerchant';

export function CustomerOrders({ orders }: { orders: DemoOrder[] }) {
  const {data}=useMerchant();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!orders.length)
    return (
      <div className="workspace-empty">
        <Package />
        <h2>Your next favourite is waiting</h2>
        <p className="muted">
          When you place an order, you can follow its journey here.
        </p>
        <Link className="rose-button" href="/collections/shop-all">
          Explore jewellery
        </Link>
      </div>
    );
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="workspace-panel">
          <div className="section-heading">
            <div>
              <h2>Order #{order.orderNumber}</h2>
              <p className="muted">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="status-pill">
              {(data.orderDetails[order.id]?.fulfillment||order.status.replace(" (Demo)", "")).replaceAll('-',' ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {order.items.slice(0, 3).map((item) => (
                <img
                  className="h-16 w-16 object-cover"
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                />
              ))}
            </div>
            <div className="text-right">
              <p className="text-sm">{order.currency==='BDT'?'৳':'$'}{order.total.toFixed(2)} {order.currency}</p>
              <button
                className="muted underline"
                onClick={() =>
                  setExpanded(expanded === order.id ? null : order.id)
                }
              >
                {expanded === order.id ? "Hide details" : "View order details"}
              </button>
            </div>
          </div>
          {expanded === order.id && (
            <div className="mt-6 border-t border-[#eee] pt-5">
              <p className="muted">
                {order.items
                  .map((i) => `${i.name} (${i.finish}) × ${i.quantity}`)
                  .join(" · ")}
              </p>
              <p className="muted mt-3">
                Deliver to {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName},{" "}
                {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="muted">
                {order.shippingMethod.name} ·{" "}
                {order.shippingMethod.estimatedDays}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
