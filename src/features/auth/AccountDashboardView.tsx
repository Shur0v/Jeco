"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Heart,
  MapPin,
  UserRound,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { commerceService } from "@/commerce";
import { ProductCard } from "@/components/shared/ProductCard";
import { CustomerOrders } from "./CustomerOrders";

export function AccountDashboardView() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    session,
    isHydrated,
    orders,
    wishlistIds,
    recentlyViewedIds,
    updateDemoProfile,
    logoutDemo,
  } = useStore();
  const tabs = [
    { id: "overview", label: "Account overview", icon: LayoutGrid },
    { id: "orders", label: "My orders", icon: Package },
    { id: "wishlist", label: "My wishlist", icon: Heart },
    { id: "addresses", label: "Address book", icon: MapPin },
    { id: "profile", label: "Account details", icon: UserRound },
  ];
  const [tab, setTab] = useState(
    tabs.some((t) => t.id === params.get("tab"))
      ? params.get("tab")!
      : "overview",
  );
  const saved = commerceService.catalog.getProductsByIds(wishlistIds);
  const myOrders = orders.filter(
    (o) =>
      o.accountIdentifier?.toLowerCase() === session?.userId.toLowerCase() ||
      o.shippingAddress.email.toLowerCase() === session?.email.toLowerCase(),
  );
  function navigate(id: string) {
    setTab(id);
    router.replace(`/account?tab=${id}`, { scroll: false });
  }
  if (!isHydrated)
    return (
      <div className="workspace-empty muted">Opening your jewellery box…</div>
    );
  if (!session)
    return (
      <div className="workspace-empty py-24">
        <UserRound />
        <h1 className="text-3xl font-serif">Your personal jewellery box</h1>
        <p className="muted">
          Sign in to manage your orders, saved pieces and account.
        </p>
        <Link className="rose-button" href="/account/login">
          Log in
        </Link>
        <Link className="muted underline" href="/account/register">
          Create an account
        </Link>
      </div>
    );
  return (
    <div className="workspace customer-workspace">
      <aside className="workspace-sidebar">
        <p className="eyebrow">MY J&amp;CO.</p>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => navigate(t.id)}
          >
            <t.icon />
            {t.label}
          </button>
        ))}
        <button
          onClick={() => {
            logoutDemo();
            router.push("/account/login");
          }}
        >
          <LogOut />
          Log out
        </button>
      </aside>
      <main className="workspace-content">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">YOUR EVERYDAY, A LITTLE MORE SPECIAL</p>
            <h1 className="mt-3">
              {tab === "overview"
                ? `Hello, ${session.firstName}`
                : tabs.find((t) => t.id === tab)?.label}
            </h1>
            <p className="muted">Welcome to your personal jewellery box.</p>
          </div>
          <Link className="outline-button" href="/collections/new-arrivals">
            Keep exploring <ArrowUpRight size={14} />
          </Link>
        </div>
        {tab === "overview" && (
          <>
            <div className="workspace-welcome">
              <div>
                <p className="eyebrow">A LITTLE SOMETHING, JUST FOR YOU</p>
                <h2>Made to be part of your everyday.</h2>
                <p className="muted">
                  Discover new favourites to stack, style and make your own.
                </p>
              </div>
              <Link className="rose-button" href="/collections/new-arrivals">
                Discover new arrivals
              </Link>
            </div>
            <div className="stat-grid customer-stats">
              {[
                {
                  label: "Orders placed",
                  value: myOrders.length,
                  target: "orders",
                },
                {
                  label: "Saved favourites",
                  value: saved.length,
                  target: "wishlist",
                },
                {
                  label: "Your addresses",
                  value: session.defaultAddress?.address ? 1 : 0,
                  target: "addresses",
                },
              ].map((s) => (
                <button
                  key={s.target}
                  className="stat-card text-left"
                  onClick={() => navigate(s.target)}
                >
                  <span>{s.label}</span>
                  <strong>{s.value.toString().padStart(2, "0")}</strong>
                  <small>View details ↗</small>
                </button>
              ))}
            </div>
            <div className="workspace-panel">
              <div className="section-heading">
                <h2>YOUR RECENT ORDERS</h2>
                <button
                  className="muted underline"
                  onClick={() => navigate("orders")}
                >
                  View all
                </button>
              </div>
              <CustomerOrders orders={myOrders.slice(0, 1)} />
            </div>
            <div className="section-heading">
              <h2>RECENTLY ADMIRED</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {commerceService.catalog
                .getProductsByIds(recentlyViewedIds)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </>
        )}
        {tab === "orders" && <CustomerOrders orders={myOrders} />}
        {tab === "wishlist" &&
          (saved.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8">
              {saved.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="workspace-empty">
              <Heart />
              <h2>A home for your favourites</h2>
              <p className="muted">
                Tap the heart on a piece you love to save it here.
              </p>
              <Link href="/collections/shop-all" className="rose-button">
                Find your favourites
              </Link>
            </div>
          ))}
        {tab === "profile" && (
          <form
            className="workspace-panel workspace-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateDemoProfile({
                firstName: String(f.get("firstName")).trim(),
                lastName: String(f.get("lastName")).trim(),
                birthDate: String(f.get("birthDate")),
                phone: String(f.get("phone")),
              });
            }}
          >
            <h2>PERSONAL DETAILS</h2>
            <div className="form-pair">
              <label>
                First name
                <input
                  name="firstName"
                  required
                  defaultValue={session.firstName}
                />
              </label>
              <label>
                Last name
                <input
                  name="lastName"
                  required
                  defaultValue={session.lastName}
                />
              </label>
            </div>
            <label>
              Email address
              <input type="email" value={session.email} disabled />
            </label>
            <div className="form-pair">
              <label>
                Birthday
                <input
                  type="date"
                  name="birthDate"
                  defaultValue={session.birthDate}
                />
              </label>
              <label>
                Phone number
                <input type="tel" name="phone" defaultValue={session.phone} />
              </label>
            </div>
            <div>
              <button className="rose-button">Save changes</button>
            </div>
          </form>
        )}
        {tab === "addresses" && (
          <>
            <p className="muted mb-6">
              Your default delivery address is saved for your next visit.
            </p>
            <form
              className="workspace-panel workspace-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const address = Object.fromEntries(f.entries());
                updateDemoProfile({ defaultAddress: address });
              }}
            >
              <h2>
                {session.defaultAddress?.address
                  ? "EDIT DEFAULT ADDRESS"
                  : "ADD A DELIVERY ADDRESS"}
              </h2>
              <div className="form-pair">
                <label>
                  First name
                  <input
                    name="firstName"
                    required
                    defaultValue={
                      session.defaultAddress?.firstName || session.firstName
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    name="lastName"
                    required
                    defaultValue={
                      session.defaultAddress?.lastName || session.lastName
                    }
                  />
                </label>
              </div>
              <label>
                Street address
                <input
                  name="address"
                  required
                  defaultValue={session.defaultAddress?.address}
                />
              </label>
              <label>
                Apartment, suite, etc. (optional)
                <input
                  name="apartment"
                  defaultValue={session.defaultAddress?.apartment}
                />
              </label>
              <div className="form-pair">
                <label>
                  City
                  <input
                    name="city"
                    required
                    defaultValue={session.defaultAddress?.city}
                  />
                </label>
                <label>
                  State / region
                  <input
                    name="state"
                    required
                    defaultValue={session.defaultAddress?.state}
                  />
                </label>
              </div>
              <div className="form-pair">
                <label>
                  Postal code
                  <input
                    name="postalCode"
                    required
                    defaultValue={session.defaultAddress?.postalCode}
                  />
                </label>
                <label>
                  Country
                  <select
                    name="country"
                    defaultValue={
                      session.defaultAddress?.country || "United States"
                    }
                  >
                    {[
                      "United States",
                      "United Kingdom",
                      "Canada",
                      "Australia",
                      "Bangladesh",
                      "Singapore",
                      "India",
                      "Germany",
                      "France",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Phone number
                <input
                  type="tel"
                  name="phone"
                  defaultValue={session.defaultAddress?.phone}
                />
              </label>
              <div className="flex gap-3 flex-wrap">
                <button className="rose-button">Save address</button>
                {session.defaultAddress?.address && (
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => {
                      updateDemoProfile({ defaultAddress: {} });
                      navigate("overview");
                    }}
                  >
                    Remove address
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
