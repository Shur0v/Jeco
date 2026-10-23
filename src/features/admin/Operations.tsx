"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Heart,
  ArrowUpRight,
  Download,
  Plus,
  Check,
  Truck,
} from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import { useStore } from "@/hooks/useStore";
import { DemoOrder } from "@/types/commerce";
import {
  changeMerchant,
  defaultOrderDetails,
  merchantProducts,
  OrderDetails,
  moneyBDT,
  uid,
  saveProduct,
  paymentTotals,
} from "@/lib/merchant-store";
import {
  Panel,
  Stat,
  Field,
  Modal,
  Badge,
  SearchBox,
  Pager,
  Empty,
  exportCsv,
} from "./admin-shared";
export function sampleOrders(): DemoOrder[] {
  const ps = merchantProducts();
  return Array.from({ length: 14 }, (_, i) => {
    const p = ps[i % ps.length],
      v = p.variants[0];
    const date = new Date();
    date.setDate(date.getDate() - (i % 7));
    return {
      id: `sample-order-${i}`,
      orderNumber: `DEMO-${2041 + i}`,
      createdAt: date.toISOString(),
      accountIdentifier: `customer${i % 5}@example.test`,
      items: [
        {
          id: `${p.id}__${v.id}`,
          productId: p.id,
          variantId: v.id,
          slug: p.slug,
          name: p.name,
          finish: v.finish,
          price: v.price,
          quantity: 1,
          image: p.images[0],
          maxStock: 100,
        },
      ],
      shippingAddress: {
        email: `customer${i % 5}@example.test`,
        firstName: ["Ayesha", "Farhan", "Nusrat", "Rafi", "Maliha"][i % 5],
        lastName: "Rahman",
        address: "24 Sample Road",
        city: "Dhaka",
        state: "Dhaka",
        country: "Bangladesh",
        postalCode: "1207",
        phone: "+880 1700 000000",
        marketingOptIn: false,
        smsOptIn: false,
      },
      shippingMethod: {
        id: "standard",
        name: "Standard delivery",
        description: "Local delivery",
        price: 100,
        estimatedDays: "2–4 business days",
      },
      subtotal: v.price,
      discountAmount: 0,
      shippingCost: 100,
      total: v.price + 100,
      currency: "BDT",
      paymentMethodLabel: i % 2 ? "bKash demo" : "Nagad demo",
      status: "Confirmed (Demo)",
    };
  });
}
export function Inventory({
  editProduct,
}: {
  editProduct: (id: string) => void;
}) {
  const { data } = useMerchant();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    setFilter(params.get("filter") || "all");
    setPage(0);
  }, [params]);
  const [page, setPage] = useState(0);
  const [adjust, setAdjust] = useState<{
    p: string;
    v: string;
    qty: number;
    reason: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const rows = merchantProducts(undefined, true)
    .flatMap((p) => p.variants.map((v) => ({ p, v })))
    .filter(
      ({ p, v }) =>
        (p.name + " " + p.id + " " + v.sku)
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "all" ||
          (filter === "out"
            ? v.stockCount === 0
            : filter === "attention"
              ? v.stockCount <= (p.lowStockThreshold ?? 5)
              : v.stockCount > 0 &&
                v.stockCount <= (p.lowStockThreshold ?? 5))),
    );
  async function save() {
    if (!adjust) return;
    try {
      if (
        !Number.isInteger(adjust.qty) ||
        adjust.qty < 0 ||
        !adjust.reason.trim()
      )
        throw new Error(
          "Enter a whole stock quantity and an adjustment reason.",
        );
      await changeMerchant((s) => {
        const original = merchantProducts(undefined, true).find(
          (p) => p.id === adjust.p,
        )!;
        let p = s.products.find((p) => p.id === original.id);
        if (!p) {
          p = structuredClone(original);
          s.products.push(p);
        }
        const v = p.variants.find((v) => v.id === adjust.v)!;
        s.adjustments.unshift({
          id: uid("adjust"),
          at: new Date().toISOString(),
          productId: p.id,
          variantId: v.id,
          before: v.stockCount,
          after: adjust.qty,
          reason: adjust.reason.trim(),
        });
        v.stockCount = adjust.qty;
        v.inStock = adjust.qty > 0;
        p.inStock = p.variants.some((v) => v.inStock);
      });
      setAdjust(null);
      setNotice("Stock updated and adjustment recorded.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="studio-stat-grid">
        <Stat
          label="Units available"
          value={merchantProducts(undefined, true).reduce(
            (n, p) => n + p.variants.reduce((a, v) => a + v.stockCount, 0),
            0,
          )}
        />
        <Stat
          label="Low stock variants"
          value={
            merchantProducts(undefined, true).flatMap((p) =>
              p.variants.filter(
                (v) =>
                  v.stockCount > 0 &&
                  v.stockCount <= (p.lowStockThreshold ?? 5),
              ),
            ).length
          }
          onClick={() => setFilter("low")}
        />
        <Stat
          label="Out of stock"
          value={
            merchantProducts(undefined, true).flatMap((p) =>
              p.variants.filter((v) => !v.stockCount),
            ).length
          }
          onClick={() => setFilter("out")}
        />
      </div>
      {notice && (
        <p role="status" className="studio-success">
          {notice}
        </p>
      )}
      <Panel title="Variant inventory">
        <div className="studio-toolbar">
          <SearchBox
            value={query}
            onChange={(s) => {
              setQuery(s);
              setPage(0);
            }}
            placeholder="Search product, ID or SKU"
          />
          <select
            aria-label="Stock filter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All stock</option>
            <option value="attention">Needs attention</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="studio-table">
          <table>
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(page * 10, page * 10 + 10).map(({ p, v }) => (
                <tr key={v.id}>
                  <td>
                    <button
                      className="studio-product-cell"
                      onClick={() => editProduct(p.id)}
                    >
                      <img src={p.images[0]} alt="" />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {v.sku} · {p.id}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    {v.finish} {v.size}
                  </td>
                  <td>
                    <strong>{v.stockCount}</strong>
                  </td>
                  <td>{p.lowStockThreshold ?? 5}</td>
                  <td>
                    <Badge>{v.stockCount ? "in stock" : "out of stock"}</Badge>
                  </td>
                  <td>
                    <button
                      className="studio-button secondary"
                      onClick={() => {
                        setAdjust({
                          p: p.id,
                          v: v.id,
                          qty: v.stockCount,
                          reason: "",
                        });
                        setError("");
                      }}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} total={rows.length} onChange={setPage} />
      </Panel>
      <Panel title="Adjustment history">
        <div className="studio-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product / Variant</th>
                <th>Before → After</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.adjustments.slice(0, 25).map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.at).toLocaleString()}</td>
                  <td>
                    {a.productId}
                    <small>{a.variantId}</small>
                  </td>
                  <td>
                    {a.before} → {a.after}
                  </td>
                  <td>{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.adjustments.length && (
          <p className="studio-caption">
            Stock adjustments and successful checkouts appear here.
          </p>
        )}
      </Panel>
      {adjust && (
        <Modal title="Adjust stock" onClose={() => setAdjust(null)}>
          <div className="studio-form">
            {error && (
              <p role="alert" className="studio-error">
                {error}
              </p>
            )}
            <Field label="Available quantity">
              <input
                type="number"
                min="0"
                step="1"
                value={adjust.qty}
                onChange={(e) =>
                  setAdjust({ ...adjust, qty: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Reason">
              <textarea
                value={adjust.reason}
                onChange={(e) =>
                  setAdjust({ ...adjust, reason: e.target.value })
                }
                placeholder="Restock, damage, count correction…"
              />
            </Field>
            <button className="studio-button" onClick={save}>
              Save adjustment
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function OrderManager({
  orders,
  payments = false,
  sample = false,
}: {
  orders: DemoOrder[];
  payments?: boolean;
  sample?: boolean;
}) {
  const { data } = useMerchant();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [provider, setProvider] = useState("all");
  useEffect(() => {
    const f = params.get("filter") || "all";
    setFilter(f.startsWith("provider:") ? "all" : f);
    setProvider(f.startsWith("provider:") ? f.slice(9) : "all");
    setPage(0);
  }, [params]);
  const [page, setPage] = useState(0);
  const [chosen, setChosen] = useState<DemoOrder | null>(null);
  const [draft, setDraft] = useState<OrderDetails | null>(null);
  const [refund, setRefund] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const details = (o: DemoOrder) =>
    data.orderDetails[o.id] || defaultOrderDetails(o);
  const list = orders.filter(
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
      (filter === "all" ||
        (filter === "paid"
          ? ["successful", "partially-refunded", "refunded"].includes(
              details(o).paymentStatus,
            )
          : filter === "needs-fulfillment"
            ? ["unfulfilled", "processing"].includes(details(o).fulfillment)
            : filter === "returns"
              ? ["requested", "approved"].includes(details(o).returnStatus)
              : (payments
                  ? details(o).paymentStatus
                  : details(o).fulfillment) === filter)) &&
      (provider === "all" || details(o).provider === provider),
  );
  const totals = paymentTotals(orders, data.orderDetails);
  const legacy = orders.filter((o) => o.currency !== "BDT");
  function open(o: DemoOrder) {
    setChosen(o);
    setDraft(structuredClone(details(o)));
    setError("");
    setRefund("");
  }
  async function save(text = "Order details updated.") {
    if (!chosen || !draft) return;
    setBusy(true);
    try {
      const previous = details(chosen);
      if (
        ["partially-refunded", "refunded"].includes(previous.paymentStatus) &&
        draft.paymentStatus !== previous.paymentStatus
      )
        throw new Error(
          "A refunded payment cannot be reset. Create a new order for a new payment.",
        );
      if (
        ["successful", "partially-refunded", "refunded"].includes(
          previous.paymentStatus,
        ) &&
        ["failed", "cancelled", "pending"].includes(draft.paymentStatus)
      )
        throw new Error("Use a refund for a payment already received.");
      await changeMerchant((s) => {
        if ((s.orderDetails[chosen.id]?.refunded || 0) !== draft.refunded)
          throw new Error(
            "This payment was updated elsewhere. Close and reopen the order to continue.",
          );
        s.orderDetails[chosen.id] = {
          ...draft,
          history: [
            ...previous.history,
            {
              at: new Date().toISOString(),
              text: `${text} Payment: ${draft.paymentStatus}; delivery: ${draft.fulfillment}; return: ${draft.returnStatus}.`,
            },
          ],
        };
      });
      setNotice(text);
      setChosen(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refundPayment() {
    if (!chosen || !draft) return;
    try {
      const amount = Number(refund);
      const paid = ["successful", "partially-refunded"].includes(
        details(chosen).paymentStatus,
      );
      if (
        !paid ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > chosen.total - draft.refunded
      )
        throw new Error("Enter an amount within the remaining paid balance.");
      const refunded = draft.refunded + amount;
      const next = {
        ...draft,
        refunded,
        paymentStatus:
          refunded === chosen.total
            ? ("refunded" as const)
            : ("partially-refunded" as const),
        history: [
          ...draft.history,
          {
            at: new Date().toISOString(),
            text: `Demo refund ${moneyBDT(amount)}`,
          },
        ],
      };
      await changeMerchant((s) => {
        const latest = s.orderDetails[chosen.id] || defaultOrderDetails(chosen);
        if (latest.refunded !== draft.refunded)
          throw new Error(
            "This payment changed in another view. Close and reopen the order before refunding.",
          );
        s.orderDetails[chosen.id] = next;
      });
      setDraft(next);
      setRefund("");
      setNotice("Demo refund recorded. No real money was moved.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function restock() {
    if (!chosen || !draft || draft.restocked) return;
    try {
      if (sample)
        throw new Error(
          "Sample orders illustrate the workflow. Restocking is available for observed demo purchases only.",
        );
      if (!draft.stockDeducted)
        throw new Error("No stock was deducted for this legacy order.");
      if (!["approved", "resolved"].includes(draft.returnStatus))
        throw new Error("Approve the return before restocking.");
      await changeMerchant((s) => {
        if (s.orderDetails[chosen.id]?.restocked)
          throw new Error("This order was already restocked.");
        for (const i of chosen.items) {
          const base = merchantProducts(undefined, true).find(
            (p) => p.id === i.productId,
          );
          if (!base) continue;
          let p = s.products.find((p) => p.id === i.productId);
          if (!p) {
            p = structuredClone(base);
            s.products.push(p);
          }
          const v = p.variants.find((v) => v.id === i.variantId);
          if (!v) continue;
          const before = v.stockCount;
          v.stockCount += i.quantity;
          v.inStock = true;
          p.inStock = true;
          s.adjustments.unshift({
            id: uid("restock"),
            at: new Date().toISOString(),
            productId: p.id,
            variantId: v.id,
            before,
            after: v.stockCount,
            reason: `Return ${chosen.orderNumber}`,
          });
        }
        s.orderDetails[chosen.id] = {
          ...draft,
          restocked: true,
          history: [
            ...draft.history,
            { at: new Date().toISOString(), text: "Returned items restocked" },
          ],
        };
      });
      setDraft({ ...draft, restocked: true });
      setNotice("Returned items restocked once.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      {notice && (
        <p role="status" className="studio-success">
          {notice}
        </p>
      )}
      {payments && (
        <div className="studio-stat-grid">
          <Stat label="Received" value={moneyBDT(totals.received)} />
          <Stat label="Refunded" value={moneyBDT(totals.refunded)} />
          <Stat label="Net collections" value={moneyBDT(totals.net)} />
          {(["bKash", "Nagad"] as const).map((p) => (
            <Stat
              key={p}
              label={`${p} net`}
              value={moneyBDT(
                paymentTotals(
                  orders.filter((o) => details(o).provider === p),
                  data.orderDetails,
                ).net,
              )}
              onClick={() => setProvider(p)}
            />
          ))}
        </div>
      )}
      <Panel
        title={payments ? "Transactions & reconciliation" : "Your orders"}
        action={
          <button
            className="studio-button secondary"
            onClick={() =>
              exportCsv(payments ? "payments.csv" : "orders.csv", [
                [
                  "Order",
                  "Customer",
                  "Currency",
                  "Total",
                  "Provider",
                  "Payment",
                  "Refunded",
                  "Fulfillment",
                ],
                ...list.map((o) => [
                  o.orderNumber,
                  o.shippingAddress.email,
                  o.currency,
                  o.total,
                  details(o).provider,
                  details(o).paymentStatus,
                  details(o).refunded,
                  details(o).fulfillment,
                ]),
              ])
            }
          >
            <Download size={16} />
            Export
          </button>
        }
      >
        <div className="studio-toolbar">
          <SearchBox
            value={query}
            onChange={(s) => {
              setQuery(s);
              setPage(0);
            }}
            placeholder="Search orders or customers"
          />
          <div className="studio-actions">
            <select
              aria-label="Status filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All statuses</option>
              {payments ? (
                <option value="paid">All received payments</option>
              ) : (
                <>
                  <option value="needs-fulfillment">Needs fulfillment</option>
                  <option value="returns">Open returns</option>
                </>
              )}
              {(payments
                ? [
                    "pending",
                    "successful",
                    "failed",
                    "cancelled",
                    "partially-refunded",
                    "refunded",
                  ]
                : [
                    "unfulfilled",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {payments && (
              <select
                aria-label="Payment provider"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All providers</option>
                <option>bKash</option>
                <option>Nagad</option>
              </select>
            )}
          </div>
        </div>
        <div className="studio-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>{payments ? "Reference" : "Delivery"}</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.slice(page * 10, page * 10 + 10).map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.orderNumber}</strong>
                    <small>{new Date(o.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                    <small>{o.shippingAddress.email}</small>
                  </td>
                  <td>
                    <Badge>{details(o).paymentStatus}</Badge>
                    <small>
                      {details(o).provider}
                      {o.currency !== "BDT" ? " · Legacy USD" : ""}
                    </small>
                  </td>
                  <td>
                    {payments ? (
                      `DEMO-${o.id.slice(-10)}`
                    ) : (
                      <Badge>{details(o).fulfillment}</Badge>
                    )}
                  </td>
                  <td>
                    {o.currency === "BDT"
                      ? moneyBDT(o.total)
                      : `$${o.total.toFixed(2)} USD`}
                  </td>
                  <td>
                    <button
                      className="studio-icon"
                      aria-label={`Open ${o.orderNumber}`}
                      onClick={() => open(o)}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && (
          <Empty
            title="A new chapter starts with an order"
            text="Observed storefront demo orders appear here. Switch to the sample dataset to explore populated screens."
          />
        )}
        <Pager page={page} total={list.length} onChange={setPage} />
        {!!legacy.length && (
          <p className="studio-callout">
            {legacy.length} legacy USD orders are preserved and excluded from
            BDT payment totals.
          </p>
        )}
      </Panel>
      {chosen && draft && (
        <Modal
          title={`Order #${chosen.orderNumber}`}
          onClose={() => setChosen(null)}
          wide
        >
          <div className="studio-form">
            {error && (
              <p role="alert" className="studio-error">
                {error}
              </p>
            )}
            <div className="studio-order-summary">
              <div>
                <strong>
                  {chosen.shippingAddress.firstName}{" "}
                  {chosen.shippingAddress.lastName}
                </strong>
                <p>{chosen.shippingAddress.email}</p>
                <p>{chosen.shippingAddress.phone}</p>
              </div>
              <div>
                <Badge>{draft.paymentStatus}</Badge>
                <p>
                  {chosen.currency === "BDT"
                    ? moneyBDT(chosen.total)
                    : `${chosen.total} USD (legacy)`}
                </p>
              </div>
            </div>
            {chosen.items.map((i) => (
              <div className="studio-order-item" key={i.id}>
                <img src={i.image} alt="" />
                <span>
                  <strong>{i.name}</strong>
                  <small>
                    {i.finish} · {i.size} · Quantity {i.quantity}
                  </small>
                  <small>{i.variantId}</small>
                </span>
                <strong>
                  {chosen.currency === "BDT"
                    ? moneyBDT(i.price * i.quantity)
                    : `$${i.price * i.quantity}`}
                </strong>
              </div>
            ))}
            <div className="studio-pair">
              <div className="studio-inset">
                <h3>Delivery address</h3>
                <p>
                  {chosen.shippingAddress.address},{" "}
                  {chosen.shippingAddress.apartment}
                </p>
                <p>
                  {chosen.shippingAddress.city}, {chosen.shippingAddress.state}{" "}
                  {chosen.shippingAddress.postalCode}
                </p>
                <p>{chosen.shippingAddress.country}</p>
              </div>
              <div className="studio-inset">
                <div className="studio-list-line">
                  <span>Subtotal</span>
                  <b>{chosen.subtotal.toFixed(2)}</b>
                </div>
                <div className="studio-list-line">
                  <span>Discount {chosen.promoCode}</span>
                  <b>−{chosen.discountAmount.toFixed(2)}</b>
                </div>
                <div className="studio-list-line">
                  <span>Shipping</span>
                  <b>{chosen.shippingCost.toFixed(2)}</b>
                </div>
                <div className="studio-list-line">
                  <span>Total ({chosen.currency})</span>
                  <b>{chosen.total.toFixed(2)}</b>
                </div>
              </div>
            </div>
            <div className="studio-pair">
              <Field label="Payment status (simulation)">
                <select
                  value={draft.paymentStatus}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      paymentStatus: e.target
                        .value as OrderDetails["paymentStatus"],
                    })
                  }
                >
                  {[
                    "pending",
                    "successful",
                    "failed",
                    "cancelled",
                    "partially-refunded",
                    "refunded",
                  ].map((v) => (
                    <option
                      value={v}
                      key={v}
                      disabled={v === "partially-refunded" || v === "refunded"}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Delivery status">
                <select
                  value={draft.fulfillment}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      fulfillment: e.target
                        .value as OrderDetails["fulfillment"],
                    })
                  }
                >
                  {[
                    "unfulfilled",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Courier">
                <input
                  value={draft.courier}
                  onChange={(e) =>
                    setDraft({ ...draft, courier: e.target.value })
                  }
                />
              </Field>
              <Field label="Tracking reference">
                <input
                  value={draft.tracking}
                  onChange={(e) =>
                    setDraft({ ...draft, tracking: e.target.value })
                  }
                />
              </Field>
              <Field label="Return status">
                <select
                  value={draft.returnStatus}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      returnStatus: e.target
                        .value as OrderDetails["returnStatus"],
                    })
                  }
                >
                  {["none", "requested", "approved", "resolved"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Provider">
                <select
                  value={draft.provider}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      provider: e.target.value as "bKash" | "Nagad",
                    })
                  }
                >
                  <option>bKash</option>
                  <option>Nagad</option>
                </select>
              </Field>
            </div>
            <Field label="Internal order notes">
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </Field>
            <div className="studio-inset">
              <h3>Refund & return</h3>
              <p className="studio-caption">
                Refunded {moneyBDT(draft.refunded)} · remaining{" "}
                {moneyBDT(Math.max(0, chosen.total - draft.refunded))}. Demo
                actions only.
              </p>
              <div className="studio-actions">
                <input
                  aria-label="Refund amount"
                  type="number"
                  min="0"
                  value={refund}
                  onChange={(e) => setRefund(e.target.value)}
                  placeholder="Amount in BDT"
                />
                <button
                  className="studio-button secondary"
                  disabled={chosen.currency !== "BDT"}
                  onClick={refundPayment}
                >
                  Simulate refund
                </button>
                <button
                  className="studio-button secondary"
                  disabled={draft.restocked || sample}
                  onClick={restock}
                >
                  {draft.restocked
                    ? "Already restocked"
                    : "Restock returned items"}
                </button>
              </div>
            </div>
            <div>
              <h3>Activity timeline</h3>
              <ol className="studio-timeline">
                {draft.history.map((h, i) => (
                  <li key={i}>
                    <span>{new Date(h.at).toLocaleString()}</span>
                    {h.text}
                  </li>
                ))}
              </ol>
            </div>
            <div className="studio-actions">
              <button
                className="studio-button"
                disabled={busy}
                onClick={() => save()}
              >
                <Check size={16} />
                Save updates
              </button>
              <button
                className="studio-button secondary"
                onClick={() => window.print()}
              >
                Print summary
              </button>
              <button
                className="studio-button secondary"
                onClick={() => setChosen(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Customers({
  orders,
  sample = false,
}: {
  orders: DemoOrder[];
  sample?: boolean;
}) {
  const { data } = useMerchant();
  const { session, wishlistIds } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState("profile");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [profiles] = useState<
    Record<
      string,
      {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        defaultAddress?: DemoOrder["shippingAddress"];
        wishlistIds?: string[];
      }
    >
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("jco_demo_profiles_v1") || "{}");
    } catch {
      return {};
    }
  });
  const map = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string;
      wish: number | null;
      address?: DemoOrder["shippingAddress"];
    }
  >();
  orders.forEach((o) =>
    map.set(o.shippingAddress.email, {
      email: o.shippingAddress.email,
      name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
      phone: o.shippingAddress.phone,
      wish: sample
        ? Number(o.shippingAddress.email.match(/\d/)?.[0] || 0) + 2
        : null,
      address: o.shippingAddress,
    }),
  );
  if (!sample) {
    Object.values(profiles).forEach((p) => {
      if (p.email)
        map.set(p.email, {
          email: p.email,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
          phone: p.phone || "",
          wish: p.wishlistIds?.length ?? null,
          address: p.defaultAddress,
        });
    });
    if (session)
      map.set(session.email, {
        email: session.email,
        name: `${session.firstName} ${session.lastName}`,
        phone: session.phone || "",
        wish: wishlistIds.length,
        address: session.defaultAddress as DemoOrder["shippingAddress"],
      });
  }
  const list = [...map.values()].filter((c) =>
    (c.name + " " + c.email).toLowerCase().includes(query.toLowerCase()),
  );
  const customer = list.find((c) => c.email === selected);
  const customerOrders = orders.filter(
    (o) => o.shippingAddress.email === selected,
  );
  const totals = paymentTotals(customerOrders, data.orderDetails);
  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Search customers"
      />
      <div className="studio-customer-grid">
        {list.map((c) => {
          const active = orders.filter(
            (o) =>
              o.shippingAddress.email === c.email &&
              !["delivered", "cancelled"].includes(
                (data.orderDetails[o.id] || defaultOrderDetails(o)).fulfillment,
              ),
          ).length;
          return (
            <button
              className="studio-customer-card"
              key={c.email}
              onClick={() => {
                setSelected(c.email);
                setTab("profile");
                setNote(data.customerNotes[c.email] || "");
                setError("");
                setNotice("");
              }}
            >
              <div className="studio-customer-counts">
                <span title="Active orders">
                  <Package size={13} />
                  {active}
                </span>
                <span
                  title={
                    c.wish === null
                      ? "Wishlist data unavailable"
                      : "Saved favourites"
                  }
                >
                  <Heart size={13} />
                  {c.wish ?? "—"}
                </span>
              </div>
              <span className="studio-customer-avatar">{c.name[0] || "C"}</span>
              <h3>{c.name || "Customer"}</h3>
              <p>{c.email}</p>
              <small>
                {
                  orders.filter((o) => o.shippingAddress.email === c.email)
                    .length
                }{" "}
                orders · View customer <ArrowUpRight size={13} />
              </small>
            </button>
          );
        })}
      </div>
      {!list.length && (
        <Empty
          title="Meet the people behind your orders"
          text="Customers and registered local preview accounts appear here."
        />
      )}
      {customer && (
        <Modal title={customer.name} onClose={() => setSelected("")} wide>
          <div className="studio-customer-modal-top">
            <span className="studio-customer-avatar">{customer.name[0]}</span>
            <div>
              <h3>{customer.name}</h3>
              <p>{customer.email}</p>
            </div>
            <Badge>{sample ? "sample customer" : "local customer"}</Badge>
          </div>
          <div className="studio-segments">
            {["profile", "orders", "addresses", "payments", "notes"].map(
              (t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <div className="studio-modal-tab" key={tab}>
            {tab === "profile" && (
              <>
                <div className="studio-stat-grid">
                  <Stat label="Total paid" value={moneyBDT(totals.received)} />
                  <Stat label="Refunded" value={moneyBDT(totals.refunded)} />
                  <Stat
                    label="Average order"
                    value={moneyBDT(
                      customerOrders.length
                        ? customerOrders.reduce(
                            (n, o) => n + (o.currency === "BDT" ? o.total : 0),
                            0,
                          ) / customerOrders.length
                        : 0,
                    )}
                  />
                </div>
                <div className="studio-list-line">
                  <span>Phone</span>
                  <strong>{customer.phone || "Not provided"}</strong>
                </div>
                <div className="studio-list-line">
                  <span>Saved favourites</span>
                  <strong>
                    {customer.wish ?? "Not available in this browser"}
                  </strong>
                </div>
                <div className="studio-list-line">
                  <span>Last purchase</span>
                  <strong>
                    {customerOrders.length
                      ? new Date(
                          customerOrders[0].createdAt,
                        ).toLocaleDateString()
                      : "No purchases yet"}
                  </strong>
                </div>
              </>
            )}
            {tab === "orders" &&
              customerOrders.map((o) => (
                <div className="studio-inset" key={o.id}>
                  <strong>#{o.orderNumber}</strong>
                  <p>{o.items.map((i) => i.name).join(", ")}</p>
                  <Badge>
                    {
                      (data.orderDetails[o.id] || defaultOrderDetails(o))
                        .fulfillment
                    }
                  </Badge>
                </div>
              ))}
            {tab === "addresses" &&
              (customer.address ? (
                <div className="studio-address-card">
                  <Badge>Delivery address</Badge>
                  <h3>{customer.name}</h3>
                  <p>{customer.address.address}</p>
                  <p>{customer.address.apartment}</p>
                  <p>
                    {customer.address.city}, {customer.address.postalCode}
                  </p>
                  <p>{customer.address.country}</p>
                  <p>{customer.address.phone}</p>
                </div>
              ) : (
                <Empty
                  title="No saved address"
                  text="Delivery addresses appear after the customer saves one or places an order."
                />
              ))}
            {tab === "payments" &&
              customerOrders.map((o) => (
                <div className="studio-list-line" key={o.id}>
                  <span>
                    <strong>
                      {
                        (data.orderDetails[o.id] || defaultOrderDetails(o))
                          .provider
                      }
                    </strong>
                    <small>
                      DEMO-{o.id.slice(-10)} · {o.orderNumber}
                    </small>
                  </span>
                  <span>
                    {o.currency === "BDT"
                      ? moneyBDT(o.total)
                      : `${o.total} USD`}
                    <small>
                      {
                        (data.orderDetails[o.id] || defaultOrderDetails(o))
                          .paymentStatus
                      }
                    </small>
                  </span>
                </div>
              ))}
            {tab === "notes" && (
              <div className="studio-form">
                {notice && (
                  <p role="status" className="studio-success">
                    {notice}
                  </p>
                )}
                {error && (
                  <p role="alert" className="studio-error">
                    {error}
                  </p>
                )}
                <Field label="Internal customer notes">
                  <textarea
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                <button
                  className="studio-button"
                  onClick={async () => {
                    try {
                      await changeMerchant((s) => {
                        s.customerNotes[customer.email] = note;
                      });
                      setNotice("Customer notes saved.");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Save note
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
