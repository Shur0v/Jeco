"use client";
import {previewServices} from "@/commerce/browser-services";
import { useEffect, useState } from "react";
import {
  Plus,
  ArrowDown,
  ArrowUp,
  Trash2,
  GitBranch,
  Link2,
  Eye,
  Save,
} from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import {
  Category,
  MenuEntry,
  categoryBlock,
  changeMerchant,
  uid,
  slugify,
  merchantProducts,
  readMedia,
} from "@/lib/merchant-store";
import { Panel, Field, Modal } from "./admin-shared";
export function CategoryManager({
  editProduct,
}: {
  editProduct: (id: string) => void;
}) {
  const { data } = useMerchant();
  const [cats, setCats] = useState(data.categories);
  const [menus, setMenus] = useState(data.menus);
  const [selection, setSelection] = useState<string>("");
  const [mode, setMode] = useState<"categories" | "menus">("categories");
  const [notice, setNotice] = useState<{
    message: string;
    productId?: string;
  } | null>(null);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [hover, setHover] = useState("");
  const [drag, setDrag] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);
  const selectedCat = cats.find((c) => c.id === selection);
  const selectedMenu = menus.find((m) => m.id === selection);
  const dirty =
    JSON.stringify(cats) !== JSON.stringify(data.categories) ||
    JSON.stringify(menus) !== JSON.stringify(data.menus);
  useEffect(() => {
    const warn = (e: Event) => {
      if (
        dirty &&
        !window.confirm(
          "Leave without publishing your category and menu changes?",
        )
      )
        e.preventDefault();
    };
    window.addEventListener("jco:before-panel", warn);
    return () => window.removeEventListener("jco:before-panel", warn);
  }, [dirty]);
  function updateCat(values: Partial<Category>) {
    if ("parentId" in values && values.parentId !== selectedCat?.parentId) {
      const linked = merchantProducts(undefined, true).filter(
        (p) => p.category === selection || p.subcategoryId === selection,
      );
      if (linked.length) {
        setNotice({
          message:
            "Move linked products before changing this category’s parent.",
          productId: linked[0].id,
        });
        return;
      }
    }
    setCats((c) =>
      c.map((n) => (n.id === selection ? { ...n, ...values } : n)),
    );
    setSaved(false);
  }
  function updateMenu(values: Partial<MenuEntry>) {
    setMenus((m) =>
      m.map((n) => (n.id === selection ? { ...n, ...values } : n)),
    );
    setSaved(false);
  }
  function addCategory(parentId?: string) {
    const id = uid("category");
    setCats([
      ...cats,
      {
        id,
        name: "New category",
        slug: `new-category-${id.slice(-6)}`,
        parentId,
      },
    ]);
    setSelection(id);
  }
  function reorder(id: string, delta: number) {
    if (mode === "categories") {
      const next = [...cats];
      const i = next.findIndex((c) => c.id === id);
      const j = i + delta;
      if (j < 0 || j >= next.length) return;
      [next[i], next[j]] = [next[j], next[i]];
      setCats(next);
    } else {
      const next = [...menus];
      const i = next.findIndex((c) => c.id === id);
      const j = i + delta;
      if (j < 0 || j >= next.length) return;
      [next[i], next[j]] = [next[j], next[i]];
      setMenus(next);
    }
  }
  function remove(c: Category) {
    const block = categoryBlock(c.id, merchantProducts(undefined, true), {
      ...data,
      categories: cats,
      menus,
    });
    if (block) {
      setNotice(block);
      return;
    }
    setConfirm(c);
  }
  async function publish() {
    try {
      if (
        cats.some((c) => !c.name.trim() || !c.slug.trim()) ||
        new Set(cats.map((c) => c.slug)).size !== cats.length
      )
        throw new Error("Every category needs a name and a unique URL slug.");
      if (menus.some((m) => !m.label.trim() || !m.href.startsWith("/")))
        throw new Error(
          "Menu links need a label and a storefront path beginning with /.",
        );
      await previewServices.content.publishNavigation(cats,menus);
      const published=await previewServices.content.get();
      setCats(published.categories);setMenus(published.menus);
      setSaved(true);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function node(c: Category) {
    const count = merchantProducts(undefined, true).filter(
      (p) =>
        p.category === c.id ||
        p.subcategoryId === c.id ||
        p.collections.includes(c.slug),
    ).length;
    return (
      <div
        className="studio-tree-node"
        key={c.id}
        draggable
        onDragStart={() => setDrag(c.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const source = cats.find((x) => x.id === drag);
          if (
            source &&
            source.id !== c.id &&
            !cats.some((x) => x.parentId === source.id)
          ) {
            const linked = merchantProducts(undefined, true).find(
              (p) => p.category === drag || p.subcategoryId === drag,
            );
            if (linked) {
              setNotice({
                message:
                  "Move linked products before changing this category’s parent.",
                productId: linked.id,
              });
              return;
            }
            setCats(
              cats.map((x) =>
                x.id === drag
                  ? { ...x, parentId: c.parentId ? c.parentId : c.id }
                  : x,
              ),
            );
          }
        }}
      >
        <div className={selection === c.id ? "selected" : ""}>
          <button onClick={() => setSelection(c.id)}>
            <GitBranch size={18} />
            <span>
              <strong>{c.name}</strong>
              <small>
                {count} linked products · /{c.slug}
              </small>
            </span>
          </button>
          <div className="studio-actions">
            <button
              aria-label={`Move ${c.name} up`}
              onClick={() => reorder(c.id, -1)}
            >
              <ArrowUp size={14} />
            </button>
            <button
              aria-label={`Move ${c.name} down`}
              onClick={() => reorder(c.id, 1)}
            >
              <ArrowDown size={14} />
            </button>
            {!c.parentId && (
              <button
                aria-label={`Add subcategory to ${c.name}`}
                onClick={() => addCategory(c.id)}
              >
                <Plus size={15} />
              </button>
            )}
            <button
              aria-label={`Delete ${c.name}`}
              title="Delete category"
              onClick={() => remove(c)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        {!c.parentId && (
          <div className="studio-tree-children">
            {cats.filter((n) => n.parentId === c.id).map(node)}
          </div>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="studio-toolbar">
        <div className="studio-segments">
          <button
            className={mode === "categories" ? "active" : ""}
            onClick={() => {
              setMode("categories");
              setSelection("");
            }}
          >
            Category tree
          </button>
          <button
            className={mode === "menus" ? "active" : ""}
            onClick={() => {
              setMode("menus");
              setSelection("");
            }}
          >
            Menu connections
          </button>
        </div>
        <button className="studio-button" onClick={publish}>
          <Save size={16} />
          Publish changes
        </button>
      </div>
      {notice && (
        <button
          role="alert"
          className="studio-error studio-block-alert"
          onClick={() => notice.productId && editProduct(notice.productId)}
        >
          {notice.message}
          {notice.productId && <strong>Open linked product →</strong>}
        </button>
      )}
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="studio-success" role="status">
          Your categories and navigation are now published to this browser’s
          storefront.
        </p>
      )}
      <div className="studio-editor-grid">
        <Panel
          title={
            mode === "categories"
              ? "Your collection, connected"
              : "Build the customer journey"
          }
          action={
            <button
              className="studio-button secondary"
              onClick={() => {
                if (mode === "categories") addCategory();
                else {
                  const m = {
                    id: uid("menu"),
                    label: "New menu",
                    href: "/collections/shop-all",
                  };
                  setMenus([...menus, m]);
                  setSelection(m.id);
                }
              }}
            >
              <Plus size={16} />
              Add {mode === "categories" ? "category" : "menu"}
            </button>
          }
        >
          <p className="studio-caption">
            {mode === "categories"
              ? "Click a card to edit. Drag a leaf onto a parent to connect it, or use the parent selector. Products are never moved automatically."
              : "Connect menus to categories. Child links appear under their selected parent on desktop and mobile."}
          </p>
          {mode === "categories" ? (
            <div className="studio-tree">
              {cats.filter((c) => !c.parentId).map(node)}
            </div>
          ) : (
            <div className="studio-tree">
              {menus
                .filter((m) => !m.parentId)
                .map((m) => (
                  <div key={m.id} className="studio-tree-node">
                    <div className={selection === m.id ? "selected" : ""}>
                      <button onClick={() => setSelection(m.id)}>
                        <Link2 size={18} />
                        <span>
                          <strong>{m.label}</strong>
                          <small>{m.href}</small>
                        </span>
                      </button>
                      <div className="studio-actions">
                        <button
                          onClick={() => reorder(m.id, -1)}
                          aria-label={`Move ${m.label} up`}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          onClick={() => reorder(m.id, 1)}
                          aria-label={`Move ${m.label} down`}
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          aria-label={`Delete menu ${m.label}`}
                          onClick={() => {
                            if (menus.some((x) => x.parentId === m.id)) {
                              setNotice({
                                message:
                                  "Remove or reassign child menu links first.",
                              });
                              return;
                            }
                            setMenus(menus.filter((x) => x.id !== m.id));
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="studio-tree-children">
                      {menus
                        .filter((x) => x.parentId === m.id)
                        .map((x) => (
                          <div className="studio-tree-node" key={x.id}>
                            <div>
                              <button onClick={() => setSelection(x.id)}>
                                <Link2 size={15} />
                                <span>
                                  <strong>{x.label}</strong>
                                  <small>{x.href}</small>
                                </span>
                              </button>
                              <button
                                aria-label={`Delete menu ${x.label}`}
                                onClick={() =>
                                  setMenus(menus.filter((m) => m.id !== x.id))
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Panel>
        <Panel title="Connection settings">
          {selectedCat && mode === "categories" ? (
            <div className="studio-form">
              <Field label="Category name">
                <input
                  value={selectedCat.name}
                  onChange={(e) => updateCat({ name: e.target.value })}
                />
              </Field>
              <Field label="URL slug">
                <input
                  value={selectedCat.slug}
                  onChange={(e) => updateCat({ slug: slugify(e.target.value) })}
                />
              </Field>
              <Field label="Parent category">
                <select
                  value={selectedCat.parentId || ""}
                  onChange={(e) => {
                    if (
                      cats.some((c) => c.parentId === selectedCat.id) &&
                      e.target.value
                    ) {
                      setNotice({
                        message:
                          "Move this category’s subcategories before making it a child.",
                      });
                      return;
                    }
                    updateCat({ parentId: e.target.value || undefined });
                  }}
                >
                  <option value="">Top-level category</option>
                  {cats
                    .filter((c) => !c.parentId && c.id !== selectedCat.id)
                    .map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Field>
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={!!selectedCat.hidden}
                  onChange={(e) => updateCat({ hidden: e.target.checked })}
                />
                Hide category in storefront menus
              </label>
              <button
                className="studio-button secondary"
                onClick={() => {
                  setMenus([
                    ...menus,
                    {
                      id: uid("menu"),
                      label: selectedCat.name,
                      categoryId: selectedCat.id,
                      href: `/collections/${selectedCat.slug}`,
                    },
                  ]);
                  setSaved(false);
                }}
              >
                Connect as storefront menu
              </button>
            </div>
          ) : selectedMenu && mode === "menus" ? (
            <div className="studio-form">
              <Field label="Menu name">
                <input
                  value={selectedMenu.label}
                  onChange={(e) => updateMenu({ label: e.target.value })}
                />
              </Field>
              <Field label="Category destination">
                <select
                  value={selectedMenu.categoryId || ""}
                  onChange={(e) => {
                    const c = cats.find((c) => c.id === e.target.value);
                    updateMenu({
                      categoryId: c?.id,
                      href: c ? `/collections/${c.slug}` : selectedMenu.href,
                    });
                  }}
                >
                  <option value="">Custom storefront link</option>
                  {cats.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Destination">
                <input
                  value={selectedMenu.href}
                  onChange={(e) => updateMenu({ href: e.target.value })}
                />
              </Field>
              <Field label="Parent menu">
                <select
                  value={selectedMenu.parentId || ""}
                  onChange={(e) => {
                    if (
                      menus.some((m) => m.parentId === selectedMenu.id) &&
                      e.target.value
                    ) {
                      setNotice({
                        message:
                          "Reassign child links before nesting this menu.",
                      });
                      return;
                    }
                    updateMenu({ parentId: e.target.value || undefined });
                  }}
                >
                  <option value="">Main navigation</option>
                  {menus
                    .filter((m) => !m.parentId && m.id !== selectedMenu.id)
                    .map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.label}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Mega-menu group">
                <input
                  value={selectedMenu.group || ""}
                  onChange={(e) => updateMenu({ group: e.target.value })}
                  placeholder="Discover, By category…"
                />
              </Field>
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={!!selectedMenu.hidden}
                  onChange={(e) => updateMenu({ hidden: e.target.checked })}
                />
                Hide menu
              </label>
              <Field label="Promotional image">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    try {
                      if (e.target.files?.[0])
                        updateMenu({
                          image: await previewServices.media.upload(e.target.files[0]),
                        });
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                />
              </Field>
              {selectedMenu.image && (
                <img
                  className="studio-preview-product"
                  src={selectedMenu.image}
                  alt="Menu promotion"
                />
              )}
            </div>
          ) : (
            <div className="studio-empty">
              <GitBranch />
              <h3>Everything connects here</h3>
              <p>
                Select a category or menu card to edit its place in your shop.
              </p>
            </div>
          )}
        </Panel>
      </div>
      <Panel
        title="Live navigation preview"
        action={
          <div className="studio-segments">
            <button
              onClick={() => setPreview("desktop")}
              className={preview === "desktop" ? "active" : ""}
            >
              Desktop
            </button>
            <button
              onClick={() => setPreview("mobile")}
              className={preview === "mobile" ? "active" : ""}
            >
              Mobile
            </button>
          </div>
        }
      >
        <div className={`studio-menu-preview ${preview}`}>
          <strong className="brand-wordmark">J&amp;CO.</strong>
          {menus
            .filter(
              (m) =>
                !m.parentId &&
                !m.hidden &&
                !cats.find((c) => c.id === m.categoryId)?.hidden,
            )
            .map((m) => (
              <div
                key={m.id}
                onMouseEnter={() => setHover(m.id)}
                onMouseLeave={() => setHover("")}
              >
                <button
                  onFocus={() => setHover(m.id)}
                  onClick={() => setHover(hover === m.id ? "" : m.id)}
                >
                  {m.label}
                </button>
                {hover === m.id && menus.some((x) => x.parentId === m.id) && (
                  <div className="studio-preview-submenu">
                    {menus
                      .filter((x) => x.parentId === m.id && !x.hidden)
                      .map((x) => (
                        <span key={x.id}>
                          {x.image && <img src={x.image} alt="" />}
                          {x.label}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </Panel>
      {confirm && (
        <Modal title="Delete empty category?" onClose={() => setConfirm(null)}>
          <p>
            {confirm.name} has no linked products, child categories or menu
            links.
          </p>
          <div className="studio-actions">
            <button
              className="studio-button danger"
              onClick={() => {
                setCats(cats.filter((c) => c.id !== confirm.id));
                setConfirm(null);
              }}
            >
              Delete category
            </button>
            <button
              className="studio-button secondary"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
