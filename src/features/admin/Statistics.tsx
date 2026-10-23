"use client";
import { useMemo, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import { AnalyticsEvent, merchantProducts } from "@/lib/merchant-store";
import {
  Panel,
  Stat,
  Chart,
  Empty,
  exportCsv,
  dayKey,
  periodBuckets,
  Pager,
} from "./admin-shared";
function sampleEvents(): AnalyticsEvent[] {
  const ps = merchantProducts();
  return Array.from({ length: 280 }, (_, i) => {
    const at = new Date();
    at.setDate(at.getDate() - (i % 7));
    at.setHours(i % 24, i % 60, 0, 0);
    return {
      id: `sample-${i}`,
      at: at.toISOString(),
      path: i % 3 ? `/products/${ps[i % 8]?.slug}` : "/",
      type:
        i % 5 === 0
          ? "page-view"
          : i % 7 === 0
            ? "add-to-cart"
            : "product-click",
      label: "Sample interaction",
      productId: ps[i % 8]?.id,
      section: i % 2 ? "hero" : "new-arrivals",
    };
  });
}
export function Statistics({
  start,
  end,
  editProduct,
}: {
  start: string;
  end: string;
  editProduct: (id: string) => void;
}) {
  const { data } = useMerchant();
  const [sample, setSample] = useState(false);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState(0);
  const events = useMemo(
    () => (sample ? sampleEvents() : data.events),
    [sample, data.events],
  );
  const filtered = events.filter((e) => {
    const day = dayKey(e.at);
    return day >= start && day <= end;
  });
  const clicks = filtered.filter(
    (e) => !["page-view", "product-view", "order-complete"].includes(e.type),
  );
  const buckets = periodBuckets(start, end);
  const values = buckets.map(
    (b) =>
      clicks.filter((e) => dayKey(e.at) >= b.start && dayKey(e.at) <= b.end)
        .length,
  );
  const products = merchantProducts(undefined, true);
  const previousEnd = new Date(`${start}T00:00:00+06:00`).getTime();
  const previousStart =
    previousEnd -
    (Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
    ) +
      1) *
      86400000;
  const previous = events.filter(
    (e) =>
      new Date(e.at).getTime() >= previousStart &&
      new Date(e.at).getTime() < previousEnd &&
      !["page-view", "product-view"].includes(e.type),
  );
  const ranking = products
    .map((p) => ({
      p,
      count: clicks.filter((e) => e.productId === p.id).length,
      previous: previous.filter((e) => e.productId === p.id).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const group = (key: "path" | "section" | "categoryId") => {
    const map = new Map<string, number>();
    clicks.forEach((e) => {
      const v = e[key];
      if (v) map.set(v, (map.get(v) || 0) + 1);
    });
    return [...map].sort((a, b) => b[1] - a[1]).slice(0, 8);
  };
  const chosen = products.find((p) => p.id === selected);
  return (
    <>
      <div className="studio-toolbar">
        <div className="studio-segments">
          <button
            className={!sample ? "active" : ""}
            onClick={() => {
              setSample(false);
              setPage(0);
            }}
          >
            Observed in this browser
          </button>
          <button
            className={sample ? "active" : ""}
            onClick={() => {
              setSample(true);
              setPage(0);
            }}
          >
            Sample week
          </button>
        </div>
        <button
          className="studio-button secondary"
          onClick={() =>
            exportCsv("storefront-events.csv", [
              ["Timestamp", "Path", "Interaction", "Product ID", "Section"],
              ...filtered.map((e) => [
                e.at,
                e.path,
                e.type,
                e.productId,
                e.section,
              ]),
            ])
          }
        >
          <Download size={16} />
          Export events
        </button>
      </div>
      <p className="studio-callout">
        {sample
          ? "Illustrative sample events only. These are not actual visitors or sales."
          : "Local preview analytics: activity from this browser only. Admin clicks and sensitive form contents are excluded."}
      </p>
      <div className="studio-stat-grid">
        <Stat
          label="Clicks"
          value={clicks.length}
          note={`${previous.length} in previous period`}
        />
        <Stat
          label="Page views"
          value={
            filtered.filter(
              (e) => e.type === "page-view" || e.type === "product-view",
            ).length
          }
        />
        <Stat
          label="Product clicks"
          value={clicks.filter((e) => e.type === "product-click").length}
        />
        <Stat
          label="Added to bag"
          value={filtered.filter((e) => e.type === "add-to-cart").length}
        />
        <Stat
          label="Completed orders"
          value={filtered.filter((e) => e.type === "order-complete").length}
        />
      </div>
      <div className="studio-split">
        <Panel
          title="Daily storefront clicks"
          action={<span className="studio-caption">Asia/Dhaka</span>}
        >
          <Chart labels={buckets.map((b) => b.label)} values={values} />
          {!clicks.length && (
            <p className="studio-caption">
              No observed clicks in this period. Explore the storefront or
              switch to Sample week.
            </p>
          )}
        </Panel>
        <Panel title="Most clicked products">
          <div className="studio-ranking">
            {ranking.slice(0, 8).map(({ p, count, previous }, i) => (
              <button key={p.id} onClick={() => setSelected(p.id)}>
                <span className="studio-rank">{i + 1}</span>
                <img src={p.images[0]} alt="" />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.id}</small>
                  <small>
                    {previous
                      ? `${Math.round(((count - previous) / previous) * 100)}% vs previous period`
                      : "No clicks in previous period"}
                  </small>
                </span>
                <b>{count}</b>
              </button>
            ))}
          </div>
          {!ranking.length && (
            <Empty
              title="Your next popular piece"
              text="Product interactions will appear here as shoppers explore."
            />
          )}
        </Panel>
      </div>
      {chosen && (
        <Panel
          title={chosen.name}
          action={
            <button
              className="studio-button secondary"
              onClick={() => editProduct(chosen.id)}
            >
              Manage product <ArrowUpRight size={16} />
            </button>
          }
        >
          <div className="studio-stat-grid">
            <Stat label="Product ID" value={<small>{chosen.id}</small>} />
            <Stat
              label="Clicks"
              value={clicks.filter((e) => e.productId === chosen.id).length}
            />
            <Stat
              label="Product views"
              value={
                filtered.filter(
                  (e) => e.productId === chosen.id && e.type === "product-view",
                ).length
              }
            />
            <Stat
              label="Add to bag"
              value={
                filtered.filter(
                  (e) => e.productId === chosen.id && e.type === "add-to-cart",
                ).length
              }
            />
          </div>
        </Panel>
      )}
      <div className="studio-three-col">
        {(["path", "categoryId", "section"] as const).map((key, i) => (
          <Panel
            key={key}
            title={
              [
                "Popular pages",
                "Popular categories",
                "Popular homepage sections",
              ][i]
            }
          >
            {group(key).map(([label, n]) => (
              <div className="studio-list-line" key={label}>
                <span>{label}</span>
                <strong>{n}</strong>
              </div>
            ))}
            {!group(key).length && (
              <p className="studio-caption">No activity recorded.</p>
            )}
          </Panel>
        ))}
      </div>
      <Panel title="Recent interactions">
        <div className="studio-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Interaction</th>
                <th>Page</th>
                <th>Product ID</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .reverse()
                .slice(page * 10, page * 10 + 10)
                .map((e) => (
                  <tr key={e.id}>
                    <td>
                      {new Date(e.at).toLocaleString("en-GB", {
                        timeZone: "Asia/Dhaka",
                      })}
                    </td>
                    <td>{e.type}</td>
                    <td>{e.path}</td>
                    <td>{e.productId || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} total={filtered.length} onChange={setPage} />
      </Panel>
    </>
  );
}
