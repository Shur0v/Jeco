"use client";
import { ProductPriceText } from "@/components/shared/ProductPriceText";
import {previewServices} from "@/commerce/browser-services";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Save,
} from "lucide-react";
import {reorderProductMedia} from "@/lib/product-media";
import { useMerchant } from "@/hooks/useMerchant";
import { useStore } from "@/hooks/useStore";
import {
  merchantProducts,
  MerchantProduct,
  saveProduct,
  changeMerchant,
  uid,
  slugify,
  readMedia,
  moneyBDT,
} from "@/lib/merchant-store";
import { MetalFinish, JewelleryMaterial } from "@/types/commerce";
import {
  Panel,
  Field,
  SearchBox,
  Pager,
  Badge,
  Modal,
  Empty,
  exportCsv,
} from "./admin-shared";
const finishes: MetalFinish[] = [
  "Gold",
  "Silver",
  "Rose Gold",
  "White Gold",
  "Yellow Gold",
  "Silver/Gold",
];
const materials: JewelleryMaterial[] = [
  "14K Solid Gold",
  "Gold Filled",
  "Sterling Silver",
  "18K Gold Vermeil",
  "Titanium",
  "Diamond",
  "Accessory",
];
function blank(): MerchantProduct {
  const id = uid("prod");
  return {
    id,
    slug: "",
    name: "",
    description: "",
    category: merchantProducts()[0]?.category || "rings",
    collections: [],
    material: "Gold Filled",
    availableFinishes: ["Gold"],
    variants: [
      {
        id: uid("variant"),
        sku: `JCO-${id.slice(-6).toUpperCase()}`,
        title: "Gold",
        finish: "Gold",
        price: 1500,
        stockCount: 10,
        inStock: true,
      },
    ],
    basePrice: 1500,
    currency: "BDT",
    images: [],
    lifestyleImages: [],
    visualSpec: { shape: "dome-huggie", primaryFinish: "Gold" },
    inStock: true,
    tags: [],
    badges: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    popularityScore: 0,
    rating: 0,
    reviewCount: 0,
    details: [],
    dimensions: "",
    careInstructions: "Store dry and polish gently.",
    relatedProductIds: [],
    createdAt: new Date().toISOString(),
    status: "draft",
    lowStockThreshold: 5,
    weight: 10,
  };
}
export function ProductManager({
  editId,
  onEditHandled,
}: {
  editId?: string;
  onEditHandled?: () => void;
}) {
  const { data } = useMerchant();
  const { orders } = useStore();
  const products = merchantProducts(undefined, true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<MerchantProduct | null>(null);
  const [initial, setInitial] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<MerchantProduct | null>(null);
  const [preview, setPreview] = useState(false);
  function open(p: MerchantProduct) {
    setEditing(structuredClone(p));
    setInitial(JSON.stringify(p));
    setError("");
  }
  useEffect(() => {
    if (editId) {
      const p =
        editId === "__new__"
          ? blank()
          : merchantProducts(undefined, true).find((p) => p.id === editId);
      if (p) open(p);
      onEditHandled?.();
    }
  }, [editId]);
  const dirty = editing && JSON.stringify(editing) !== initial;
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    const warn = (e: Event) => {
      if (
        dirty &&
        !window.confirm(
          "You have unsaved product changes. Leave without saving?",
        )
      )
        e.preventDefault();
    };
    window.addEventListener("jco:before-panel", warn);
    return () => window.removeEventListener("jco:before-panel", warn);
  }, [dirty]);
  function patch(updates: Partial<MerchantProduct>) {
    setEditing((p) => (p ? { ...p, ...updates } : p));
  }
  async function run(task: () => Promise<void>, text: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files || !editing) return;
    setBusy(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => previewServices.media.upload(f)),
      );
      patch({
        images: [...editing.images, ...urls],
        visualSpec: {
          ...editing.visualSpec,
          customImage: editing.images[0] || urls[0],
        },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const list = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (p.name + " " + p.id + " " + p.variants.map((v) => v.sku).join(" "))
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (filter === "all" ||
              (filter === "out-of-stock" ? !p.inStock : p.status === filter)) &&
            (category === "all" ||
              p.category === category ||
              p.subcategoryId === category),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "price"
              ? a.basePrice - b.basePrice
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [products, query, filter, category, sort],
  );
  async function bulk(status: "published" | "archived") {
    await run(async () => {
      for (const id of selected) {
        const p = products.find((p) => p.id === id);
        if (p) await previewServices.catalog.save({ ...p, status });
      }
      setSelected([]);
    }, "Selected products updated.");
  }
  if (editing)
    return (
      <div className="studio-product-editor">
        <div className="studio-toolbar">
          <button
            className="studio-button secondary"
            onClick={() => {
              if (!dirty || window.confirm("Discard unsaved product changes?"))
                setEditing(null);
            }}
          >
            <ArrowLeft size={16} />
            Products
          </button>
          <span className="studio-caption">
            {dirty ? "Unsaved changes" : "Product editor"} · {editing.id}
          </span>
          <div className="studio-actions">
            <button
              className="studio-button secondary"
              onClick={() => setPreview(true)}
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              className="studio-button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await previewServices.catalog.save(editing);
                  setInitial(JSON.stringify(editing));
                }, "Product saved. Published pieces are available in your storefront.")
              }
            >
              <Save size={16} />
              {busy ? "Saving…" : "Save product"}
            </button>
          </div>
        </div>
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
        <div className="studio-editor-grid">
          <div>
            <Panel title="The essentials">
              <div className="studio-form">
                <Field label="Product name">
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      patch({
                        name: e.target.value,
                        ...(!data.products.some(p=>p.id===editing.id) && (!editing.slug ||
                        editing.slug === slugify(editing.name))
                          ? { slug: slugify(e.target.value) }
                          : {}),
                      })
                    }
                  />
                </Field>
                <Field
                  label="URL slug"
                  hint="This is the product’s shareable address."
                >
                  <input
                    value={editing.slug}
                    onChange={(e) => patch({ slug: e.target.value })}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={5}
                    value={editing.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </Field>
                <div className="studio-pair">
                  <Field label="Material">
                    <select
                      value={editing.material}
                      onChange={(e) =>
                        patch({ material: e.target.value as JewelleryMaterial })
                      }
                    >
                      {materials.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tags (comma separated)">
                    <input
                      value={editing.tags.join(", ")}
                      onChange={(e) =>
                        patch({
                          tags: e.target.value.split(",").map((t) => t.trim()),
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            </Panel>
            <Panel
              title="Product photography"
              action={
                <label className="studio-button secondary">
                  <Upload size={16} />
                  Upload
                  <input
                    className="sr-only"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => upload(e.target.files)}
                  />
                </label>
              }
            >
              <p className="studio-caption">
                First image is the cover. JPG, PNG or WebP, up to 5 MB per
                image.
              </p>
              <div className="studio-media-grid">
                {editing.images.map((url, i) => (
                  <div key={i}>
                    <img
                      src={url}
                      alt={editing.imageAlt?.[i] || `Product image ${i + 1}`}
                    />
                    <input
                      aria-label={`Image ${i + 1} alt text`}
                      placeholder="Describe this image"
                      value={editing.imageAlt?.[i] || ""}
                      onChange={(e) => {
                        const alts = [...(editing.imageAlt || [])];
                        alts[i] = e.target.value;
                        patch({ imageAlt: alts });
                      }}
                    />
                    <div className="studio-actions">
                      <button
                        aria-label="Move image earlier"
                        disabled={!i}
                        onClick={() => {
                          const order=editing.images.map((_,index)=>index);
                          [order[i - 1],order[i]]=[order[i],order[i - 1]];
                          patch(reorderProductMedia(editing,order));
                        }}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        aria-label="Move image later"
                        disabled={i === editing.images.length - 1}
                        onClick={() => {
                          const order=editing.images.map((_,index)=>index);
                          [order[i + 1],order[i]]=[order[i],order[i + 1]];
                          patch(reorderProductMedia(editing,order));
                        }}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        aria-label="Remove image"
                        onClick={() => {
                          patch(reorderProductMedia(editing,editing.images.map((_,index)=>index).filter(index=>index!==i)));
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {!editing.images.length && (
                <Empty
                  title="Give your piece its moment"
                  text="Upload your product images to begin."
                />
              )}
            </Panel>
            <Panel
              title="Variants & pricing"
              action={
                <button
                  className="studio-button secondary"
                  onClick={() =>
                    patch({
                      variants: [
                        ...editing.variants,
                        {
                          id: uid("variant"),
                          sku: uid("SKU").slice(-12),
                          title: "Gold",
                          finish: "Gold",
                          price: editing.basePrice,
                          stockCount: 0,
                          inStock: false,
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Variant
                </button>
              }
            >
              <div className="studio-form">
                {editing.variants.map((v, i) => (
                  <details className="studio-variant" key={v.id} open={i === 0}>
                    <summary>
                      {v.finish} {v.size}{" "}
                      <span>
                        {v.sku} · {moneyBDT(v.price)} · {v.stockCount} available
                      </span>
                    </summary>
                    <div className="studio-panel-heading">
                      <h3>Variant {i + 1}</h3>
                      <button
                        aria-label={`Remove variant ${i + 1}`}
                        disabled={editing.variants.length === 1}
                        onClick={() =>
                          patch({
                            variants: editing.variants.filter(
                              (x) => x.id !== v.id,
                            ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="studio-pair">
                      {[
                        ["SKU", "sku"],
                        ["Size", "size"],
                        ["Price (BDT)", "price"],
                        ["Original price (optional)", "compareAtPrice"],
                        ["Stock quantity", "stockCount"],
                      ].map(([label, key]) => (
                        <Field key={key} label={label}>
                          <input
                            type={
                              [
                                "price",
                                "compareAtPrice",
                                "stockCount",
                              ].includes(key)
                                ? "number"
                                : "text"
                            }
                            min="0"
                            step={key === "stockCount" ? "1" : "any"}
                            value={
                              (v as unknown as Record<string, string | number>)[
                                key
                              ] ?? ""
                            }
                            onChange={(e) => {
                              const vars = [...editing.variants];
                              vars[i] = {
                                ...v,
                                [key]: [
                                  "price",
                                  "compareAtPrice",
                                  "stockCount",
                                ].includes(key)
                                  ? e.target.value === "" &&
                                    key === "compareAtPrice"
                                    ? undefined
                                    : Number(e.target.value)
                                  : e.target.value,
                              };
                              patch({ variants: vars });
                            }}
                          />
                        </Field>
                      ))}
                      <Field label="Finish">
                        <select
                          value={v.finish}
                          onChange={(e) => {
                            const vars = [...editing.variants];
                            vars[i] = {
                              ...v,
                              finish: e.target.value as MetalFinish,
                              title: e.target.value,
                            };
                            patch({ variants: vars });
                          }}
                        >
                          {finishes.map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Cost (optional, BDT)">
                        <input
                          type="number"
                          min="0"
                          value={editing.costs?.[v.id] ?? ""}
                          onChange={(e) =>
                            patch({
                              costs: {
                                ...editing.costs,
                                [v.id]: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </Field>
                      <Field label="Variant image">
                        <select
                          value={v.imageIndex || 0}
                          onChange={(e) => {
                            const vars = [...editing.variants];
                            vars[i] = {
                              ...v,
                              imageIndex: Number(e.target.value),
                            };
                            patch({ variants: vars });
                          }}
                        >
                          {editing.images.map((_, n) => (
                            <option value={n} key={n}>
                              Image {n + 1}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </details>
                ))}
              </div>
            </Panel>
            <Panel title="Care & delivery">
              <div className="studio-form">
                <div className="studio-pair">
                  <Field label="Weight (grams)">
                    <input
                      type="number"
                      min="0"
                      value={editing.weight || 0}
                      onChange={(e) =>
                        patch({ weight: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Dimensions">
                    <input
                      value={editing.dimensions}
                      onChange={(e) => patch({ dimensions: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Care instructions">
                  <textarea
                    value={editing.careInstructions}
                    onChange={(e) =>
                      patch({ careInstructions: e.target.value })
                    }
                  />
                </Field>
              </div>
            </Panel>
          </div>
          <div>
            <Panel title="Publication">
              <div className="studio-form">
                <Field label="Status">
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      patch({
                        status: e.target.value as MerchantProduct["status"],
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
                <Field label="Category">
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      patch({
                        category: e.target.value as MerchantProduct["category"],
                        subcategoryId: undefined,
                        collections: editing.collections.filter(
                          (c) =>
                            c !== editing.category &&
                            c !==
                              data.categories.find(
                                (cat) => cat.id === editing.category,
                              )?.slug &&
                            c !==
                              data.categories.find(
                                (cat) => cat.id === editing.subcategoryId,
                              )?.slug,
                        ),
                      })
                    }
                  >
                    {data.categories
                      .filter((c) => !c.parentId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <select
                    value={editing.subcategoryId || ""}
                    onChange={(e) =>
                      patch({ subcategoryId: e.target.value || undefined })
                    }
                  >
                    <option value="">None</option>
                    {data.categories
                      .filter((c) => c.parentId === editing.category)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Additional collections (slugs, comma separated)">
                  <input
                    value={editing.collections.join(", ")}
                    onChange={(e) =>
                      patch({
                        collections: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
                <Field label="Low stock threshold">
                  <input
                    type="number"
                    min="0"
                    value={editing.lowStockThreshold ?? 5}
                    onChange={(e) =>
                      patch({ lowStockThreshold: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
            </Panel>
            <Panel title="Where it appears">
              <div className="studio-checks">
                {(
                  [
                    ["Featured", "isFeatured"],
                    ["New arrival", "isNewArrival"],
                    ["Best seller", "isBestSeller"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={editing[key]}
                      onChange={(e) => patch({ [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Panel>
            <Panel title="Make it personal">
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={editing.personalization?.enabled || false}
                  onChange={(e) =>
                    patch({
                      personalization: {
                        enabled: e.target.checked,
                        instructions:
                          editing.personalization?.instructions || "",
                        limit: editing.personalization?.limit || 20,
                      },
                    })
                  }
                />
                Allow personalization
              </label>
              {editing.personalization?.enabled && (
                <div className="studio-form">
                  <Field label="Customer instructions">
                    <textarea
                      value={editing.personalization.instructions}
                      onChange={(e) =>
                        patch({
                          personalization: {
                            ...editing.personalization!,
                            instructions: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Character limit">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={editing.personalization.limit}
                      onChange={(e) =>
                        patch({
                          personalization: {
                            ...editing.personalization!,
                            limit: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                </div>
              )}
            </Panel>
            {editing.status === "published" && (
              <Link
                className="studio-button secondary"
                href={`/products/${editing.slug}`}
                target="_blank"
              >
                Open storefront <Eye size={16} />
              </Link>
            )}
          </div>
        </div>
        {preview && (
          <Modal title="Storefront preview" onClose={() => setPreview(false)}>
            <img
              className="studio-preview-product"
              src={editing.images[0]}
              alt={editing.name}
            />
            <h2>{editing.name || "Your product name"}</h2>
            <p><ProductPriceText>{moneyBDT(editing.variants[0]?.price || 0)}</ProductPriceText></p>
            <p>{editing.description}</p>
            <p className="studio-caption">
              {editing.variants
                .map((v) => `${v.finish} ${v.size || ""}`)
                .join(" · ")}
            </p>
          </Modal>
        )}
      </div>
    );
  return (
    <>
      <div className="studio-toolbar">
        <SearchBox
          value={query}
          onChange={(s) => {
            setQuery(s);
            setPage(0);
          }}
          placeholder="Search products, IDs or SKUs"
        />
        <div className="studio-actions">
          <button
            className="studio-button secondary"
            onClick={() =>
              exportCsv("products-bdt.csv", [
                ["ID", "Product", "Status", "BDT price", "Stock"],
                ...products.map((p) => [
                  p.id,
                  p.name,
                  p.status,
                  p.basePrice,
                  p.variants.reduce((n, v) => n + v.stockCount, 0),
                ]),
              ])
            }
          >
            Export
          </button>
          <button className="studio-button" onClick={() => open(blank())}>
            <Plus size={16} />
            Add product
          </button>
        </div>
      </div>
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
      <Panel>
        <div className="studio-toolbar">
          <div className="studio-actions">
            <select
              aria-label="Product status"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
            >
              {["all", "published", "draft", "archived", "out-of-stock"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("-", " ")}
                  </option>
                ),
              )}
            </select>
            <select
              aria-label="Category filter"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All categories</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="price">Price low–high</option>
            </select>
          </div>
          <span className="studio-caption">{list.length} products</span>
        </div>
        {selected.length > 0 && (
          <div className="studio-selection">
            {selected.length} selected{" "}
            <button onClick={() => bulk("published")}>Publish</button>
            <button onClick={() => bulk("archived")}>Archive</button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        <div className="studio-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select visible products"
                    checked={
                      !!list.length &&
                      list
                        .slice(page * 10, page * 10 + 10)
                        .every((p) => selected.includes(p.id))
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? list
                              .slice(page * 10, page * 10 + 10)
                              .map((p) => p.id)
                          : [],
                      )
                    }
                  />
                </th>
                <th>Product</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(page * 10, page * 10 + 10).map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selected.includes(p.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, p.id]
                            : selected.filter((id) => id !== p.id),
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="studio-product-cell"
                      onClick={() => open(p)}
                    >
                      <img src={p.images[0]} alt="" />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td><ProductPriceText>{moneyBDT(p.basePrice)}</ProductPriceText></td>
                  <td>
                    <Badge>
                      {p.inStock
                        ? `${p.variants.reduce((n, v) => n + v.stockCount, 0)} available`
                        : "out of stock"}
                    </Badge>
                  </td>
                  <td>
                    <div className="studio-actions">
                      <button onClick={() => open(p)}>Edit</button>
                      <button
                        aria-label={`Duplicate ${p.name}`}
                        onClick={() => {
                          const copy = {
                            ...structuredClone(p),
                            id: uid("prod"),
                            slug: `${p.slug}-${Date.now().toString(36)}`,
                            name: `${p.name} (copy)`,
                            status: "draft" as const,
                            variants: p.variants.map((v) => ({
                              ...v,
                              id: uid("variant"),
                              sku: uid("SKU"),
                            })),
                          };
                          open(copy);
                        }}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && (
          <Empty
            title="No matching pieces"
            text="Clear your filters or add a new product."
          />
        )}
        <Pager page={page} total={list.length} onChange={setPage} />
      </Panel>
      {deleting && (
        <Modal title="Remove product?" onClose={() => setDeleting(null)}>
          <p>{deleting.name}</p>
          <p className="studio-caption">
            {[...orders, ...data.orders].some((o) =>
              o.items.some((i) => i.productId === deleting.id),
            )
              ? "This product is linked to an order. It will be archived to preserve the purchase history."
              : "This removes the product from your browser catalog. Existing order records are preserved."}
          </p>
          <div className="studio-actions">
            <button
              className="studio-button danger"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (
                    [...orders, ...data.orders].some((o) =>
                      o.items.some((i) => i.productId === deleting.id),
                    )
                  )
                    await previewServices.catalog.save({ ...deleting, status: "archived" });
                  else
                    await changeMerchant((s) => {
                      s.deleted.push(deleting.id);
                      s.products = s.products.filter(
                        (p) => p.id !== deleting.id,
                      );
                    });
                  setDeleting(null);
                }, "Product removed from the storefront.")
              }
            >
              Confirm removal
            </button>
            <button
              className="studio-button secondary"
              onClick={() => setDeleting(null)}
            >
              Keep product
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
