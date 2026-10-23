"use client";
import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowUpRight,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
export function Panel({
  title,
  children,
  action,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`studio-panel ${className}`}>
      {title && (
        <div className="studio-panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Stat({
  label,
  value,
  note,
  onClick,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="studio-stat" onClick={onClick} disabled={!onClick}>
      <span>
        {label}
        {onClick && <ArrowUpRight size={16} />}
      </span>
      <strong>{value}</strong>
      <small>{note}</small>
    </button>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="studio-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useDialogFocus(true);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return createPortal(
    <div className="merchant-studio studio-portal">
      <div className="studio-overlay" onClick={onClose}>
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`studio-modal ${wide ? "wide" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="studio-panel-heading">
            <h2>{title}</h2>
            <button
              className="studio-icon"
              aria-label="Close dialog"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </section>
      </div>
    </div>,
    document.body,
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="studio-search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Pager({
  page,
  total,
  size = 10,
  onChange,
}: {
  page: number;
  total: number;
  size?: number;
  onChange: (n: number) => void;
}) {
  const max = Math.max(0, Math.ceil(total / size) - 1);
  useEffect(() => {
    if (page > max) onChange(max);
  }, [page, max, onChange]);
  return (
    <div className="studio-pager">
      <span>
        {total
          ? `${page * size + 1}–${Math.min(total, (page + 1) * size)} of ${total}`
          : "0 results"}
      </span>
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={17} />
      </button>
      <span>Page {Math.min(page, max) + 1}</span>
      <button
        disabled={page >= max}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`studio-badge badge-${String(children).replace(/\s/g, "-")}`}
    >
      {children}
    </span>
  );
}
export function exportCsv(name: string, rows: unknown[][]) {
  const safe = (value: unknown) => {
    let s = String(value ?? "");
    if (/^[=+@\-]/.test(s)) s = `'${s}`;
    return `"${s.replaceAll('"', '""')}"`;
  };
  const url = URL.createObjectURL(
    new Blob([rows.map((r) => r.map(safe).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function Chart({
  values,
  labels,
  prefix = "",
}: {
  values: number[];
  labels: string[];
  prefix?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div
      className="studio-chart"
      role="group"
      aria-label={values
        .map((v, i) => `${labels[i]}: ${prefix}${v}`)
        .join(", ")}
    >
      {values.map((v, i) => (
        <div className="studio-chart-column" key={i}>
          <div className="studio-chart-track">
            <button
              aria-label={`${labels[i]}: ${prefix}${v.toLocaleString()}`}
              style={{ height: `${Math.max(v ? 4 : 1, (v / max) * 100)}%` }}
            >
              <span role="tooltip">
                {labels[i]} · {prefix}
                {v.toLocaleString()}
              </span>
            </button>
          </div>
          <small>{labels[i]}</small>
        </div>
      ))}
    </div>
  );
}
export { dayKey, periodBuckets } from "@/lib/merchant-reporting";
