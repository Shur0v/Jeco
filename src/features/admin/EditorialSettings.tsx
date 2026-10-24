"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { HomeBlock, merchantProducts, uid } from "@/lib/merchant-store";
import { previewServices } from "@/commerce/browser-services";
import { Field } from "./admin-shared";

export const EDITORIAL_BLOCKS = [
  "hero",
  "personalized",
  "header",
  "explore",
  "lifestyle",
  "collection-matrix",
  "gallery",
];
export function EditorialSettings({
  block,
  patch,
  onError,
}: {
  block: HomeBlock;
  patch: (values: Partial<HomeBlock>) => void;
  onError: (error: string) => void;
}) {
  const products = merchantProducts(),
    [uploading, setUploading] = useState(false);
  const isItems = ["hero", "personalized", "header", "lifestyle"].includes(
      block.id,
    ),
    isProducts = [
      "personalized",
      "header",
      "explore",
      "collection-matrix",
    ].includes(block.id);
  const updateItem = (
    index: number,
    values: Partial<NonNullable<HomeBlock["items"]>[number]>,
  ) =>
    patch({
      items: block.items?.map((item, i) =>
        i === index ? { ...item, ...values } : item,
      ),
    });
  async function upload(
    file: File | undefined,
    index?: number,
    mobile = false,
  ) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await previewServices.media.upload(file);
      if (index !== undefined)
        updateItem(index, mobile ? { mobileMedia: media } : { media });
      else patch({ slides: [...(block.slides || []), media] });
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <p className="studio-caption">
        {block.id === "header"
          ? "The first link opens the Shop menu. Categories & Menus controls its category list and nested links. Featured product selections below override automatic category suggestions."
          : "Edits appear in the canvas immediately. Publish changes to update this browser’s storefront."}
      </p>
      {!isItems && (
        <>
          <Field label="Heading">
            <input
              value={block.title || ""}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={block.text || ""}
              onChange={(e) => patch({ text: e.target.value })}
            />
          </Field>
          <Field label="Eyebrow">
            <input
              value={block.eyebrow || ""}
              onChange={(e) => patch({ eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Button label">
            <input
              value={block.buttonLabel || ""}
              onChange={(e) => patch({ buttonLabel: e.target.value })}
            />
          </Field>
          <Field label="Storefront destination">
            <input
              value={block.href}
              onChange={(e) => patch({ href: e.target.value })}
            />
          </Field>
        </>
      )}
      {["hero", "personalized"].includes(block.id) && (
        <>
          <Field label="Story interval (seconds)">
            <input
              type="number"
              min={4}
              max={60}
              value={(block.interval || 7000) / 1000}
              onChange={(e) =>
                patch({
                  interval: Math.min(
                    60000,
                    Math.max(4000, Number(e.target.value) * 1000),
                  ),
                })
              }
            />
          </Field>
          <Field label="Eyebrow">
            <input
              value={block.eyebrow || ""}
              onChange={(e) => patch({ eyebrow: e.target.value })}
            />
          </Field>
        </>
      )}
      {block.id === "lifestyle" && (
        <>
          <Field label="Heading (line breaks supported)">
            <textarea
              value={block.title || ""}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={block.text || ""}
              onChange={(e) => patch({ text: e.target.value })}
            />
          </Field>
        </>
      )}
      {block.id === "collection-matrix" && (
        <>
          <Field label="Family label">
            <input
              value={block.family || ""}
              onChange={(e) => patch({ family: e.target.value })}
            />
          </Field>
          <Field label="Setting label">
            <input
              value={block.setting || ""}
              onChange={(e) => patch({ setting: e.target.value })}
            />
          </Field>
        </>
      )}
      {isProducts && (
        <>
          <Field label="Automatic collection (slug; all = mixed)">
            <input
              value={block.collection || "all"}
              onChange={(e) => patch({ collection: e.target.value })}
            />
          </Field>
          <Field label="Product selection">
            <select
              value={block.productIds?.length ? "manual" : "automatic"}
              onChange={(e) =>
                patch({
                  productIds:
                    e.target.value === "automatic"
                      ? []
                      : products
                          .slice(
                            0,
                            block.id === "collection-matrix"
                              ? 16
                              : block.id === "explore"
                                ? 4
                                : 2,
                          )
                          .map((p) => p.id),
                })
              }
            >
              <option value="automatic">
                Automatic collection suggestions
              </option>
              <option value="manual">Choose specific products</option>
            </select>
          </Field>
          {!!block.productIds?.length && (
            <div className="studio-choice-list">
              {products.map((p) => (
                <label className="studio-check" key={p.id}>
                  <input
                    type="checkbox"
                    checked={block.productIds?.includes(p.id) || false}
                    onChange={(e) =>
                      patch({
                        productIds: e.target.checked
                          ? [...(block.productIds || []), p.id]
                          : block.productIds?.filter((id) => id !== p.id),
                      })
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}
          <p className="studio-caption">
            Selected order is preserved. Personalized/menu show 2, Explore shows
            4 at a time (up to 16 draggable), and the signature grid shows up to
            16. Unpublished products are never displayed publicly.
          </p>
        </>
      )}
      {isItems && (
        <>
          {(block.items || []).map((item, index) => (
            <div key={item.id} className="studio-editorial-item">
              <header>
                <strong>
                  {["hero", "personalized"].includes(block.id)
                    ? "Story"
                    : "Item"}{" "}
                  {index + 1}
                </strong>
                <div className="studio-actions">
                  <button
                    type="button"
                    disabled={!index}
                    aria-label="Move item up"
                    onClick={() => {
                      const items = [...(block.items || [])];
                      [items[index - 1], items[index]] = [
                        items[index],
                        items[index - 1],
                      ];
                      patch({ items });
                    }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={index === (block.items?.length || 0) - 1}
                    aria-label="Move item down"
                    onClick={() => {
                      const items = [...(block.items || [])];
                      [items[index + 1], items[index]] = [
                        items[index],
                        items[index + 1],
                      ];
                      patch({ items });
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={block.items?.length === 1}
                    aria-label="Remove item"
                    onClick={() =>
                      patch({
                        items: block.items?.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </header>
              <Field label="Title">
                <input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                />
              </Field>
              {block.id !== "header" && (
                <>
                  <Field label="Description">
                    <textarea
                      value={item.text || ""}
                      onChange={(e) =>
                        updateItem(index, { text: e.target.value })
                      }
                    />
                  </Field>
                  {item.media && <img src={item.media} alt={item.alt} />}
                  <Field label="Replace image">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={(e) => upload(e.target.files?.[0], index)}
                    />
                  </Field>
                  <Field label="Image URL">
                    <input
                      value={item.media}
                      onChange={(e) =>
                        updateItem(index, { media: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Alt text">
                    <input
                      value={item.alt}
                      onChange={(e) =>
                        updateItem(index, { alt: e.target.value })
                      }
                    />
                  </Field>
                  {["hero", "personalized"].includes(block.id) && (
                    <>
                      <Field label="Mobile image">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={(e) =>
                            upload(e.target.files?.[0], index, true)
                          }
                        />
                      </Field>
                      <Field label="Button label">
                        <input
                          value={item.buttonLabel || ""}
                          onChange={(e) =>
                            updateItem(index, { buttonLabel: e.target.value })
                          }
                        />
                      </Field>
                      {block.id === "personalized" && (
                        <Field label="Featured products (two, optional)">
                          <select
                            multiple
                            value={item.productIds || []}
                            onChange={(e) =>
                              updateItem(index, {
                                productIds: Array.from(e.target.selectedOptions)
                                  .map((o) => o.value)
                                  .slice(0, 2),
                              })
                            }
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                    </>
                  )}
                </>
              )}
              <Field label="Destination path">
                <input
                  value={item.href}
                  onChange={(e) => updateItem(index, { href: e.target.value })}
                />
              </Field>
            </div>
          ))}
          <button
            disabled={uploading}
            className="studio-button secondary"
            onClick={() =>
              patch({
                items: [
                  ...(block.items || []),
                  {
                    id: uid("editorial"),
                    title: "New story",
                    media: block.media || block.items?.[0]?.media || "",
                    alt: "Jewellery story",
                    href: "/collections/shop-all",
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Add {["hero", "personalized"].includes(block.id) ? "story" : "item"}
          </button>
          {uploading && <p role="status">Optimizing image…</p>}
        </>
      )}
      {block.id === "gallery" && (
        <>
          <Field label="Community link label">
            <input
              value={block.secondaryLabel || ""}
              onChange={(e) => patch({ secondaryLabel: e.target.value })}
            />
          </Field>
          <Field label="Community destination">
            <input
              value={block.secondaryHref || ""}
              onChange={(e) => patch({ secondaryHref: e.target.value })}
            />
          </Field>
          <Field label="Image descriptions">
            <input
              value={block.alt}
              onChange={(e) => patch({ alt: e.target.value })}
            />
          </Field>
          <Field label="Add collage images (up to six displayed)">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </Field>
          {block.slides?.map((media, index) => (
            <div className="studio-slide-row" key={index}>
              <img src={media} alt={`Collage ${index + 1}`} />
              <button
                aria-label="Move collage image earlier"
                disabled={!index}
                onClick={() => {
                  const slides = [...(block.slides || [])];
                  [slides[index - 1], slides[index]] = [
                    slides[index],
                    slides[index - 1],
                  ];
                  patch({ slides });
                }}
              >
                <ArrowUp size={15} />
              </button>
              <button
                aria-label="Remove collage image"
                onClick={() =>
                  patch({ slides: block.slides?.filter((_, i) => i !== index) })
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}
