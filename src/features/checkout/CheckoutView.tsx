"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag,
  Lock,
  HelpCircle,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { SHIPPING_METHODS, SITE_CONFIG } from "@/config/site";
import { PRIVATE_AREAS_ENABLED } from "@/config/features";
import { completeOrder, recordEvent, getMerchant } from "@/lib/merchant-store";
import { useMerchant } from "@/hooks/useMerchant";
import { DemoOrder, ShippingAddress } from "@/types/commerce";
import {
  createDemoOrderMeta,
  formatMoney,
  formatMoneyShort,
} from "@/lib/format";

const checkoutSchema = z.object({
  email: z.string().min(1, "Email or contact ID is required"),
  marketingOptIn: z.boolean(),
  smsOptIn: z.boolean(),
  country: z.string().min(1, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address: z.string().min(1, "Shipping address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Region is required"),
  postalCode: z.string().min(1, "ZIP / Postal code is required"),
  phone: z.string().min(1, "Phone number is required"),
  giftNote: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutView() {
  const { data: merchant } = useMerchant();
  const router = useRouter();
  const {
    currency,
    cartItems,
    subtotal,
    appliedPromo,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    session,
    recordDemoOrder,
    clearCart,
    showToast,
  } = useStore();

  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    SHIPPING_METHODS[0].id,
  );
  const [paymentOption, setPaymentOption] = useState<"bkash" | "nagad">(
    "bkash",
  );
  const [wantsGiftNote, setWantsGiftNote] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = React.useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: session?.email || "",
      marketingOptIn: true,
      smsOptIn: false,
      country: "Bangladesh",
      firstName: session?.firstName || "",
      lastName: session?.lastName || "",
      company: "",
      address: session?.defaultAddress?.address || "",
      apartment: "",
      city: session?.defaultAddress?.city || "",
      state: session?.defaultAddress?.state || "Dhaka",
      postalCode: session?.defaultAddress?.postalCode || "",
      phone: session?.phone || "",
      giftNote: "",
    },
  });

  const shippingMethods = SHIPPING_METHODS.map((m) =>
    m.id === "standard"
      ? {
          ...m,
          price: merchant.settings.shipping,
          freeOverSubtotal: merchant.settings.freeShipping,
        }
      : m,
  );
  const selectedShipping =
    shippingMethods.find((m) => m.id === selectedShippingId) ||
    shippingMethods[0];

  const shippingCost =
    selectedShipping.freeOverSubtotal &&
    subtotal >= selectedShipping.freeOverSubtotal
      ? 0
      : selectedShipping.price;

  const finalTotal = Math.max(
    0,
    Number((subtotal - discountAmount + shippingCost).toFixed(2)),
  );

  function handleFillDemoAddress() {
    setValue("email", session?.email || "elena.demo@example.com");
    setValue("firstName", session?.firstName || "Elena");
    setValue("lastName", session?.lastName || "Vance");
    setValue("address", "24 Sample Road");
    setValue("city", "Dhaka");
    setValue("state", "Dhaka");
    setValue("postalCode", "1207");
    setValue("phone", "+880 1700 000000");
    showToast("Pre-filled demo shipping address");
  }

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoFeedback({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    if (res.success) setPromoInput("");
  }

  const onSubmit = React.useCallback(
    async (values: CheckoutFormValues) => {
      if (isSubmitting || submitLock.current) return;
      if (!getMerchant().settings[paymentOption]) {
        showToast("That payment method is currently disabled.");
        return;
      }
      if (cartItems.length === 0) {
        showToast("Your bag is empty.");
        return;
      }
      setIsSubmitting(true);
      submitLock.current = true;

      const meta = createDemoOrderMeta();
      const shippingAddress: ShippingAddress = {
        ...values,
        giftNote: wantsGiftNote ? values.giftNote : undefined,
      };

      const newOrder: DemoOrder = {
        id: meta.id,
        orderNumber: meta.orderNumber,
        createdAt: meta.createdAt,
        accountIdentifier: session?.userId || values.email,
        items: [...cartItems],
        shippingAddress,
        shippingMethod: selectedShipping,
        subtotal,
        discountAmount,
        promoCode: appliedPromo?.code,
        shippingCost,
        total: finalTotal,
        currency,
        paymentMethodLabel:
          paymentOption === "bkash"
            ? "bKash demo — No charge"
            : "Nagad demo — No charge",
        status: "Confirmed (Demo)",
      };

      try {
        window.sessionStorage.setItem(
          "jco_last_demo_order",
          JSON.stringify(newOrder),
        );
      } catch {}

      try {
        await completeOrder(newOrder);
      } catch (error) {
        showToast((error as Error).message);
        setIsSubmitting(false);
        submitLock.current = false;
        return;
      }
      recordEvent({
        path: "/checkout",
        type: "order-complete",
        label: "Completed demo order",
      });
      recordDemoOrder(newOrder);
      clearCart();
      router.push(
        `/checkout/success?order=${encodeURIComponent(meta.orderNumber)}`,
      );
    },
    [
      cartItems,
      wantsGiftNote,
      session,
      selectedShipping,
      subtotal,
      discountAmount,
      appliedPromo,
      shippingCost,
      finalTotal,
      currency,
      paymentOption,
      recordDemoOrder,
      clearCart,
      router,
      showToast,
      isSubmitting,
    ],
  );

  return (
    <div className="checkout-page min-h-screen bg-white text-[#292929]">
      {/* Minimalist Checkout Header (Matches Screenshot 3) */}
      <header className="border-b border-[#EAE6E4] bg-white">
        <div className="checkout-header-inner max-w-[1040px] mx-auto px-4 sm:px-8 h-[96px] flex items-center justify-between">
          <div className="w-8" />
          <Link href="/" className="text-center group">
            <span className="font-serif text-[28px] tracking-tight text-[#292929] block leading-none">
              J&amp;CO.
            </span>
            <span className="text-[8.5px] tracking-[0.28em] uppercase text-[#292929] block mt-0.5">
              JEWELLERY
            </span>
          </Link>
          <Link
            href="/cart"
            className="p-2 text-[#E7A7AA] hover:text-[#292929] transition-colors"
            aria-label="Return to shopping bag"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </Link>
        </div>
      </header>

      {/* Main 2-Column Split Layout (Matches Screenshot 3) */}
      <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 px-4 sm:px-8 lg:pr-12 py-8 lg:py-10">
          <div className="mb-6 bg-[#faf3ef] border border-[#eaded5] rounded-lg p-4">
            <p className="text-sm">bKash & Nagad · BDT demo checkout</p>
            <button
              type="button"
              onClick={handleFillDemoAddress}
              className="text-xs underline mt-2"
            >
              Fill sample delivery details
            </button>
            <p className="text-xs text-[#7b685d] mt-2">
              No real payment, PIN or wallet credentials required.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-8"
          >
            {/* Contact Section */}
            <section aria-labelledby="checkout-contact-heading">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="checkout-contact-heading"
                  className="text-[18px] font-medium text-[#292929]"
                >
                  Contact
                </h2>
                {PRIVATE_AREAS_ENABLED &&
                  (!session ? (
                    <Link
                      href="/account/login"
                      className="text-[12.5px] text-[#E7A7AA] underline hover:text-[#292929]"
                    >
                      Sign in
                    </Link>
                  ) : (
                    <span className="text-[12px] text-[#777777]">
                      Logged in as {session.userId}
                    </span>
                  ))}
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] text-[#292929] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                />
                <HelpCircle className="w-4 h-4 text-[#777777] absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                  {errors.email.message}
                </p>
              )}

              <label className="flex items-center gap-2.5 mt-3 text-[12.5px] text-[#292929] cursor-pointer">
                <input
                  type="checkbox"
                  {...register("marketingOptIn")}
                  className="w-4 h-4 accent-[#E7A7AA] rounded-xs"
                />
                <span>Email me with news and offers</span>
              </label>
            </section>

            {/* Delivery Section */}
            <section
              aria-labelledby="checkout-delivery-heading"
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2
                  id="checkout-delivery-heading"
                  className="text-[18px] font-medium text-[#292929]"
                >
                  Delivery
                </h2>
                <button
                  type="button"
                  onClick={handleFillDemoAddress}
                  className="text-[11.5px] text-[#777777] hover:text-[#292929] underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#E7A7AA]" />
                  <span>Auto-fill demo address</span>
                </button>
              </div>

              {/* Country / Region */}
              <div className="border border-[#DCD8D5] rounded-md px-3.5 py-1.5">
                <label className="block text-[10.5px] text-[#777777]">
                  Country/Region
                </label>
                <select
                  {...register("country")}
                  className="w-full text-[13.5px] text-[#292929] bg-transparent focus:outline-none"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="European Union">European Union</option>
                </select>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    {...register("firstName")}
                    className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                  />
                  {errors.firstName && (
                    <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last name"
                    {...register("lastName")}
                    className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                  />
                  {errors.lastName && (
                    <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Company */}
              <input
                type="text"
                placeholder="Company (optional)"
                {...register("company")}
                className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
              />

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Address"
                  {...register("address")}
                  className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                />
                <Search className="w-4 h-4 text-[#777777] absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.address && (
                <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                  {errors.address.message}
                </p>
              )}

              {/* Apartment */}
              <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                {...register("apartment")}
                className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
              />

              {/* City / State / ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    {...register("city")}
                    className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                  />
                  {errors.city && (
                    <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State"
                    {...register("state")}
                    className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                  />
                  {errors.state && (
                    <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="ZIP code"
                    {...register("postalCode")}
                    className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                  />
                  {errors.postalCode && (
                    <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Phone"
                  {...register("phone")}
                  className="w-full border border-[#DCD8D5] rounded-md px-3.5 py-3 text-[13.5px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                />
                <HelpCircle className="w-4 h-4 text-[#777777] absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-[11.5px] text-[#9E2A2B] mt-1">
                  {errors.phone.message}
                </p>
              )}

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center gap-2.5 text-[12.5px] text-[#292929] cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("smsOptIn")}
                    className="w-4 h-4 accent-[#E7A7AA]"
                  />
                  <span>Text me with news and offers</span>
                </label>

                <label className="flex items-center gap-2.5 text-[12.5px] text-[#292929] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsGiftNote}
                    onChange={(e) => setWantsGiftNote(e.target.checked)}
                    className="w-4 h-4 accent-[#E7A7AA]"
                  />
                  <span>I want a gift note for my order</span>
                </label>

                {wantsGiftNote && (
                  <textarea
                    rows={2}
                    placeholder="Write your complimentary gift message..."
                    {...register("giftNote")}
                    className="w-full border border-[#DCD8D5] rounded-md p-3 text-[13px] focus:outline-none focus:border-[#292929]"
                  />
                )}
              </div>
            </section>

            {/* Shipping Method Section */}
            <section aria-labelledby="checkout-shipping-heading">
              <h2
                id="checkout-shipping-heading"
                className="text-[15px] font-medium text-[#292929] mb-3"
              >
                Shipping method
              </h2>
              <div className="border border-[#DCD8D5] rounded-md divide-y divide-[#EAE6E4]">
                {shippingMethods.map((method) => {
                  const isFree =
                    method.freeOverSubtotal &&
                    subtotal >= method.freeOverSubtotal;
                  const priceLabel = isFree
                    ? "FREE"
                    : formatMoneyShort(method.price, currency);
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3.5 cursor-pointer text-[13px] ${
                        selectedShippingId === method.id
                          ? "bg-[#FDF6F6]"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={selectedShippingId === method.id}
                          onChange={() => setSelectedShippingId(method.id)}
                          className="accent-[#E7A7AA]"
                        />
                        <div>
                          <p className="font-medium text-[#292929]">
                            {method.name}
                          </p>
                          <p className="text-[11.5px] text-[#777777]">
                            {method.estimatedDays} · {method.description}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium tabular-nums">
                        {priceLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Payment Demo Section (Matches Screenshot 3 visual styling + explicit Demo No-Charge safety) */}
            <section aria-labelledby="checkout-payment-heading">
              <h2
                id="checkout-payment-heading"
                className="text-[18px] font-medium text-[#292929]"
              >
                Payment
              </h2>
              <p className="text-[12px] text-[#777777] mt-0.5 mb-3">
                Demo Checkout Simulation — No real payment or charge will be
                processed.
              </p>

              <div className="border border-[#e7d6cc] rounded-lg overflow-hidden">
                {(["bkash", "nagad"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 px-4 py-4 border-b border-[#eee2d9] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === method}
                      disabled={!merchant.settings[method]}
                      onChange={() => setPaymentOption(method)}
                    />
                    <span className="font-medium text-sm">
                      {method === "bkash" ? "bKash" : "Nagad"}
                    </span>
                    <span className="text-xs text-[#8c7666] ml-auto">
                      {merchant.settings[method]
                        ? "Demo simulation · No charge"
                        : "Currently disabled"}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Submit Pay Now Button (Matches Screenshot 3 Soft Blush Button) */}
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-[#F5D3D3] hover:bg-[#E7A7AA] text-[#292929] hover:text-white font-medium text-[14px] py-4 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Processing Demo Order..." : "Pay now"}
            </button>

            {/* Bottom Policy Links */}
            <div className="pt-4 border-t border-[#EAE6E4] flex items-center gap-4 text-[11.5px] text-[#E7A7AA]">
              <Link href="/pages/terms" className="underline">
                Refund policy
              </Link>
              <Link href="/pages/privacy" className="underline">
                Privacy policy
              </Link>
              <Link href="/pages/terms" className="underline">
                Terms of service
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary (Matches Screenshot 3) */}
        <aside className="lg:col-span-5 bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-[#EAE6E4] px-4 sm:px-8 lg:pl-10 py-8 lg:py-10">
          <div className="lg:sticky lg:top-10 space-y-6">
            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-16 h-16 bg-white border border-[#EAE6E4] rounded-md shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#292929] text-white text-[11px] font-medium flex items-center justify-center tabular-nums">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] text-[#292929] font-normal">
                        {item.name}
                      </p>
                      <p className="text-[11.5px] text-[#777777]">
                        {item.finish}
                        {item.size ? ` / ${item.size}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[13px] text-[#292929] tabular-nums">
                    {formatMoneyShort(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code Input (Matches Screenshot 3) */}
            <div>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Discount code (Try WELCOME10 or JCO20)"
                  aria-label="Discount code"
                  className="flex-1 bg-white border border-[#DCD8D5] rounded-md px-3.5 py-2.5 text-[13px] placeholder-[#777777] focus:outline-none focus:border-[#292929]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 bg-[#F0F0F0] hover:bg-[#292929] text-[#777777] hover:text-white text-[13px] font-medium rounded-md transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {promoFeedback && (
                <p
                  className={`text-[11.5px] mt-1.5 ${
                    promoFeedback.type === "success"
                      ? "text-[#2E7D32]"
                      : "text-[#9E2A2B]"
                  }`}
                >
                  {promoFeedback.text}
                </p>
              )}

              {appliedPromo && (
                <div className="mt-2 inline-flex items-center gap-2 bg-[#F6D9D9]/50 px-3 py-1 rounded-xs text-[11.5px] text-[#292929]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#292929]" />
                  <span>
                    Code <strong>{appliedPromo.code}</strong> active
                  </span>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="underline ml-1 text-[#777777] hover:text-[#292929]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-[#EAE6E4] text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#292929]">Subtotal</span>
                <span className="text-[#292929] tabular-nums">
                  {formatMoneyShort(subtotal, currency)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#2E7D32]">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span className="tabular-nums">
                    -{formatMoneyShort(discountAmount, currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[#292929]">Shipping</span>
                <span className="text-[#777777] tabular-nums">
                  {shippingCost === 0
                    ? "Free"
                    : formatMoneyShort(shippingCost, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE6E4] text-[16px] font-semibold text-[#292929]">
                <span>Total</span>
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-[11px] font-normal text-[#777777]">
                    {currency}
                  </span>
                  <span>{formatMoneyShort(finalTotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
