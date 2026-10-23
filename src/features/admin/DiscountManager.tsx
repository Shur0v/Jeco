"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Minus, Palette, Save, Trash2, Upload } from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import {
  changeMerchant,
  MerchantDiscount,
  uid,
  merchantProducts,
  readMedia,
} from "@/lib/merchant-store";
import { SaleBanner } from "@/components/shared/SaleBanner";
import { Panel, Field, Badge, Modal, Empty } from "./admin-shared";
export function DiscountManager() {
  const { data } = useMerchant();
  const [campaign, setCampaign] = useState(data.campaign);
  const [editing, setEditing] = useState<MerchantDiscount | null>(null);
  const [hover, setHover] = useState(false);
  const [picker, setPicker] = useState<"color" | "textColor" | null>(null);
  const [color, setColor] = useState("#e8aaa8");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useDialogFocus(Boolean(picker));
  useEffect(() => {
    if (!picker) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicker(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [picker]);
  async function saveCampaign() {
    setBusy(true);
    setNotice("");
    try {
      if (
        !/^#[0-9a-f]{6}$/i.test(campaign.color) ||
        !/^#[0-9a-f]{6}$/i.test(campaign.textColor)
      )
        throw new Error("Use a six-digit hex color.");
      if (!campaign.href.startsWith("/"))
        throw new Error("Use a storefront destination beginning with /.");
      if (campaign.start && campaign.end && campaign.start >= campaign.end)
        throw new Error("The end date must be after the start date.");
      await changeMerchant((s) => {
        s.campaign = campaign;
      });
      setNotice("Sale banner saved instantly to your homepage and navigation.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveDiscount() {
    if (!editing) return;
    try {
      if (!/^[A-Z0-9_-]{3,24}$/.test(editing.code))
        throw new Error(
          "Use 3–24 letters, numbers, hyphens or underscores for the code.",
        );
      if (
        data.discounts.some(
          (d) => d.id !== editing.id && d.code === editing.code,
        )
      )
        throw new Error("That code already exists.");
      if (
        editing.value <= 0 ||
        (editing.discountType === "percentage" && editing.value > 100) ||
        editing.minSubtotal < 0
      )
        throw new Error("Enter a valid amount and minimum spend.");
      if (editing.start && editing.end && editing.start >= editing.end)
        throw new Error("The end date must be after the start date.");
      await changeMerchant((s) => {
        s.discounts = [
          ...s.discounts.filter((d) => d.id !== editing.id),
          editing,
        ];
      });
      setEditing(null);
      setNotice("Discount saved and available at checkout.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      {error && (
        <p role="alert" className="studio-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="studio-success">
          {notice}
        </p>
      )}
      <div className={picker ? "studio-sale-editing" : ""}>
        <Panel
          title="Festival campaign"
          action={
            <button
              className="studio-button"
              disabled={busy}
              onClick={saveCampaign}
            >
              <Save size={16} />
              {busy ? "Saving…" : "Save campaign"}
            </button>
          }
        >
          <div className="studio-editor-grid">
            <div className="studio-form">
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={campaign.enabled}
                  onChange={(e) =>
                    setCampaign({ ...campaign, enabled: e.target.checked })
                  }
                />
                Enable festival campaign
              </label>
              <Field label="Offer message">
                <input
                  value={campaign.text}
                  onChange={(e) =>
                    setCampaign({ ...campaign, text: e.target.value })
                  }
                />
              </Field>
              <div className="studio-pair">
                <Field label="Show banner">
                  <select
                    value={campaign.mode}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        mode: e.target.value as "hover" | "always",
                      })
                    }
                  >
                    <option value="always">Directly under the main menu</option>
                    <option value="hover">Only on menu hover / focus</option>
                  </select>
                </Field>
                <Field label="Layout">
                  <select
                    value={campaign.layout}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        layout: e.target.value as typeof campaign.layout,
                      })
                    }
                  >
                    <option value="center">Centered label</option>
                    <option value="split">Message + action</option>
                    <option value="pill">Soft pill</option>
                  </select>
                </Field>
                <Field label="Starts (local time)">
                  <input
                    type="datetime-local"
                    value={campaign.start}
                    onChange={(e) =>
                      setCampaign({ ...campaign, start: e.target.value })
                    }
                  />
                </Field>
                <Field label="Ends (local time)">
                  <input
                    type="datetime-local"
                    value={campaign.end}
                    onChange={(e) =>
                      setCampaign({ ...campaign, end: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Destination">
                <input
                  value={campaign.href}
                  onChange={(e) =>
                    setCampaign({ ...campaign, href: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="studio-form">
              <Field
                label="Banner height"
                hint="Base height 40 px. Maximum 52 px (+12 px)."
              >
                <div className="studio-stepper">
                  <button
                    aria-label="Decrease banner height"
                    disabled={campaign.height <= 28}
                    onClick={() =>
                      setCampaign({
                        ...campaign,
                        height: Math.max(28, campaign.height - 1),
                      })
                    }
                  >
                    <Minus size={16} />
                  </button>
                  <strong>{campaign.height} px</strong>
                  <button
                    aria-label="Increase banner height"
                    disabled={campaign.height >= 52}
                    onClick={() =>
                      setCampaign({
                        ...campaign,
                        height: Math.min(52, campaign.height + 1),
                      })
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </Field>
              {(["color", "textColor"] as const).map((key) => (
                <Field
                  key={key}
                  label={key === "color" ? "Background color" : "Text color"}
                >
                  <div className="studio-color-row">
                    <input
                      aria-label={`${key} hex code`}
                      value={campaign[key]}
                      onChange={(e) =>
                        setCampaign({ ...campaign, [key]: e.target.value })
                      }
                    />
                    <button
                      className="studio-color-swatch"
                      aria-label={`Open ${key} picker`}
                      style={{ background: campaign[key] }}
                      onClick={() => {
                        setColor(campaign[key]);
                        setPicker(key);
                      }}
                    >
                      <Palette size={18} />
                    </button>
                  </div>
                </Field>
              ))}
              <Field label="Custom background (PNG or JPG)">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={async (e) => {
                    try {
                      if (e.target.files?.[0])
                        setCampaign({
                          ...campaign,
                          image: await readMedia(e.target.files[0]),
                        });
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                />
              </Field>
              {campaign.image && (
                <button
                  className="studio-text-button"
                  onClick={() => setCampaign({ ...campaign, image: "" })}
                >
                  Remove background image
                </button>
              )}
            </div>
          </div>
        </Panel>
        <div
          className={`studio-sale-preview ${picker ? "picker-preview" : ""}`}
        >
          <p className="studio-caption">
            Navigation-only live preview · hover a menu to test the selected
            behavior
          </p>
          <div
            className="studio-preview-nav"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
          >
            <strong className="brand-wordmark">J&amp;CO.</strong>
            {["Shop", "New arrival", "Best seller", "Earrings", "Rings"].map(
              (n) => (
                <button key={n}>{n}</button>
              ),
            )}
            <SaleBanner
              campaign={{
                ...campaign,
                enabled: true,
                start: "",
                end: "",
                ...(picker ? { [picker]: color } : {}),
              }}
              hovered={hover || !!picker}
              preview
            />
            {campaign.mode === "hover" && !hover && !picker && (
              <span className="studio-caption">
                Hover a menu above to reveal the sale label
              </span>
            )}
          </div>
        </div>
      </div>
      <Panel
        title="Discount codes"
        action={
          <button
            className="studio-button"
            onClick={() => {
              setError("");
              setEditing({
                id: uid("discount"),
                code: "",
                description: "",
                discountType: "percentage",
                value: 10,
                minSubtotal: 0,
                active: true,
                productIds: [],
                categoryIds: [],
              });
            }}
          >
            <Plus size={16} />
            Create discount
          </button>
        }
      >
        {!data.discounts.length ? (
          <Empty
            title="Make their next piece special"
            text="Create a targeted offer, then enter its code in checkout."
          />
        ) : (
          <div className="studio-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Offer</th>
                  <th>Minimum spend</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.discounts.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.code}</strong>
                      <small>{d.description}</small>
                    </td>
                    <td>
                      {d.discountType === "percentage"
                        ? `${d.value}%`
                        : `৳${d.value}`}{" "}
                      off
                    </td>
                    <td>৳{d.minSubtotal}</td>
                    <td>
                      <Badge>{d.active ? "active" : "inactive"}</Badge>
                    </td>
                    <td>
                      <button onClick={() => setEditing(structuredClone(d))}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {editing && (
        <Modal
          title={editing.code || "Create discount"}
          onClose={() => setEditing(null)}
          wide
        >
          <div className="studio-form">
            {error && (
              <p className="studio-error" role="alert">
                {error}
              </p>
            )}
            <div className="studio-pair">
              <Field label="Code">
                <input
                  value={editing.code}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      code: e.target.value.toUpperCase().trim(),
                    })
                  }
                />
              </Field>
              <Field label="Description">
                <input
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Discount type">
                <select
                  value={editing.discountType}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      discountType: e.target.value as "percentage" | "fixed",
                    })
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount (BDT)</option>
                </select>
              </Field>
              <Field label="Value">
                <input
                  type="number"
                  min="1"
                  max={editing.discountType === "percentage" ? 100 : undefined}
                  value={editing.value}
                  onChange={(e) =>
                    setEditing({ ...editing, value: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Minimum spend (BDT)">
                <input
                  type="number"
                  min="0"
                  value={editing.minSubtotal}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      minSubtotal: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Usage limit (blank = unlimited)">
                <input
                  type="number"
                  min="1"
                  value={editing.limit || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      limit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </Field>
              <Field label="Starts">
                <input
                  type="datetime-local"
                  value={editing.start || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, start: e.target.value })
                  }
                />
              </Field>
              <Field label="Ends">
                <input
                  type="datetime-local"
                  value={editing.end || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, end: e.target.value })
                  }
                />
              </Field>
            </div>
            <label className="studio-check">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              Active
            </label>
            <details>
              <summary>Eligible products (none selected = all)</summary>
              <div className="studio-choice-list">
                {merchantProducts().map((p) => (
                  <label className="studio-check" key={p.id}>
                    <input
                      type="checkbox"
                      checked={editing.productIds?.includes(p.id) || false}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          productIds: e.target.checked
                            ? [...(editing.productIds || []), p.id]
                            : editing.productIds?.filter((id) => id !== p.id),
                        })
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </details>
            <details>
              <summary>Eligible categories (none selected = all)</summary>
              <div className="studio-choice-list">
                {data.categories.map((c) => (
                  <label className="studio-check" key={c.id}>
                    <input
                      type="checkbox"
                      checked={editing.categoryIds?.includes(c.id) || false}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          categoryIds: e.target.checked
                            ? [...(editing.categoryIds || []), c.id]
                            : editing.categoryIds?.filter((id) => id !== c.id),
                        })
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </details>
            <div className="studio-actions">
              <button className="studio-button" onClick={saveDiscount}>
                Save discount
              </button>
              <button
                className="studio-button secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
      {picker &&
        createPortal(
          <div className="merchant-studio studio-portal">
            <div className="studio-color-overlay">
              <div className="studio-color-live-preview">
                <div className="studio-preview-nav">
                  <strong className="brand-wordmark">J&amp;CO.</strong>
                  {[
                    "Shop",
                    "New arrival",
                    "Best seller",
                    "Earrings",
                    "Rings",
                  ].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                <SaleBanner
                  campaign={{
                    ...campaign,
                    enabled: true,
                    start: "",
                    end: "",
                    [picker]: color,
                  }}
                  hovered
                  preview
                />
              </div>
              <div
                className="studio-color-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Choose campaign color"
              >
                <h2>Find your shade</h2>
                <input
                  className="studio-native-color"
                  type="color"
                  aria-label="Color picker"
                  value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#e8aaa8"}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  aria-label="Hex color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <div className="studio-color-presets">
                  {[
                    "#e8aaa8",
                    "#f6d9d9",
                    "#f8e9e4",
                    "#917b6d",
                    "#292929",
                    "#ffffff",
                  ].map((c) => (
                    <button
                      key={c}
                      style={{ background: c }}
                      aria-label={`Use ${c}`}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
                <div className="studio-actions">
                  <button
                    className="studio-button secondary"
                    onClick={() => setPicker(null)}
                  >
                    Close
                  </button>
                  <button
                    className="studio-button"
                    onClick={() => {
                      if (/^#[0-9a-f]{6}$/i.test(color)) {
                        setCampaign({ ...campaign, [picker]: color });
                        setPicker(null);
                      }
                    }}
                  >
                    Select color
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
