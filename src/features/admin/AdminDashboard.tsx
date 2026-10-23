"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  ShoppingBag,
  Gem,
  Users,
  TicketPercent,
  Settings,
  ArrowUpRight,
  Download,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Package,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { MOCK_PROMO_CODES } from "@/mocks/promotions";
import {
  applyCatalogUpdates,
  saveCatalogProduct,
  ProductUpdate,
} from "@/lib/admin-catalog";
import { DemoOrder, PromoCode } from "@/types/commerce";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';

const ADMIN_TABS = ['overview', 'orders', 'products', 'customers', 'discounts', 'settings'] as const;

type Tab =
  "overview" | "orders" | "products" | "customers" | "discounts" | "settings";
type SettingsData = { storeName: string; email: string; announcement: string };
const nav = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Gem },
  { id: "customers", label: "Customers", icon: Users },
  { id: "discounts", label: "Discounts", icon: TicketPercent },
  { id: "settings", label: "Store settings", icon: Settings },
];
const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function downloadCsv(name: string, rows: unknown[][]) {
  const text = rows
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const {
    orders,
    isHydrated,
    session,
    subscribedEmails,
    showToast,
    updateOrderStatus,
  } = useStore();
  const [tab, navigateTab] = useDashboardNavigation(ADMIN_TABS, 'overview');
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<ProductUpdate | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null);
  const [discounts, setDiscounts] = useState<PromoCode[]>(MOCK_PROMO_CODES);
  const [discountForm, setDiscountForm] = useState(false);
  useDialogFocus(Boolean(editing || selectedOrder || discountForm));
  const [settings, setSettings] = useState<SettingsData>({
    storeName: "J&CO. Jewellery",
    email: "hello@jcojewellery.com",
    announcement: "Free Shipping On Orders $60 USD+",
  });
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jco_admin_discounts_v1");
      if (saved) setDiscounts(JSON.parse(saved));
      const s = localStorage.getItem("jco_admin_settings_v1");
      if (s) setSettings(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(null);
        setSelectedOrder(null);
        setDiscountForm(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const products = useMemo(
    () => applyCatalogUpdates(MOCK_PRODUCTS, true),
    [isHydrated, revision],
  );
  const activeProducts = useMemo(
    () => applyCatalogUpdates(MOCK_PRODUCTS),
    [isHydrated, revision],
  );
  const filteredProducts = products.filter(
    (p) =>
      (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || (filter === "in-stock" ? p.inStock : !p.inStock)),
  );
  const filteredOrders = orders.filter(
    (o) =>
      (
        o.orderNumber +
        " " +
        o.shippingAddress.email +
        " " +
        o.shippingAddress.firstName
      )
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || o.status === filter),
  );
  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; orders: number; spent: number }
    >();
    for (const o of orders) {
      const email = o.shippingAddress.email;
      const c = map.get(email) || {
        name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
        email,
        orders: 0,
        spent: 0,
      };
      c.orders++;
      c.spent += o.total;
      map.set(email, c);
    }
    if (session && !map.has(session.email))
      map.set(session.email, {
        name: `${session.firstName} ${session.lastName}`,
        email: session.email,
        orders: 0,
        spent: 0,
      });
    for (const email of subscribedEmails)
      if (!map.has(email))
        map.set(email, {
          name: "Newsletter subscriber",
          email,
          orders: 0,
          spent: 0,
        });
    return [...map.values()];
  }, [orders, session, subscribedEmails]);
  function navigate(id: Tab) {
    navigateTab(id);
    setQuery("");
    setFilter("all");
    setPage(0);
  }
  function saveDiscounts(next: PromoCode[]) {
    try {
      localStorage.setItem("jco_admin_discounts_v1", JSON.stringify(next));
      setDiscounts(next);
      showToast("Discounts saved");
    } catch {
      showToast("Your browser could not save this change.");
    }
  }
  function orderTable(list: DemoOrder[]) {
    return list.length ? (
      <div className="workspace-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>#{o.orderNumber}</td>
                <td>
                  {new Date(o.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                  <p className="muted">{o.shippingAddress.email}</p>
                </td>
                <td>
                  <span
                    className={`status-pill ${o.status.startsWith("Confirmed") ? "pending" : ""}`}
                  >
                    {o.status.replace(" (Demo)", "")}
                  </span>
                </td>
                <td>{money(o.total)}</td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`View order ${o.orderNumber}`}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <ArrowUpRight />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="workspace-empty">
        <ShoppingBag />
        <h2>
          {query || filter !== "all"
            ? "No matching orders"
            : "Your first order starts a new story"}
        </h2>
        <p className="muted">
          {query || filter !== "all"
            ? "Try another search or clear your filters."
            : "Orders placed in the storefront will appear here."}
        </p>
        <Link className="outline-button" href="/collections/shop-all">
          Visit storefront
        </Link>
      </div>
    );
  }
  const pageSize = 10;
  const paginated = filteredProducts.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );
  return (
    <>
      <header className="admin-header">
        <div>
          <Link href="/" className="brand-wordmark">
            J&amp;CO.
          </Link>
          <span className="eyebrow">MERCHANT STUDIO · DEMO</span>
        </div>
        <Link href="/">
          View store <ArrowUpRight size={15} />
        </Link>
        <span className="admin-avatar">JC</span>
      </header>
      <div className="workspace admin-workspace">
        <aside className="workspace-sidebar">
          <p className="eyebrow">YOUR STORE</p>
          {nav.map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "active" : ""}
              onClick={() => navigate(n.id as Tab)}
            >
              <n.icon />
              {n.label}
              {n.id === "orders" && orders.length > 0 && (
                <span className="ml-auto text-[10px]">{orders.length}</span>
              )}
            </button>
          ))}
          <Link href="/account">
            <Users />
            Customer account
          </Link>
          <p className="muted mt-auto p-3 text-[10px]">
            Frontend preview
            <br />
            Changes are saved in this browser.
          </p>
        </aside>
        <main className="workspace-content">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">J&amp;CO. MERCHANT STUDIO</p>
              <h1 className="mt-3">
                {tab === "overview"
                  ? "A beautiful day for your business."
                  : nav.find((n) => n.id === tab)?.label}
              </h1>
              <p className="muted">
                {tab === "overview"
                  ? "Here’s how your store is doing. Every little detail, in one place."
                  : tab === "products"
                    ? "Thoughtfully curated. Beautifully managed."
                    : tab === "orders"
                      ? "Follow every order from your store to their door."
                      : tab === "customers"
                        ? "The people who make your jewellery part of their story."
                        : tab === "discounts"
                          ? "A little something to make their day."
                          : "Make your store feel like you."}
              </p>
            </div>
            {tab === "overview" && (
              <button
                className="outline-button"
                onClick={() =>
                  downloadCsv("jco-orders.csv", [
                    ["Order", "Date", "Customer", "Total", "Status"],
                    ...orders.map((o) => [
                      o.orderNumber,
                      o.createdAt,
                      o.shippingAddress.email,
                      o.total,
                      o.status,
                    ]),
                  ])
                }
              >
                <Download size={14} />
                Export report
              </button>
            )}
            {tab === "products" && (
              <button
                className="outline-button"
                onClick={() =>
                  downloadCsv("jco-products.csv", [
                    ["Product", "Price USD", "In stock"],
                    ...products.map((p) => [p.name, p.basePrice, p.inStock]),
                  ])
                }
              >
                <Download size={14} />
                Export
              </button>
            )}
            {tab === "discounts" && (
              <button
                className="rose-button"
                onClick={() => setDiscountForm(true)}
              >
                <Plus size={14} />
                Create discount
              </button>
            )}
          </div>
          {tab === "overview" && (
            <>
              <div className="stat-grid">
                {[
                  {
                    label: "Total sales",
                    value: money(revenue),
                    note: "From storefront orders",
                  },
                  {
                    label: "Orders",
                    value: orders.length,
                    note: `${orders.filter((o) => o.status.startsWith("Confirmed")).length} awaiting fulfilment`,
                  },
                  {
                    label: "Customers",
                    value: customers.length,
                    note: "Customers & subscribers",
                  },
                  {
                    label: "Active products",
                    value: activeProducts.length,
                    note: `${products.filter((p) => !p.inStock).length} currently out of stock`,
                  },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                    <small>{s.note}</small>
                  </div>
                ))}
              </div>
              <div className="workspace-two-col">
                <div className="workspace-panel">
                  <div className="section-heading">
                    <h2>SALES OVERVIEW</h2>
                    <span className="muted">Last 7 days</span>
                  </div>
                  {orders.length ? (
                    <div className="chart-bars">
                      {Array.from({ length: 7 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 6 + i);
                        const total = orders
                          .filter(
                            (o) =>
                              new Date(o.createdAt).toDateString() ===
                              date.toDateString(),
                          )
                          .reduce((n, o) => n + o.total, 0);
                        return (
                          <div
                            className="chart-bar"
                            key={i}
                            title={`${date.toLocaleDateString()}: ${money(total)}`}
                          >
                            <i
                              style={{
                                height: total
                                  ? `${Math.max(8, (total / Math.max(revenue, 1)) * 150)}px`
                                  : "2px",
                              }}
                            />
                            <span>
                              {date.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="admin-chart-empty">
                      Your sales chart will grow with your first order.
                    </div>
                  )}
                </div>
                <div className="workspace-panel">
                  <div className="section-heading">
                    <h2>STORE AT A GLANCE</h2>
                    <Gem size={18} strokeWidth={1} />
                  </div>
                  {[
                    {
                      label: "Available to shop",
                      value: activeProducts.filter((p) => p.inStock).length,
                    },
                    {
                      label: "Newsletter subscribers",
                      value: subscribedEmails.length,
                    },
                    { label: "Active discount codes", value: discounts.length },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex justify-between py-4 border-b border-[#eee8e3] text-xs"
                    >
                      <span className="muted">{s.label}</span>
                      <span>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="workspace-panel">
                <div className="section-heading">
                  <h2>RECENT ORDERS</h2>
                  <button
                    className="muted underline"
                    onClick={() => navigate("orders")}
                  >
                    View all orders
                  </button>
                </div>
                {orderTable(orders.slice(0, 5))}
              </div>
              <div className="workspace-panel">
                <div className="section-heading">
                  <h2>YOUR COLLECTION, AT A GLANCE</h2>
                  <button
                    className="muted underline"
                    onClick={() => navigate("products")}
                  >
                    Manage products
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      className="text-left"
                      onClick={() => {
                        navigate("products");
                        setEditing({
                          id: p.id,
                          name: p.name,
                          basePrice: p.basePrice,
                          inStock: p.inStock,
                          stockCount: p.variants[0].stockCount,
                        });
                      }}
                    >
                      <img
                        className="aspect-square object-cover w-full"
                        src={p.images[0]}
                        alt={p.name}
                      />
                      <p className="text-xs mt-3">{p.name}</p>
                      <p className="muted">{money(p.basePrice)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === "orders" && (
            <div className="workspace-panel">
              <div className="workspace-toolbar">
                <input
                  className="workspace-search"
                  aria-label="Search orders"
                  placeholder="Search orders, customers or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Filter orders"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="Confirmed (Demo)">Confirmed</option>
                  <option value="Preparing Shipment (Demo)">
                    Preparing shipment
                  </option>
                </select>
              </div>
              {orderTable(filteredOrders)}
            </div>
          )}
          {tab === "products" && (
            <div className="workspace-panel">
              <div className="workspace-toolbar">
                <div className="relative flex-1">
                  <input
                    className="workspace-search"
                    aria-label="Search products"
                    placeholder="Search your collection…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>
                <select
                  aria-label="Filter products"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="all">All products</option>
                  <option value="in-stock">In stock</option>
                  <option value="out-of-stock">Out of stock</option>
                </select>
              </div>
              <div className="workspace-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Collection</th>
                      <th>Price</th>
                      <th>Availability</th>
                      <th>Visibility</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product">
                            <img src={p.images[0]} alt="" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="capitalize">
                          {p.category.replaceAll("-", " ")}
                        </td>
                        <td>{money(p.basePrice)}</td>
                        <td>
                          <span
                            className={`status-pill ${p.inStock ? "" : "inactive"}`}
                          >
                            {p.inStock ? "In stock" : "Sold out"}
                          </span>
                        </td>
                        <td>
                          {activeProducts.some((a) => a.id === p.id)
                            ? "Published"
                            : "Archived"}
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Edit ${p.name}`}
                            onClick={() =>
                              setEditing({
                                id: p.id,
                                name: p.name,
                                basePrice: p.basePrice,
                                inStock: p.inStock,
                                hidden: !activeProducts.some(
                                  (a) => a.id === p.id,
                                ),
                                stockCount: p.variants[0].stockCount,
                              })
                            }
                          >
                            <Pencil />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!paginated.length && (
                  <div className="workspace-empty muted">
                    No products match your search.
                  </div>
                )}
              </div>
              <div className="pagination">
                <span>
                  {filteredProducts.length ? page * pageSize + 1 : 0}–
                  {Math.min((page + 1) * pageSize, filteredProducts.length)} of{" "}
                  {filteredProducts.length} products
                </span>
                <div>
                  <button
                    className="icon-button"
                    disabled={!page}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous products"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    className="icon-button"
                    disabled={(page + 1) * pageSize >= filteredProducts.length}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next products"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab === "customers" && (
            <div className="workspace-panel">
              <div className="workspace-toolbar">
                <input
                  className="workspace-search"
                  aria-label="Search customers"
                  placeholder="Search customers…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="outline-button"
                  onClick={() =>
                    downloadCsv("jco-customers.csv", [
                      ["Name", "Email", "Orders", "Spent USD"],
                      ...customers.map((c) => [
                        c.name,
                        c.email,
                        c.orders,
                        c.spent,
                      ]),
                    ])
                  }
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
              {customers.length ? (
                <div className="workspace-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Orders</th>
                        <th>Total spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .filter((c) =>
                          (c.name + " " + c.email)
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .map((c) => (
                          <tr key={c.email}>
                            <td>{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.orders}</td>
                            <td>{money(c.spent)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="workspace-empty">
                  <Users />
                  <h2>Meet your community, right here.</h2>
                  <p className="muted">
                    Customers and newsletter subscribers will appear as they
                    visit your store.
                  </p>
                </div>
              )}
            </div>
          )}
          {tab === "discounts" && (
            <div className="workspace-panel">
              <div className="workspace-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Discount code</th>
                      <th>Offer</th>
                      <th>Minimum order</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((d) => (
                      <tr key={d.code}>
                        <td className="tracking-wider">{d.code}</td>
                        <td>
                          {d.discountType === "percentage"
                            ? `${d.value}% off`
                            : `${money(d.value)} off`}
                        </td>
                        <td>{money(d.minSubtotal || 0)}</td>
                        <td>
                          <span className="status-pill">Active</span>
                        </td>
                        <td>
                          <button
                            className="muted underline"
                            aria-label={`Remove discount ${d.code}`}
                            onClick={() =>
                              saveDiscounts(
                                discounts.filter((x) => x.code !== d.code),
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!discounts.length && (
                  <div className="workspace-empty muted">
                    Create your first discount code.
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "settings" && (
            <form
              className="workspace-panel workspace-form"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  localStorage.setItem(
                    "jco_admin_settings_v1",
                    JSON.stringify(settings),
                  );
                  showToast("Store settings saved");
                } catch {
                  showToast("Unable to save settings in this browser.");
                }
              }}
            >
              <h2>STORE DETAILS</h2>
              <label>
                Store name
                <input
                  required
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </label>
              <label>
                Announcement bar
                <input
                  required
                  maxLength={120}
                  value={settings.announcement}
                  onChange={(e) =>
                    setSettings({ ...settings, announcement: e.target.value })
                  }
                />
              </label>
              <p className="muted">
                These settings are used in this browser’s storefront preview.
              </p>
              <div>
                <button className="rose-button">Save settings</button>
              </div>
            </form>
          )}
        </main>
      </div>
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <section
            className="workspace-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit product"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <h2>EDIT PRODUCT</h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close product editor"
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="workspace-form"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  saveCatalogProduct(editing);
                  setRevision(revision + 1);
                  setEditing(null);
                  showToast("Product updated in your storefront");
                } catch {
                  showToast("Unable to save product.");
                }
              }}
            >
              <label>
                Product name
                <input
                  autoFocus
                  required
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              <div className="form-pair">
                <label>
                  Price (USD)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={editing.basePrice}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        basePrice: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Stock available per variant
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editing.stockCount ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stockCount: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Availability
                <select
                  value={editing.inStock ? "available" : "sold-out"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      inStock: e.target.value === "available",
                      stockCount:
                        e.target.value === "available"
                          ? Math.max(1, editing.stockCount || 0)
                          : 0,
                    })
                  }
                >
                  <option value="available">In stock</option>
                  <option value="sold-out">Sold out</option>
                </select>
              </label>
              <label>
                Storefront visibility
                <select
                  value={editing.hidden ? "archived" : "published"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      hidden: e.target.value === "archived",
                    })
                  }
                >
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <p className="muted">
                Changes apply to this browser’s demo storefront.
              </p>
              <div className="flex gap-3">
                <button className="rose-button">Save product</button>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <section
            className="workspace-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <h2>ORDER #{selectedOrder.orderNumber}</h2>
              <button
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="muted">
              {selectedOrder.shippingAddress.firstName}{" "}
              {selectedOrder.shippingAddress.lastName} ·{" "}
              {selectedOrder.shippingAddress.email}
            </p>
            <div className="my-5">
              {selectedOrder.items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-4 py-3 border-b border-[#eee]"
                >
                  <img
                    className="w-14 h-14 object-cover"
                    src={i.image}
                    alt={i.name}
                  />
                  <div className="flex-1 text-xs">
                    <p>{i.name}</p>
                    <p className="muted">
                      {i.finish} · Qty {i.quantity}
                    </p>
                  </div>
                  <span className="text-xs">{money(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <p className="muted">
              Ship to: {selectedOrder.shippingAddress.address},{" "}
              {selectedOrder.shippingAddress.city},{" "}
              {selectedOrder.shippingAddress.country}{" "}
              {selectedOrder.shippingAddress.postalCode}
            </p>
            <div className="flex justify-between my-6 text-sm">
              <span>Total</span>
              <strong>{money(selectedOrder.total)}</strong>
            </div>
            <button
              className="rose-button"
              onClick={() => {
                updateOrderStatus(
                  selectedOrder.id,
                  "Preparing Shipment (Demo)",
                );
                setSelectedOrder({
                  ...selectedOrder,
                  status: "Preparing Shipment (Demo)",
                });
              }}
            >
              <Package size={15} />
              Mark as preparing shipment
            </button>
          </section>
        </div>
      )}
      {discountForm && (
        <div className="modal-backdrop" onClick={() => setDiscountForm(false)}>
          <section
            className="workspace-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create discount"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <h2>CREATE DISCOUNT</h2>
              <button
                aria-label="Close discount form"
                onClick={() => setDiscountForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="workspace-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const code = String(f.get("code")).trim().toUpperCase();
                if (discounts.some((d) => d.code === code)) {
                  showToast("That discount code already exists");
                  return;
                }
                saveDiscounts([
                  ...discounts,
                  {
                    code,
                    description: "Store promotion",
                    discountType: "percentage",
                    value: Number(f.get("value")),
                    minSubtotal: Number(f.get("minimum")),
                  },
                ]);
                setDiscountForm(false);
              }}
            >
              <label>
                Discount code
                <input
                  name="code"
                  required
                  pattern="[A-Za-z0-9_-]{3,24}"
                  placeholder="SPARKLE15"
                  autoFocus
                />
              </label>
              <div className="form-pair">
                <label>
                  Percentage off
                  <input
                    name="value"
                    type="number"
                    min="1"
                    max="100"
                    required
                    defaultValue="15"
                  />
                </label>
                <label>
                  Minimum order (USD)
                  <input
                    name="minimum"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0"
                    required
                  />
                </label>
              </div>
              <button className="rose-button">Create discount</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
