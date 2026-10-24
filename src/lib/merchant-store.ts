import {localizeAssets} from "./local-assets";
import { openPreviewDB } from './browser-db';
import { readMerchantRecords, persistMerchantRecords } from './merchant-persistence';
import { optimizeImage } from './image-optimization';
import { Product, DemoOrder, PromoCode } from "@/types/commerce";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { MOCK_PROMO_CODES } from "@/mocks/promotions";
import {
  MAIN_NAV_ITEMS,
  SHOP_MEGA_MENU,
  EARRINGS_MEGA_MENU,
  GOLD_14K_MEGA_MENU,
} from "@/config/site";

export type ProductStatus = "draft" | "published" | "archived";
export type MerchantProduct = Product & {
  status: ProductStatus;
  subcategoryId?: string;
  weight?: number;
  personalization?: { enabled: boolean; instructions: string; limit: number };
  imageAlt?: string[];
  lowStockThreshold?: number;
  costs?: Record<string, number>;
};
export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  hidden?: boolean;
  aliases?: string[];
};
export type MenuEntry = {
  id: string;
  label: string;
  categoryId?: string;
  href: string;
  parentId?: string;
  hidden?: boolean;
  image?: string;
  group?: string;
};
export type HomeBlock = {
  showcaseVersion?: 1;
  eyebrow?: string;
  buttonLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  family?: string;
  setting?: string;
  collection?: string;
  interval?: number;
  items?: { id: string; title: string; text?: string; media: string; mobileMedia?: string; alt: string; href: string; buttonLabel?: string; productIds?: string[] }[];
  source?: "featured" | "new-arrivals" | "best-sellers";
  id: string;
  label: string;
  media: string;
  mobileMedia?: string;
  mediaType?: "image" | "video";
  poster?: string;
  slides?: string[];
  alt: string;
  title?: string;
  text?: string;
  href: string;
  hidden?: boolean;
  productIds?: string[];
  mode?: "automatic" | "manual";
  updatedAt?: string;
  reviewDays?: number;
};
export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "cancelled"
  | "partially-refunded"
  | "refunded";
export type OrderDetails = {
  paymentStatus: PaymentStatus;
  provider: "bKash" | "Nagad";
  refunded: number;
  fulfillment:
    | "unfulfilled"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  returnStatus: "none" | "requested" | "approved" | "resolved";
  courier: string;
  tracking: string;
  notes: string;
  history: { at: string; text: string }[];
  stockDeducted?: boolean;
  restocked?: boolean;
};
export type AnalyticsEvent = {
  id: string;
  at: string;
  path: string;
  type: string;
  label: string;
  productId?: string;
  categoryId?: string;
  section?: string;
  controlId?: string;
  breadcrumb?: [string, string, string];
  sessionId?: string;
};
export type Campaign = {
  enabled: boolean;
  text: string;
  href: string;
  mode: "always" | "hover";
  layout: "center" | "split" | "pill";
  height: number;
  color: string;
  textColor: string;
  image: string;
  start: string;
  end: string;
};
export type MerchantDiscount = PromoCode & {
  id: string;
  active: boolean;
  start?: string;
  end?: string;
  limit?: number;
  productIds?: string[];
  categoryIds?: string[];
};
export type MerchantState = {
  version: 2;
  products: MerchantProduct[];
  deleted: string[];
  categories: Category[];
  menus: MenuEntry[];
  menuPublished: boolean;
  home: HomeBlock[];
  marquee: { messages: string[]; speed: number; direction: "left" | "right" };
  campaign: Campaign;
  discounts: MerchantDiscount[];
  orderDetails: Record<string, OrderDetails>;
  orders: DemoOrder[];
  events: AnalyticsEvent[];
  adjustments: {
    id: string;
    at: string;
    productId: string;
    variantId: string;
    before: number;
    after: number;
    reason: string;
  }[];
  customerNotes: Record<string, string>;
  settings: {
    name: string;
    email: string;
    announcement: string;
    shipping: number;
    freeShipping: number;
    freeGift: number;
    bkash: boolean;
    nagad: boolean;
  };
};

