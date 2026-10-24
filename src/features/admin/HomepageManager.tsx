"use client";
import {previewServices} from "@/commerce/browser-services";
import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Upload,
  Monitor,
  Smartphone,
  X,
  Plus,
  Trash2,
  ArrowUp,
} from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import {
  changeMerchant,
  HomeBlock,
  readMedia,
  merchantProducts,
} from "@/lib/merchant-store";
import { HOME_BLOCKS, HomeEditContext } from "@/features/homepage/home-content";
import { HomepageView } from "@/features/homepage/HomepageView";
import { Panel, Field } from "./admin-shared";
export function HomepageManager() {
  const { data } = useMerchant();
  const [blocks, setBlocks] = useState<HomeBlock[]>(
    HOME_BLOCKS.map((b) => ({ ...b, ...data.home.find((x) => x.id === b.id) })),
  );
  const [marquee, setMarquee] = useState(data.marquee);
  const [selected, setSelected] = useState("hero");
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [undoStack, setUndoStack] = useState<
    { blocks: HomeBlock[]; marquee: typeof marquee }[]
  >([]);
  function remember() {
    setUndoStack((stack) => [...stack.slice(-19), { blocks, marquee }]);
  }
  function updateMarquee(next: typeof marquee) {
    remember();
    setMarquee(next);
  }
  const block = blocks.find((b) => b.id === selected)!;
  const dirty =
    JSON.stringify(blocks) !==
      JSON.stringify(
        HOME_BLOCKS.map((b) => ({
          ...b,
          ...data.home.find((x) => x.id === b.id),
        })),
      ) || JSON.stringify(marquee) !== JSON.stringify(data.marquee);
  useEffect(() => {
    const warn = (e: Event) => {
      if (dirty && !window.confirm("Discard unpublished homepage changes?"))
        e.preventDefault();
    };
    window.addEventListener("jco:before-panel", warn);
    return () => window.removeEventListener("jco:before-panel", warn);
  }, [dirty]);
  function patch(values: Partial<HomeBlock>) {
    remember();
    setBlocks((bs) =>
      bs.map((b) => (b.id === selected ? { ...b, ...values } : b)),
    );
  }
  async function upload(
    file: File | undefined,
    key: "media" | "mobileMedia" | "poster" = "media",
  ) {
    if (!file) return;
    try {
      patch({
        [key]: await previewServices.media.upload(file, key === "media"),
        ...(key === "media"
          ? { mediaType: file.type === "video/mp4" ? "video" : "image" }
          : {}),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function publish() {
    setBusy(true);
    try {
      if (blocks.some((b) => b.href && !b.href.startsWith("/")))
        throw new Error(
          "Use a storefront path beginning with / for section links.",
        );
      const publishedBlocks = blocks.map((b) => ({
        ...b,
        updatedAt:
          JSON.stringify(b) !==
          JSON.stringify(data.home.find((x) => x.id === b.id))
            ? new Date().toISOString()
            : b.updatedAt,
      }));
      await previewServices.content.publishHome({home:publishedBlocks,marquee});
      setBlocks(publishedBlocks);
      setUndoStack([]);
      setNotice("Homepage published. Your storefront now uses these sections.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="studio-toolbar">
        <div>
          <p className="studio-caption">
            Your live layout. Click a section to make it yours.
          </p>
          <span className="studio-caption">
            {dirty ? "Unpublished changes" : "All changes published"}
          </span>
        </div>
        <div className="studio-actions">
          <button
            className={`studio-icon ${!mobile ? "active" : ""}`}
            aria-label="Desktop preview"
            onClick={() => setMobile(false)}
          >
            <Monitor size={18} />
          </button>
          <button
            className={`studio-icon ${mobile ? "active" : ""}`}
            aria-label="Mobile preview"
            onClick={() => setMobile(true)}
          >
            <Smartphone size={18} />
          </button>
          <button
            className="studio-button secondary"
            disabled={!undoStack.length}
            onClick={() => {
              const previous = undoStack[undoStack.length - 1];
              if (previous) {
                setBlocks(previous.blocks);
                setMarquee(previous.marquee);
                setUndoStack(undoStack.slice(0, -1));
              }
            }}
          >
            <RotateCcw size={16} />
            Undo
          </button>
          <button
            className="studio-button secondary"
            onClick={() => {
              if (window.confirm("Reset unpublished changes?")) {
                setBlocks(
                  HOME_BLOCKS.map((b) => ({
                    ...b,
                    ...data.home.find((x) => x.id === b.id),
                  })),
                );
                setMarquee(data.marquee);
              }
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button disabled={busy} className="studio-button" onClick={publish}>
            <Save size={16} />
            {busy ? "Publishing…" : "Publish changes"}
          </button>
        </div>
      </div>
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="studio-success" role="status">
          {notice}
        </p>
      )}
      <div className="studio-home-editor">
        <div
          className={`studio-home-canvas ${mobile ? "mobile" : ""}`}
          data-no-track
        >
          <HomeEditContext.Provider
            value={{ blocks, marquee, onSelect: setSelected }}
          >
            <HomepageView />
          </HomeEditContext.Provider>
        </div>
        <aside className="studio-home-inspector">
          <Panel title="Section settings">
            <div className="studio-form">
              <Field label="Select section">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>
              <h3>{block.label}</h3>
              {["new-arrivals", "best-sellers"].includes(selected) ? (
                <>
                  <Field label="Product selection">
                    <select
                      value={block.mode || "automatic"}
                      onChange={(e) =>
                        patch({
                          mode: e.target.value as "automatic" | "manual",
                        })
                      }
                    >
                      <option value="automatic">
                        Automatic from product flags
                      </option>
                      <option value="manual">Choose products</option>
                    </select>
                  </Field>
                  {block.mode !== "manual" && (
                    <Field label="Automatic product source">
                      <select
                        value={block.source || selected}
                        onChange={(e) =>
                          patch({
                            source: e.target.value as HomeBlock["source"],
                          })
                        }
                      >
                        <option value="new-arrivals">New arrival flag</option>
                        <option value="best-sellers">Best seller flag</option>
                        <option value="featured">Featured flag</option>
                      </select>
                    </Field>
                  )}
                  {block.mode === "manual" && (
                    <div className="studio-choice-list">
                      {merchantProducts().map((p) => (
                        <label className="studio-check" key={p.id}>
                          <input
                            type="checkbox"
                            checked={block.productIds?.includes(p.id) || false}
                            onChange={(e) =>
                              patch({
                                productIds: e.target.checked
                                  ? [...(block.productIds || []), p.id]
                                  : block.productIds?.filter(
                                      (id) => id !== p.id,
                                    ),
                              })
                            }
                          />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              ) : selected === "marquee" ? (
                <>
                  <Field label="Messages (one per line)">
                    <textarea
                      rows={7}
                      value={marquee.messages.join("\n")}
                      onChange={(e) =>
                        updateMarquee({
                          ...marquee,
                          messages: e.target.value.split("\n"),
                        })
                      }
                    />
                  </Field>
                  <Field label="Loop duration (seconds)">
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={marquee.speed}
                      onChange={(e) =>
                        updateMarquee({
                          ...marquee,
                          speed: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Direction">
                    <select
                      value={marquee.direction}
                      onChange={(e) =>
                        updateMarquee({
                          ...marquee,
                          direction: e.target.value as "left" | "right",
                        })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </Field>
                  <p className="studio-caption">
                    Pauses on hover/focus. Reduced-motion users see static
                    messages.
                  </p>
                </>
              ) : (
                <>
                  {selected !== "categories" && (
                    <>
                      <Field label="Upload image or MP4">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4"
                          onChange={(e) => upload(e.target.files?.[0])}
                        />
                      </Field>
                      <Field label="Media URL">
                        <input
                          value={block.media}
                          onChange={(e) => patch({ media: e.target.value })}
                        />
                      </Field>
                      <Field label="Media type">
                        <select
                          value={block.mediaType || "image"}
                          onChange={(e) =>
                            patch({
                              mediaType: e.target.value as "image" | "video",
                            })
                          }
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </Field>
                      <Field label="Mobile image (optional)">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            upload(e.target.files?.[0], "mobileMedia")
                          }
                        />
                      </Field>
                      {block.mediaType === "video" && (
                        <Field label="Video poster">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              upload(e.target.files?.[0], "poster")
                            }
                          />
                        </Field>
                      )}
                      <Field label="Image description / alt text">
                        <input
                          value={block.alt}
                          onChange={(e) => patch({ alt: e.target.value })}
                        />
                      </Field>
                    </>
                  )}
                  <Field label="Heading">
                    <input
                      value={block.title || ""}
                      onChange={(e) => patch({ title: e.target.value })}
                    />
                  </Field>
                  <Field label="Supporting text">
                    <textarea
                      value={block.text || ""}
                      onChange={(e) => patch({ text: e.target.value })}
                    />
                  </Field>
                  <Field label="Button / link destination">
                    <input
                      value={block.href}
                      onChange={(e) => patch({ href: e.target.value })}
                    />
                  </Field>
                  {["hero", "gallery"].includes(selected) && (
                    <>
                      <Field
                        label={
                          selected === "hero"
                            ? "Additional hero slides"
                            : "Gallery images"
                        }
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            try {
                              const urls = await Promise.all(
                                Array.from(e.target.files || []).map((f) =>
                                  previewServices.media.upload(f),
                                ),
                              );
                              patch({
                                slides: [...(block.slides || []), ...urls],
                              });
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        />
                      </Field>
                      {block.slides?.map((url, i) => (
                        <div className="studio-slide-row" key={i}>
                          <img src={url} alt={`Slide ${i + 1}`} />
                          <button
                            aria-label="Move slide earlier"
                            disabled={!i}
                            onClick={() => {
                              const next = [...block.slides!];
                              [next[i], next[i - 1]] = [next[i - 1], next[i]];
                              patch({ slides: next });
                            }}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            aria-label="Remove slide"
                            onClick={() =>
                              patch({
                                slides: block.slides?.filter((_, n) => n !== i),
                              })
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={!!block.hidden}
                  onChange={(e) => patch({ hidden: e.target.checked })}
                />
                Hide section
              </label>
              <Field label="Review this content every">
                <select
                  value={block.reviewDays || 30}
                  onChange={(e) =>
                    patch({ reviewDays: Number(e.target.value) })
                  }
                >
                  <option value="7">Week</option>
                  <option value="30">Month</option>
                  <option value="14">Two weeks</option>
                  <option value="90">Quarter</option>
                </select>
              </Field>
              <Field label="Custom review interval (days)">
                <input
                  type="number"
                  min="1"
                  value={block.reviewDays || 30}
                  onChange={(e) =>
                    patch({ reviewDays: Math.max(1, Number(e.target.value)) })
                  }
                />
              </Field>
              <p className="studio-caption">
                Last updated:{" "}
                {block.updatedAt
                  ? new Date(block.updatedAt).toLocaleDateString()
                  : "Original content"}
                . Review reminders appear in Overview. No automatic publishing.
              </p>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
