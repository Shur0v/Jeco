"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Heart,
  MapPin,
  UserRound,
  LogOut,
  ArrowUpRight,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { commerceService } from "@/commerce";
import { ProductCard } from "@/components/shared/ProductCard";
import { CustomerOrders } from "./CustomerOrders";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";

const ACCOUNT_TABS = [
  "overview",
  "orders",
  "wishlist",
  "addresses",
  "profile",
] as const;

export function AccountDashboardView() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
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
  const [tab, navigateTab] = useDashboardNavigation(ACCOUNT_TABS, "overview");
  const saved = commerceService.catalog.getProductsByIds(wishlistIds);
  const admired = commerceService.catalog.getProductsByIds(recentlyViewedIds);
  const previewPieces = (saved.length ? saved : admired).slice(0, 3);
  const myOrders = orders.filter(
    (o) =>
      o.accountIdentifier?.toLowerCase() === session?.userId.toLowerCase() ||
      o.shippingAddress.email.toLowerCase() === session?.email.toLowerCase(),
  );
  function navigate(id: string) {
    if (ACCOUNT_TABS.includes(id as (typeof ACCOUNT_TABS)[number])) {
      navigateTab(id as (typeof ACCOUNT_TABS)[number]);
      setFeedback("");
    }
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
        <div className="account-identity">
          <span className="account-avatar" aria-hidden="true">
            {session.firstName.slice(0, 1)}
          </span>
          <div>
            <p className="eyebrow">MY J&amp;CO.</p>
            <strong>{session.firstName}</strong>
            <span>Your personal jewellery box</span>
          </div>
        </div>
        <nav aria-label="Account navigation">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => navigate(t.id)}
            >
              <t.icon />
              {t.label}
              {t.id === "wishlist" && saved.length > 0 && (
                <span className="account-nav-count">{saved.length}</span>
              )}
            </button>
          ))}
        </nav>
        <Link className="account-shop-link" href="/collections/shop-all">
          <ArrowUpRight /> Back to shopping
        </Link>
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
      <main className="workspace-content" id="account-content">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">YOUR EVERYDAY, A LITTLE MORE SPECIAL</p>
            <h1 className="mt-3">
              {tab === "overview"
                ? `Hello, ${session.firstName}`
                : tabs.find((t) => t.id === tab)?.label}
            </h1>
            <p className="muted">
              {
                {
                  overview: "A little space for everything you love.",
                  orders: "Your pieces, from our jewellery box to yours.",
                  wishlist: "All the pieces you have your heart set on.",
                  addresses: "Make your next delivery feel effortless.",
                  profile: "The little details that make this space yours.",
                }[tab]
              }
            </p>
          </div>
          <Link className="outline-button" href="/collections/new-arrivals">
            Keep exploring <ArrowUpRight size={14} />
          </Link>
        </div>
        {feedback && (
          <div className="account-feedback" role="status">
            <Check size={18} />
            {feedback}
          </div>
        )}
        <div key={tab} className="account-tab-content">
          {tab === "overview" && (
            <>
              <div className="workspace-welcome">
                <div>
                  <p className="eyebrow">
                    <Sparkles size={15} /> A LITTLE SOMETHING, JUST FOR YOU
                  </p>
                  <h2>Made to be part of your everyday.</h2>
                  <p className="muted">
                    Discover new favourites to stack, style and make your own.
                  </p>
                </div>
                <Link className="rose-button" href="/collections/new-arrivals">
                  Discover new arrivals <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="stat-grid customer-stats">
                {[
                  {
                    label: "Orders placed",
                    value: myOrders.length,
                    target: "orders",
                    icon: Package,
                    action: "Follow your orders",
                  },
                  {
                    label: "Saved favourites",
                    value: saved.length,
                    target: "wishlist",
                    icon: Heart,
                    action: "Explore your favourites",
                  },
                  {
                    label: "Your addresses",
                    value: session.defaultAddress?.address ? 1 : 0,
                    target: "addresses",
                    icon: MapPin,
                    action: session.defaultAddress?.address
                      ? "Manage delivery details"
                      : "Add a delivery address",
                  },
                ].map((s) => (
                  <button
                    key={s.target}
                    className="stat-card text-left"
                    onClick={() => navigate(s.target)}
                  >
                    <span className="account-stat-label">
                      <s.icon size={19} />
                      {s.label}
                    </span>
                    <strong>{s.value.toString().padStart(2, "0")}</strong>
                    <small>
                      {s.action}
                      <ArrowRight size={16} />
                    </small>
                  </button>
                ))}
              </div>
              <div className="account-overview-grid">
                <div className="workspace-panel account-orders-panel">
                  <div className="section-heading">
                    <h2>Recent orders</h2>
                    <button
                      className="muted underline"
                      onClick={() => navigate("orders")}
                    >
                      All orders <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <CustomerOrders orders={myOrders.slice(0, 1)} />
                </div>
                <div className="workspace-panel account-details-card">
                  <span className="account-icon">
                    <UserRound size={22} />
                  </span>
                  <h2>A little more you</h2>
                  <p className="muted">
                    Keep your details up to date for a smoother next visit.
                  </p>
                  <ul className="account-checklist">
                    <li>
                      <Check size={16} />
                      Your account is ready
                    </li>
                    <li>
                      {session.defaultAddress?.address ? (
                        <Check size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                      {session.defaultAddress?.address
                        ? "Delivery address saved"
                        : "Add your delivery address"}
                    </li>
                    <li>
                      {session.birthDate ? (
                        <Check size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {session.birthDate
                        ? "Birthday added"
                        : "Make it personal with your birthday"}
                    </li>
                  </ul>
                  <button
                    className="outline-button"
                    onClick={() =>
                      navigate(
                        session.defaultAddress?.address
                          ? "profile"
                          : "addresses",
                      )
                    }
                  >
                    {session.defaultAddress?.address
                      ? "Edit account details"
                      : "Add delivery details"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              {previewPieces.length > 0 && (
                <section className="account-pieces">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">YOUR OWN LITTLE COLLECTION</p>
                      <h2>
                        {saved.length
                          ? "Still on your mind?"
                          : "Recently admired"}
                      </h2>
                    </div>
                    {saved.length > 0 && (
                      <button
                        className="account-text-button"
                        onClick={() => navigate("wishlist")}
                      >
                        View wishlist <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>
                  <div className="account-product-grid">
                    {previewPieces.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              )}
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
                setFeedback("Your account details have been saved.");
              }}
            >
              <h2>PERSONAL DETAILS</h2>
              <p className="muted">
                Update your name, birthday and contact details below.
              </p>
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
                <input type="text" value={session.email} disabled />
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
                  setFeedback("Your delivery address has been saved.");
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
        </div>
      </main>
    </div>
  );
}