export const moneyBDT = (value: number) =>
  `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const uid = (prefix = "id") =>
  `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function toBDT(p: Product): MerchantProduct {
  if (p.currency === "BDT")
    return { ...p, status: (p as MerchantProduct).status || "published" };
  const price = (v: number) => Math.max(50, Math.round((v * 110) / 50) * 50);
  return {
    ...p,
    currency: "BDT",
    status: "published",
    basePrice: price(p.basePrice),
    compareAtPrice: p.compareAtPrice ? price(p.compareAtPrice) : undefined,
    variants: p.variants.map((v) => ({
      ...v,
      price: price(v.price),
      compareAtPrice: v.compareAtPrice ? price(v.compareAtPrice) : undefined,
    })),
    lowStockThreshold: 5,
  };
}
function defaults(): MerchantState {
  const slugs = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)));
  return {
    version: 2,
    products: [],
    deleted: [],
    categories: slugs.map((id) => ({
      id,
      slug: id,
      name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    menus: [
      ...MAIN_NAV_ITEMS.map((n, i) => ({
        id: `menu-${i}`,
        label: n.label,
        href: n.href,
        categoryId: slugs.includes(
          n.href.split("/").pop() as Product["category"],
        )
          ? n.href.split("/").pop()
          : undefined,
      })),
      ...Object.entries(SHOP_MEGA_MENU).flatMap(([group, entries], g) =>
        entries.map((entry, i) => ({
          id: `shop-child-${g}-${i}`,
          label: entry.label,
          href: entry.href,
          parentId: "menu-0",
          group: group.replace(/([A-Z])/g, " $1"),
          categoryId: slugs.includes(
            entry.href.split("/").pop() as Product["category"],
          )
            ? entry.href.split("/").pop()
            : undefined,
        })),
      ),
      ...Object.entries(EARRINGS_MEGA_MENU).flatMap(([group, entries], g) =>
        entries.map((entry, i) => ({
          id: `earring-child-${g}-${i}`,
          label: entry.label,
          href: entry.href,
          parentId: "menu-3",
          group: group.replace(/([A-Z])/g, " $1"),
        })),
      ),
      ...Object.entries(GOLD_14K_MEGA_MENU).flatMap(([group, entries], g) =>
        entries.map((entry, i) => ({
          id: `gold-child-${g}-${i}`,
          label: entry.label,
          href: entry.href,
          parentId: "menu-11",
          group: group.replace(/([A-Z])/g, " $1"),
        })),
      ),
    ],
    menuPublished: false,
    home: [],
    marquee: {
      messages: [
        "GENTLE ON SENSITIVE SKIN",
        "POKE-FREE COMFORT",
        "14K SOLID GOLD",
        "MADE FOR YOUR EVERYDAY",
        "WORLDWIDE SHIPPING",
      ],
      speed: 32,
      direction: "left",
    },
    campaign: {
      enabled: false,
      text: "A little sparkle, a special price. Shop the festival sale",
      href: "/collections/festival-sale",
      mode: "hover",
      layout: "center",
      height: 40,
      color: "#e8aaa8",
      textColor: "#442c29",
      image: "",
      start: "",
      end: "",
    },
    discounts: MOCK_PROMO_CODES.map((p, i) => ({
      ...p,
      id: `discount-${i}`,
      active: true,
      productIds: [],
      categoryIds: [],
    })),
    orderDetails: {},
    orders: [],
    events: [],
    adjustments: [],
    customerNotes: {},
    settings: {
      name: "J&CO. Jewellery",
      email: "hello@jcojewellery.com",
      announcement: "Free shipping on orders ৳6,000+",
      shipping: 100,
      freeShipping: 6000,
      freeGift: 12000,
      bkash: true,
      nagad: true,
    },
  };
}
let state = defaults();
let ready = false;
let initPromise: Promise<void> | undefined;
let queue: Promise<unknown> = Promise.resolve();
let revision = 0;
let channel: BroadcastChannel | undefined;
const listeners = new Set<(kind?: string) => void>();
export const getMerchant = () => state;
export const merchantReady = () => ready;
export const merchantRevision = () => revision;
export function subscribeMerchant(listener: (kind?: string) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function notify(broadcast = true, kind = "state") {
  revision++;
  listeners.forEach((fn) => fn(kind));
  if (kind !== "events" && typeof window !== "undefined")
    window.dispatchEvent(new Event("jco:catalog-update"));
  if (broadcast) channel?.postMessage(kind);
}
async function readKey<T>(key: string): Promise<T | undefined> {
  const db = await database();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const r = db
        .transaction("records", "readonly")
        .objectStore("records")
        .get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
async function readPersisted() {
  const saved = (await readMerchantRecords()) || (await readKey<MerchantState>("state"));
  const events = await readKey<AnalyticsEvent[]>("events");
  return saved ? localizeAssets({ ...saved, events: events || saved.events }) : undefined;
}
const database = openPreviewDB;
const persist = persistMerchantRecords;
export function initMerchant() {
  if (typeof window === "undefined") return Promise.resolve();
  return (initPromise ||= (async () => {
    const saved = await readPersisted();
    if (saved) {
      state = { ...defaults(), ...saved };
      let upgraded = false;

      if (!(await readKey("manifest")) && !saved.menuPublished && !saved.menus.some((m) => m.parentId)) {
        state.menus = defaults().menus;
        upgraded = true;
      }
      if (upgraded) await persist(state);
    } else {
      try {
        const legacy = JSON.parse(
          localStorage.getItem("jco_admin_catalog_v1") || "{}",
        ) as Record<
          string,
          {
            name: string;
            basePrice: number;
            inStock: boolean;
            stockCount?: number;
            hidden?: boolean;
          }
        >;
        state.products = Object.entries(legacy).flatMap(([id, change]) => {
          const base = MOCK_PRODUCTS.find((p) => p.id === id);
          if (!base) return [];
          const migrated = toBDT({
            ...base,
            name: change.name,
            basePrice: change.basePrice,
            variants: base.variants.map((v) => ({
              ...v,
              price: change.basePrice,
              stockCount: change.inStock
                ? (change.stockCount ?? v.stockCount)
                : 0,
              inStock: change.inStock,
            })),
            inStock: change.inStock,
          });
          return [
            {
              ...migrated,
              status: change.hidden
                ? ("archived" as const)
                : ("published" as const),
            },
          ];
        });
        const settings = JSON.parse(
          localStorage.getItem("jco_admin_settings_v1") || "{}",
        );
        if (settings.storeName) state.settings.name = settings.storeName;
        if (settings.email) state.settings.email = settings.email;
      } catch { throw new Error("Legacy catalog data could not be migrated. Existing data was retained; export or repair it before retrying."); }
      await persist(state);
    }
    const existing = new Set(state.products.map(p=>p.id));
    const missing = MOCK_PRODUCTS.filter(p=>!existing.has(p.id) && !state.deleted.includes(p.id));
    if (missing.length || !(await readKey("manifest"))) {
      state.products.push(...missing.map(toBDT));
      await persist(state);
    }
    if (!(await readKey('legacy-complete'))) {
      const legacyOrders=JSON.parse(localStorage.getItem('jco_demo_orders_v1') || '[]') as DemoOrder[];
      for(const order of legacyOrders)if(!state.orders.some(o=>o.id===order.id)){state.orders.push(order);state.orderDetails[order.id]=defaultOrderDetails(order);}
      const legacyDiscounts=JSON.parse(localStorage.getItem('jco_admin_discounts_v1') || '[]') as PromoCode[];
      for(const code of legacyDiscounts)if(!state.discounts.some(d=>d.code===code.code.toUpperCase()))state.discounts.push({...code,code:code.code.toUpperCase(),id:uid('discount'),active:true});
      await persist(state);
      const {writeRecords}=await import('./browser-db');await writeRecords([{store:'records',key:'legacy-complete',value:true}]);
      localStorage.removeItem?.('jco_admin_catalog_v1');localStorage.removeItem?.('jco_admin_settings_v1');localStorage.removeItem?.('jco_admin_discounts_v1');
    }
    if (!(await readKey('media-optimized-v3'))) {
      const optimized=new Map<string,string>();
      const walk=async(value:any):Promise<any>=>{
        if(typeof value==='string'&&value.startsWith('data:image/')){
          if(!optimized.has(value))optimized.set(value,await optimizeImage(await (await fetch(value)).blob()));return optimized.get(value);
        }
        if(Array.isArray(value))return Promise.all(value.map(walk));
        if(value&&typeof value==='object')return Object.fromEntries(await Promise.all(Object.entries(value).map(async([k,v])=>[k,await walk(v)])));
        return value;
      };
      state=await walk(state);
      state.products=state.products.map(p=>{
        if(p.visualSpec.customImage)return p;
        const images=[...new Set([...p.images,...p.lifestyleImages])];
        return {...p,images,lifestyleImages:[],visualSpec:{...p.visualSpec,customImage:images[0]},variants:p.variants.map(v=>({...v,imageIndex:Math.max(0,images.indexOf(p.images[v.imageIndex || 0]))}))};
      });
      await persist(state);const {writeRecords}=await import('./browser-db');await writeRecords([{store:'records',key:'media-optimized-v3',value:true}]);
    }
    state = localizeAssets(state);
    ready = true;
    if (
      typeof BroadcastChannel !== "undefined" &&
      typeof navigator !== "undefined"
    ) {
      channel = new BroadcastChannel("jco-merchant-changes");
      channel.onmessage = (event) => {
        if(event.data === "replace") { window.location.reload();return; }
        queue = queue
          .then(async () => {
            if (event.data === "events") {
              const events = await readKey<AnalyticsEvent[]>("events");
              if (events) state = { ...state, events };
              notify(false, "events");
              return;
            }
            const latest = await readPersisted();
            if (latest) {
              state = latest;
              notify(false);
            }
          })
          .catch(() => {});
      };
    }
    notify();
  })());
}
export function changeMerchant(
  edit: (draft: MerchantState) => void,
): Promise<void> {
  const task = queue.then(async () => {
    await initMerchant();
    const work = async () => {
      const latest = await readPersisted();
      if (latest) state = latest;
      const next = structuredClone(state);
      edit(next);
      await persist(next);
      state = next;
      notify();
    };
    if (typeof navigator !== "undefined" && navigator.locks)
      await navigator.locks.request("jco-merchant-write", work);
    else await work();
  });
  queue = task.catch(() => {});
  return task;
}
export function merchantProducts(
  base: Product[] = MOCK_PRODUCTS,
  includeHidden = false,
): MerchantProduct[] {
  const overlay = new Map(state.products.map((p) => [p.id, p]));
  const list = base.map((p) => overlay.get(p.id) || toBDT(p));
  const ids = new Set(base.map((p) => p.id));
  list.push(...state.products.filter((p) => !ids.has(p.id)));
  return list.filter(
    (p) =>
      !state.deleted.includes(p.id) &&
      (includeHidden || p.status === "published"),
  );
}
export function validateProduct(
  p: MerchantProduct,
  others = merchantProducts(MOCK_PRODUCTS, true),
) {
  if (!p.name.trim() || !p.slug.trim() || !p.description.trim() || !p.category)
    throw new Error("Add a name, URL slug, description and category.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))
    throw new Error("Use lowercase letters, numbers and hyphens in the URL.");
  if (others.some((v) => v.id !== p.id && v.slug === p.slug))
    throw new Error("This product URL is already in use.");
  if (!p.images.length) throw new Error("Add at least one product image.");
  if (!p.variants.length) throw new Error("Add at least one variant.");
  const skus = new Set<string>();
  const category = state.categories.find(
    (c) => c.id === p.category && !c.parentId,
  );
  if (!category) throw new Error("Select an existing top-level category.");
  if (
    p.subcategoryId &&
    !state.categories.some(
      (c) => c.id === p.subcategoryId && c.parentId === p.category,
    )
  )
    throw new Error("Select a subcategory belonging to the chosen category.");
  if (
    (p.weight ?? 0) < 0 ||
    (p.lowStockThreshold ?? 0) < 0 ||
    Object.values(p.costs || {}).some((c) => !Number.isFinite(c) || c < 0)
  )
    throw new Error("Weight, cost and stock thresholds cannot be negative.");
  for (const v of p.variants) {
    if (
      !v.sku.trim() ||
      skus.has(v.sku.toLowerCase()) ||
      others.some(
        (o) =>
          o.id !== p.id &&
          o.variants.some((x) => x.sku.toLowerCase() === v.sku.toLowerCase()),
      )
    )
      throw new Error("Every variant needs a unique SKU.");
    skus.add(v.sku.toLowerCase());
    if (
      !Number.isFinite(v.price) ||
      v.price <= 0 ||
      !Number.isInteger(v.stockCount) ||
      v.stockCount < 0
    )
      throw new Error(
        "Prices must be positive and stock must be a whole number, zero or more.",
      );
    if (v.compareAtPrice !== undefined && v.compareAtPrice <= v.price)
      throw new Error("The original price must be higher than the sale price.");
  }
}
export async function saveProduct(p: MerchantProduct) {
  validateProduct(p);
  const product = {
    ...p,
    collections: [...p.collections.map(slug=>state.categories.find(c=>c.aliases?.includes(slug))?.slug || slug).filter(c=>!['new-arrivals','best-sellers','featured'].includes(c)),...(p.isNewArrival?['new-arrivals']:[]),...(p.isBestSeller?['best-sellers']:[]),...(p.isFeatured?['featured']:[])],
    basePrice: Math.min(...p.variants.map((v) => v.price)),
    compareAtPrice: p.variants.find(
      (v) => v.price === Math.min(...p.variants.map((x) => x.price)),
    )?.compareAtPrice,
    inStock: p.variants.some((v) => v.stockCount > 0),
    badges: p.badges.filter((b) => b !== "SOLD OUT"),
    availableFinishes: Array.from(new Set(p.variants.map((v) => v.finish))),
    variants: p.variants.map((v) => ({ ...v, inStock: v.stockCount > 0 })),
  };
  await changeMerchant((s) => {
    validateProduct(p);
    s.products = [...s.products.filter((v) => v.id !== p.id), product];
  });
}
export function categoryBlock(
  id: string,
  products = merchantProducts(MOCK_PRODUCTS, true),
  snapshot = state,
) {
  const slug = snapshot.categories.find((c) => c.id === id)?.slug;
  const linked = products.filter(
    (p) =>
      p.category === id ||
      p.subcategoryId === id ||
      Boolean(slug && p.collections.includes(slug)),
  );
  if (linked.length)
    return {
      message: `Move these products to another category before deleting this category. ${linked.length} product(s) use it.`,
      productId: linked[0].id,
      count: linked.length,
    };
  if (snapshot.categories.some((c) => c.parentId === id))
    return { message: "Move or remove the subcategories first.", count: 0 };
  if (snapshot.menus.some((m) => m.categoryId === id))
    return {
      message: "Reassign or remove the linked menu items first.",
      count: 0,
    };
  return null;
}
export const defaultOrderDetails = (order: DemoOrder): OrderDetails => ({
  paymentStatus: "successful",
  provider: /nagad/i.test(order.paymentMethodLabel) ? "Nagad" : "bKash",
  refunded: 0,
  fulfillment:
    order.status === "Preparing Shipment (Demo)" ? "processing" : "unfulfilled",
  returnStatus: "none",
  courier: "",
  tracking: "",
  notes: "",
  history: [{ at: order.createdAt, text: "Demo order received" }],
  ...(order.id.startsWith("sample-order-")
    ? {
        paymentStatus: (Number(order.id.split("-").pop()) % 7 === 0
          ? "pending"
          : Number(order.id.split("-").pop()) % 7 === 1
            ? "failed"
            : Number(order.id.split("-").pop()) % 7 === 2
              ? "partially-refunded"
              : "successful") as PaymentStatus,
        refunded:
          Number(order.id.split("-").pop()) % 7 === 2
            ? Math.round(order.total * 0.2)
            : 0,
        fulfillment: (
          ["unfulfilled", "processing", "shipped", "delivered"] as const
        )[Number(order.id.split("-").pop()) % 4],
        returnStatus:
          Number(order.id.split("-").pop()) % 7 === 3
            ? ("requested" as const)
            : ("none" as const),
      }
    : {}),
});
export function paymentTotals(
  orders: DemoOrder[],
  details: Record<string, OrderDetails>,
) {
  return orders
    .filter((o) => o.currency === "BDT")
    .reduce(
      (sum, o) => {
        const d = details[o.id] || defaultOrderDetails(o);
        const paid = ["successful", "partially-refunded", "refunded"].includes(
          d.paymentStatus,
        )
          ? o.total
          : 0;
        return {
          received: sum.received + paid,
          refunded: sum.refunded + (paid ? d.refunded : 0),
          net: sum.net + paid - (paid ? d.refunded : 0),
        };
      },
      { received: 0, refunded: 0, net: 0 },
    );
}
export async function completeOrder(order: DemoOrder) {
  await changeMerchant((s) => {
    if (s.orders.some((o) => o.id === order.id)) return;
    const products = merchantProducts(MOCK_PRODUCTS, true);
    if (order.currency !== "BDT" || !order.items.length)
      throw new Error("Choose a BDT order with products.");
    const quantities = new Map<string, number>();
    order.items.forEach((i) => {
      if (!Number.isInteger(i.quantity) || i.quantity <= 0)
        throw new Error("Invalid product quantity.");
      quantities.set(
        i.variantId,
        (quantities.get(i.variantId) || 0) + i.quantity,
      );
    });
    for (const item of order.items) {
      const p = products.find((p) => p.id === item.productId);
      const v = p?.variants.find((v) => v.id === item.variantId);
      if (
        !v ||
        p?.status !== "published" ||
        v.stockCount < (quantities.get(item.variantId) || 0)
      )
        throw new Error(
          `${item.name} no longer has enough stock. Please update your bag.`,
        );
      if (v.price !== item.price)
        throw new Error(
          `${item.name} has an updated price. Remove it and add it to your bag again.`,
        );
    }
    for (const item of order.items) {
      let p = s.products.find((p) => p.id === item.productId);
      if (!p) {
        p = structuredClone(products.find((p) => p.id === item.productId)!);
        s.products.push(p);
      }
      const v = p.variants.find((v) => v.id === item.variantId)!;
      const before = v.stockCount;
      v.stockCount -= item.quantity;
      v.inStock = v.stockCount > 0;
      p.inStock = p.variants.some((v) => v.inStock);
      s.adjustments.push({
        id: uid("stock"),
        at: new Date().toISOString(),
        productId: p.id,
        variantId: v.id,
        before,
        after: v.stockCount,
        reason: `Order ${order.orderNumber}`,
      });
    }
    s.orders.unshift(order);
    s.orderDetails[order.id] = {
      ...defaultOrderDetails(order),
      stockDeducted: true,
    };
  });
}
export function readMedia(file: File, video = false): Promise<string> {
  if (
    !(
      video
        ? /^(image\/(jpeg|png|webp)|video\/mp4)$/
        : /^image\/(jpeg|png|webp)$/
    ).test(file.type)
  )
    return Promise.reject(
      new Error(
        video
          ? "Choose a JPG, PNG, WebP or MP4 file."
          : "Choose a JPG, PNG or WebP image.",
      ),
    );
  if (file.size > (video ? 25 : 5) * 1024 * 1024)
    return Promise.reject(
      new Error(
        video
          ? "Media must be smaller than 25 MB."
          : "Images must be smaller than 5 MB.",
      ),
    );
  if (file.type.startsWith("image/")) return optimizeImage(file);
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("This file could not be read."));
    r.readAsDataURL(file);
  });
}
export function campaignActive(c = state.campaign) {
  const now = Date.now();
  return (
    c.enabled &&
    (!c.start || new Date(c.start).getTime() <= now) &&
    (!c.end || new Date(c.end).getTime() >= now)
  );
}
export function recordEvent(event: Omit<AnalyticsEvent, "id" | "at">) {
  if (!ready) return;
  const captured = { ...event, id: uid("event"), at: new Date().toISOString() };
  const task = queue.then(async () => {
    const work = async () => {
      const previous =
        (await readKey<AnalyticsEvent[]>("events")) || state.events;
      const events = [
        ...previous,
        captured,
      ].slice(-20000);
      const db = await database();
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction("records", "readwrite");
          tx.objectStore("records").put(events, "events");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
        state = { ...state, events };
        notify(true, "events");
      } finally {
        db.close();
      }
    };
    if (typeof navigator !== "undefined" && navigator.locks)
      await navigator.locks.request("jco-merchant-write", work);
    else await work();
  });
  queue = task.catch((e) => { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("jco:storage-error", { detail: (e as Error).message || "Analytics could not be saved." })); });
}

