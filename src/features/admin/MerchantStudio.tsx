"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Gem,
  Package,
  ChartNoAxesCombined,
  Users,
  GitBranch,
  House,
  TicketPercent,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowUpRight,
  Bell,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useMerchant } from "@/hooks/useMerchant";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import {
  changeMerchant,
  merchantProducts,
  defaultOrderDetails,
  paymentTotals,
  moneyBDT,
  merchantReady,
} from "@/lib/merchant-store";
import { ProductManager } from "./ProductManager";
import { CategoryManager } from "./CategoryManager";
import { HomepageManager } from "./HomepageManager";
import { DiscountManager } from "./DiscountManager";
import { Statistics } from "./Statistics";
import { BrowserDataTools } from "./BrowserDataTools";
import { Documentation } from "./Documentation";
import { Inventory, OrderManager, Customers, sampleOrders } from "./Operations";
import {
  Panel,
  Stat,
  Chart,
  Badge,
  Field,
  dayKey,
  periodBuckets,
} from "./admin-shared";
const tabs = [
  "overview",
  "orders",
  "payments",
  "products",
  "inventory",
  "statistics",
  "customers",
  "categories",
  "homepage",
  "discounts",
  "documentation",
  "settings",
] as const;
type Tab = (typeof tabs)[number];
const nav = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "orders", name: "Orders", icon: ShoppingBag },
  { id: "payments", name: "Payments", icon: Wallet },
  { id: "products", name: "Products", icon: Gem },
  { id: "inventory", name: "Inventory", icon: Package },
  { id: "statistics", name: "Statistics", icon: ChartNoAxesCombined },
  { id: "customers", name: "Customers", icon: Users },
  { id: "categories", name: "Categories & menus", icon: GitBranch },
  { id: "homepage", name: "Homepage", icon: House },
  { id: "discounts", name: "Discounts & sales", icon: TicketPercent },
  { id: "documentation", name: "Documentation", icon: BookOpen },
  { id: "settings", name: "Store settings", icon: Settings },
];
const descriptions: Record<Tab, string> = {
  overview: "The important details. A little room to grow.",
  orders: "From their first click to a little box at their door.",
  payments: "Every payment, every refund. Clearly connected.",
  products: "Thoughtful pieces, beautifully managed.",
  inventory: "Know what is ready, and what needs a little attention.",
  statistics: "See what catches their eye.",
  customers: "The people who make your jewellery part of their story.",
  categories: "A simple path from your collections to their next favourite.",
  homepage: "Your storefront, with a personal touch.",
  discounts: "A little something special, beautifully presented.",
  documentation: "A clear path through every part of your business.",
  settings: "The details that keep your shop running.",
};
export function MerchantStudio() {
  const { data, error } = useMerchant();
  const store = useStore();
  const [tab, navigateTab] = useDashboardNavigation(tabs, "overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [sample, setSample] = useState(false);
  const [range, setRange] = useState("7");
  const [end, setEnd] = useState(dayKey(new Date()));
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return dayKey(d);
  });
  const [editId, setEditId] = useState<string>();
  const [newKey, setNewKey] = useState(0);
  const [alerts, setAlerts] = useState(false);
  useDialogFocus(mobile);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobile(false);
        setAlerts(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("jco_studio_collapsed") === "true");
    } catch {}
  }, []);
  function navigate(id: string, filter = "all") {
    if (!tabs.includes(id as Tab)) return false;
    const event = new Event("jco:before-panel", { cancelable: true });
    if (!window.dispatchEvent(event)) return false;
    navigateTab(id as Tab);
    const url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);
    window.history.replaceState(null, "", url.pathname + url.search);
    setMobile(false);
    setAlerts(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }
  function editProduct(id: string) {
    if (!navigate("products")) return;
    setEditId(id);
  }
  function addProduct() {
    if (!navigate("products")) return;
    setEditId("__new__");
    setNewKey((k) => k + 1);
  }
  function setPeriod(value: string) {
    setRange(value);
    if (value === "custom") return;
    const today = new Date();
    const previous = new Date();
    previous.setDate(today.getDate() - (Number(value) - 1));
    setStart(dayKey(previous));
    setEnd(dayKey(today));
  }
  const allOrders = sample
    ? sampleOrders()
    : [
        ...data.orders,
        ...store.orders.filter((o) => !data.orders.some((n) => n.id === o.id)),
      ];
  const inRange = allOrders.filter(
    (o) => dayKey(o.createdAt) >= start && dayKey(o.createdAt) <= end,
  );
  const ordersBDT = inRange.filter((o) => o.currency === "BDT");
  const totals = paymentTotals(ordersBDT, data.orderDetails);
  const products = merchantProducts(undefined, true);
  const low = products.filter((p) =>
    p.variants.some((v) => v.stockCount <= (p.lowStockThreshold ?? 5)),
  );
  const pending = allOrders.filter(
    (o) =>
      (data.orderDetails[o.id] || defaultOrderDetails(o)).paymentStatus ===
      "pending",
  );
  const unfulfilled = allOrders.filter((o) =>
    ["unfulfilled", "processing"].includes(
      (data.orderDetails[o.id] || defaultOrderDetails(o)).fulfillment,
    ),
  );
  const returns = allOrders.filter((o) =>
    ["requested", "approved"].includes(
      (data.orderDetails[o.id] || defaultOrderDetails(o)).returnStatus,
    ),
  );
  const overdue = data.home.filter(
    (b) =>
      b.updatedAt &&
      Date.now() - new Date(b.updatedAt).getTime() >
        (b.reviewDays || 30) * 86400000,
  );
  const paid = ordersBDT.filter((o) =>
    ["successful", "partially-refunded", "refunded"].includes(
      (data.orderDetails[o.id] || defaultOrderDetails(o)).paymentStatus,
    ),
  );
  const buckets = periodBuckets(start, end);
  const top = products
    .map((p) => ({
      p,
      units: paid.reduce(
        (n, o) =>
          n +
          o.items
            .filter((i) => i.productId === p.id)
            .reduce((a, i) => a + i.quantity, 0),
        0,
      ),
    }))
    .filter((p) => p.units)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  let margin = 0,
    costed = 0;
  paid.forEach((o) =>
    o.items.forEach((i) => {
      const p = products.find((p) => p.id === i.productId);
      const cost = p?.costs?.[i.variantId];
      if (cost !== undefined) {
        margin += (i.price - cost) * i.quantity;
        costed += i.quantity;
      }
    }),
  );
  if (!merchantReady() && !error)
    return <div className="workspace-empty">Opening your merchant studio…</div>;
  return (
    <div
      className={`merchant-studio ${collapsed ? "is-collapsed" : ""} ${mobile ? "menu-open" : ""}`}
    >
      <div className="studio-ambient" aria-hidden="true" />
      {mobile && (
        <button
          className="studio-mobile-backdrop"
          aria-label="Close admin navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className="studio-sidebar"
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile ? true : undefined}
        aria-label="Merchant navigation"
      >
        <div className="studio-brand">
          <Link href="/" className="brand-wordmark">
            J&amp;CO.
          </Link>
          <button
            className="studio-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              const value = !collapsed;
              setCollapsed(value);
              try {
                localStorage.setItem("jco_studio_collapsed", String(value));
              } catch {}
            }}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
          <button
            className="studio-mobile-close"
            aria-label="Close sidebar"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="studio-store-label">
          <span className="studio-store-dot" />
          <span>
            Merchant studio<small>YOUR STORE, AT A GLANCE</small>
          </span>
        </div>
        <nav aria-label="Admin navigation">
          {nav.map((n, i) => (
            <button
              key={n.id}
              title={collapsed ? n.name : undefined}
              aria-label={n.name}
              aria-current={tab === n.id ? "page" : undefined}
              className={tab === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} />
              <span>{n.name}</span>
              {n.id === "orders" && unfulfilled.length > 0 && (
                <b>{unfulfilled.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="studio-sidebar-bottom">
          <Link href="/" title="View store">
            <ArrowUpRight size={18} />
            <span>View your storefront</span>
          </Link>
          <div className="studio-local-label">
            <span />
            Browser preview<small>Saved locally · No real charges</small>
          </div>
        </div>
      </aside>
      <div className="studio-main">
        <header className="studio-topbar">
          <div className="studio-actions">
            <button
              className="studio-mobile-toggle"
              aria-label="Open admin navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span className="studio-breadcrumb">
              Your store <span>/</span>{" "}
              <strong>{nav.find((n) => n.id === tab)?.name}</strong>
            </span>
          </div>
          <div className="studio-actions">
            <Link className="studio-view-store" href="/">
              View store <ArrowUpRight size={14} />
            </Link>
            <button
              className="studio-icon studio-alert-trigger"
              aria-label="Operational alerts"
              onClick={() => setAlerts(!alerts)}
            >
              <Bell size={19} />
              {low.length + pending.length + overdue.length > 0 && <i />}
            </button>
            <button className="studio-button" onClick={addProduct}>
              <Plus size={17} />
              <span>Add product</span>
            </button>
            <span className="studio-avatar">JC</span>
          </div>
          {alerts && (
            <div className="studio-alert-popover">
              <h3>Needs a little attention</h3>
              {[
                [`${unfulfilled.length} orders to fulfill`, "orders"],
                [`${pending.length} pending payments`, "payments"],
                [`${low.length} products low or out of stock`, "inventory"],
                [
                  `${overdue.length} homepage sections due for review`,
                  "homepage",
                ],
              ].map(([label, target]) => (
                <button key={target} onClick={() => navigate(target)}>
                  {label}
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          )}
        </header>
        <main className="studio-content">
          <div className="studio-page-heading">
            <div>
              <p className="studio-eyebrow">
                <Sparkles size={14} />
                J&amp;CO. MERCHANT STUDIO
              </p>
              <h1>
                {tab === "overview"
                  ? "A beautiful day for your business."
                  : nav.find((n) => n.id === tab)?.name}
              </h1>
              <p>{descriptions[tab]}</p>
            </div>
            {["overview", "orders", "payments", "customers"].includes(tab) && (
              <div className="studio-segments">
                <button
                  className={!sample ? "active" : ""}
                  onClick={() => setSample(false)}
                >
                  Observed data
                </button>
                <button
                  className={sample ? "active" : ""}
                  onClick={() => setSample(true)}
                >
                  Sample dataset
                </button>
              </div>
            )}
          </div>
          {sample &&
            ["overview", "orders", "payments", "customers"].includes(tab) && (
              <p className="studio-callout">
                Sample dataset · Illustrative customers and orders. Excluded
                from observed storefront data.
              </p>
            )}
          {error && (
            <p className="studio-error" role="alert">
              {error}
            </p>
          )}
          {["overview", "orders", "payments", "statistics"].includes(tab) && (
            <div className="studio-date-toolbar">
              <span>Reporting period · Asia/Dhaka</span>
              <select
                aria-label="Reporting period"
                value={range}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="1">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
              {range === "custom" && (
                <>
                  <input
                    type="date"
                    aria-label="Start date"
                    value={start}
                    max={end}
                    onChange={(e) => e.target.value && setStart(e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    aria-label="End date"
                    min={start}
                    value={end}
                    onChange={(e) => e.target.value && setEnd(e.target.value)}
                  />
                </>
              )}
            </div>
          )}
          <div className="studio-panel-transition" key={tab}>
            {tab === "overview" && (
              <>
                <div className="studio-stat-grid">
                  <Stat
                    label="Payments received"
                    value={moneyBDT(totals.received)}
                    note="Successful payments only"
                    onClick={() => navigate("payments", "paid")}
                  />
                  <Stat
                    label="Net collections"
                    value={moneyBDT(totals.net)}
                    note={`${moneyBDT(totals.refunded)} refunded`}
                    onClick={() => navigate("payments")}
                  />
                  <Stat
                    label="Orders"
                    value={ordersBDT.length}
                    note={`${unfulfilled.length} awaiting fulfillment`}
                    onClick={() => navigate("orders")}
                  />
                  <Stat
                    label="Average paid order"
                    value={moneyBDT(
                      paid.length ? totals.received / paid.length : 0,
                    )}
                    note={`${paid.reduce((n, o) => n + o.items.reduce((a, i) => a + i.quantity, 0), 0)} units sold`}
                    onClick={() => navigate("orders")}
                  />
                </div>
                <div className="studio-attention-grid">
                  {[
                    [unfulfilled.length, "To fulfill", "orders"],
                    [pending.length, "Pending payments", "payments"],
                    [returns.length, "Open returns", "orders"],
                    [low.length, "Stock alerts", "inventory"],
                  ].map(([count, label, target]) => (
                    <button
                      key={String(label)}
                      onClick={() =>
                        navigate(
                          String(target),
                          label === "To fulfill"
                            ? "needs-fulfillment"
                            : label === "Pending payments"
                              ? "pending"
                              : label === "Open returns"
                                ? "returns"
                                : "attention",
                        )
                      }
                    >
                      <span>{label}</span>
                      <strong>{count}</strong>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
                <div className="studio-split">
                  <Panel
                    title="Sales, day by day"
                    action={
                      <span className="studio-caption">
                        Successful payments · BDT
                      </span>
                    }
                  >
                    <Chart
                      values={buckets.map((bucket) =>
                        paid
                          .filter(
                            (o) =>
                              dayKey(o.createdAt) >= bucket.start &&
                              dayKey(o.createdAt) <= bucket.end,
                          )
                          .reduce((n, o) => n + o.total, 0),
                      )}
                      labels={buckets.map((b) => b.label)}
                      prefix="৳"
                    />
                  </Panel>
                  <Panel title="Payment mix">
                    {(["bKash", "Nagad"] as const).map((provider) => {
                      const sum = paymentTotals(
                        ordersBDT.filter(
                          (o) =>
                            (data.orderDetails[o.id] || defaultOrderDetails(o))
                              .provider === provider,
                        ),
                        data.orderDetails,
                      ).net;
                      return (
                        <button
                          className="studio-provider-row"
                          key={provider}
                          onClick={() =>
                            navigate("payments", `provider:${provider}`)
                          }
                        >
                          <span
                            className={`provider-dot ${provider.toLowerCase()}`}
                          />
                          <span>
                            <strong>{provider}</strong>
                            <small>Net after refunds</small>
                          </span>
                          <b>{moneyBDT(sum)}</b>
                        </button>
                      );
                    })}
                    <div className="studio-inset">
                      <h3>Product margin estimate</h3>
                      <strong>
                        {costed
                          ? moneyBDT(margin)
                          : "Add product costs to see this"}
                      </strong>
                      <p className="studio-caption">
                        Based on {costed} units with recorded costs. Before
                        operating expenses and refunds; not accounting profit.
                      </p>
                    </div>
                  </Panel>
                </div>
                <div className="studio-split">
                  <Panel
                    title="Recent orders"
                    action={
                      <button
                        className="studio-text-button"
                        onClick={() => navigate("orders")}
                      >
                        View all →
                      </button>
                    }
                  >
                    {inRange.slice(0, 5).map((o) => (
                      <button
                        className="studio-list-line studio-wide-button"
                        key={o.id}
                        onClick={() => navigate("orders")}
                      >
                        <span>
                          <strong>#{o.orderNumber}</strong>
                          <small>
                            {o.shippingAddress.firstName} ·{" "}
                            {
                              (
                                data.orderDetails[o.id] ||
                                defaultOrderDetails(o)
                              ).fulfillment
                            }
                          </small>
                        </span>
                        <b>
                          {o.currency === "BDT"
                            ? moneyBDT(o.total)
                            : `${o.total} USD`}
                        </b>
                      </button>
                    ))}
                    {!inRange.length && (
                      <div className="studio-empty">
                        <ShoppingBag size={30} />
                        <h3>Your next chapter starts here</h3>
                        <p>
                          Storefront demo orders appear here. Explore the sample
                          dataset to see a populated workspace.
                        </p>
                        <button
                          className="studio-button secondary"
                          onClick={() => setSample(true)}
                        >
                          Explore sample data
                        </button>
                      </div>
                    )}
                  </Panel>
                  <Panel title="Best-selling pieces">
                    {top.map(({ p, units }) => (
                      <button
                        key={p.id}
                        className="studio-product-cell studio-wide-button"
                        onClick={() => editProduct(p.id)}
                      >
                        <img src={p.images[0]} alt="" />
                        <span>
                          <strong>{p.name}</strong>
                          <small>{units} units sold</small>
                        </span>
                        <ArrowUpRight size={16} />
                      </button>
                    ))}
                    {!top.length && (
                      <p className="studio-caption">
                        Your best sellers will emerge from successful orders.
                      </p>
                    )}
                  </Panel>
                </div>
                <Panel title="Your next small improvements">
                  <div className="studio-quick-links">
                    <button onClick={addProduct}>
                      <Plus size={22} />
                      <strong>Add something new</strong>
                      <span>Create and publish a piece</span>
                    </button>
                    <button onClick={() => navigate("homepage")}>
                      <House size={22} />
                      <strong>Refresh your window</strong>
                      <span>
                        {overdue.length
                          ? `${overdue.length} sections due for review`
                          : "Update homepage campaigns"}
                      </span>
                    </button>
                    <button onClick={() => navigate("documentation")}>
                      <BookOpen size={22} />
                      <strong>A little guidance</strong>
                      <span>Explore the workflow library</span>
                    </button>
                  </div>
                </Panel>
              </>
            )}
            {tab === "products" && (
              <ProductManager
                key={newKey}
                editId={editId}
                onEditHandled={() => setEditId(undefined)}
              />
            )}
            {tab === "inventory" && <Inventory editProduct={editProduct} />}{" "}
            {tab === "orders" && (
              <OrderManager orders={inRange} sample={sample} />
            )}{" "}
            {tab === "payments" && (
              <OrderManager orders={inRange} payments sample={sample} />
            )}{" "}
            {tab === "customers" && (
              <Customers orders={allOrders} sample={sample} />
            )}{" "}
            {tab === "statistics" && (
              <Statistics start={start} end={end} editProduct={editProduct} />
            )}{" "}
            {tab === "categories" && (
              <CategoryManager editProduct={editProduct} />
            )}{" "}
            {tab === "homepage" && <HomepageManager />}{" "}
            {tab === "discounts" && <DiscountManager />}{" "}
            {tab === "documentation" && <Documentation navigate={navigate} />}{" "}
            {tab === "settings" && <StoreSettings />}
          </div>
          <footer className="studio-footer">
            Made for your everyday business.
            <span>Frontend preview · BDT · Saved in this browser</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
function StoreSettings() {
  const { data } = useMerchant();
  const [settings, setSettings] = useState(data.settings);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  return (
    <>
    <BrowserDataTools />
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (
            settings.shipping < 0 ||
            settings.freeShipping < 0 ||
            settings.freeGift < 0
          )
            throw new Error("Shipping amounts cannot be negative.");
          if (!settings.bkash && !settings.nagad)
            throw new Error("Enable at least one demo payment method.");
          await changeMerchant((s) => {
            s.settings = settings;
          });
          setNotice("Your store settings are saved.");
          setError("");
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <div className="studio-editor-grid">
        <div>
          <Panel title="The store essentials">
            <div className="studio-form">
              <Field label="Store name">
                <input
                  required
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Contact email">
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </Field>
              <Field label="Announcement">
                <input
                  value={settings.announcement}
                  onChange={(e) =>
                    setSettings({ ...settings, announcement: e.target.value })
                  }
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Delivery & rewards">
            <div className="studio-form">
              {(
                [
                  ["Standard delivery fee (BDT)", "shipping"],
                  ["Free shipping threshold (BDT)", "freeShipping"],
                  ["Free gift threshold (BDT)", "freeGift"],
                ] as const
              ).map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          </Panel>
        </div>
        <Panel title="Payment configuration">
          <Badge>Demo mode</Badge>
          <p className="studio-caption">
            Payment gateway integration will be connected in a later phase. No
            keys, PINs or real transactions are collected.
          </p>
          <div className="studio-checks">
            <label>
              <input
                type="checkbox"
                checked={settings.bkash}
                onChange={(e) =>
                  setSettings({ ...settings, bkash: e.target.checked })
                }
              />
              bKash
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.nagad}
                onChange={(e) =>
                  setSettings({ ...settings, nagad: e.target.checked })
                }
              />
              Nagad
            </label>
          </div>
          <div className="studio-inset">
            <h3>Currency</h3>
            <p>Bangladeshi taka · BDT ৳</p>
            <small>
              Sample BDT catalog prices are editable. Legacy USD orders remain
              separate.
            </small>
          </div>
        </Panel>
      </div>
      {notice && (
        <p className="studio-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      <button className="studio-button" type="submit">
        Save store settings
      </button>
    </form>
    </>
  );
}