export async function replaceMerchantSnapshot(next: MerchantState) {
  await changeMerchant(s => { Object.keys(s).forEach(k=>delete (s as any)[k]); Object.assign(s,next); });
}
export function freshMerchantState(): MerchantState { const s=defaults(); s.products=MOCK_PRODUCTS.map(toBDT); return s; }

export async function flushMerchantWrites() { await queue; }

export async function publishNavigation(categories:Category[],menus:MenuEntry[]) {
  await changeMerchant(s=>{
    const ids=new Set(categories.map(c=>c.id)), menuIds=new Set(menus.map(m=>m.id));
    if(ids.size!==categories.length || categories.some(c=>!c.name.trim()||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)||c.parentId&&!ids.has(c.parentId)))throw new Error('Choose valid categories and parent connections.');
    for(const category of categories){let node:Category|undefined=category;const seen=new Set<string>();while(node?.parentId){if(seen.has(node.id))throw new Error('Categories cannot form a cycle.');seen.add(node.id);node=categories.find(c=>c.id===node?.parentId);}if(seen.size>1)throw new Error('Use a category and one subcategory level.');}
    for(const previous of s.categories.filter(c=>!ids.has(c.id))){const linked=s.products.filter(p=>p.category===previous.id||p.subcategoryId===previous.id||[previous.slug,...(previous.aliases||[])].some(slug=>p.collections.includes(slug)));if(linked.length)throw new Error('Move these products to another category before deleting this category.');}
    const nextCategories=categories.map(c=>{const previous=s.categories.find(p=>p.id===c.id);return {...c,aliases:[...new Set([...(previous?.aliases||[]),...(c.aliases||[]),...(previous&&previous.slug!==c.slug?[previous.slug]:[])])].filter(slug=>slug!==c.slug)};});
    const routes=nextCategories.flatMap(c=>[c.slug,...(c.aliases||[])]);if(new Set(routes).size!==routes.length)throw new Error('A category URL is already in use, including a previous URL.');
    if(menus.some(m=>!m.label.trim()||!m.href.startsWith('/')||m.categoryId&&!ids.has(m.categoryId)||m.parentId&&!menuIds.has(m.parentId)))throw new Error('Reconnect menu destinations before publishing.');
    for(const menu of menus){let node:MenuEntry|undefined=menu;const seen=new Set<string>();while(node?.parentId){if(seen.has(node.id))throw new Error('Menus cannot form a cycle.');seen.add(node.id);node=menus.find(m=>m.id===node?.parentId);}}
    const renames=new Map(s.categories.flatMap(old=>{const next=nextCategories.find(c=>c.id===old.id);return next&&next.slug!==old.slug?[[old.slug,next.slug] as const]:[];}));
    s.products=s.products.map(p=>({...p,collections:p.collections.map(slug=>renames.get(slug)||slug)}));
    s.categories=nextCategories;s.menus=menus.map(m=>{const c=nextCategories.find(c=>c.id===m.categoryId);return c?{...m,href:`/collections/${c.slug}`}:m;});s.menuPublished=true;
  });
}
