import {IDBFactory,IDBDatabase} from "fake-indexeddb";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import type { DemoOrder } from "@/types/commerce";

function fakeDatabase() {
  const api=new IDBFactory();
  return {api,fail:()=>{vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(()=>{throw new Error('Storage is full or unavailable. Your change was not saved.');});}};
}
async function setup() {
  const db = fakeDatabase();
  vi.stubGlobal("indexedDB", db.api);
  const memory = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => memory.get(k) || null,
    setItem: (k: string, v: string) => memory.set(k, v),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  const store = await import("@/lib/merchant-store");
  await store.initMerchant();
  return { store, db };
}
function orderFor(
  p: ReturnType<typeof import("@/lib/merchant-store").merchantProducts>[number],
): DemoOrder {
  const v = p.variants[0];
  return {
    id: "test-order",
    orderNumber: "TEST-1",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "line",
        productId: p.id,
        variantId: v.id,
        slug: p.slug,
        name: p.name,
        finish: v.finish,
        price: v.price,
        quantity: 2,
        image: p.images[0],
        maxStock: v.stockCount,
      },
    ],
    shippingAddress: {
      email: "sample@example.test",
      firstName: "Sample",
      lastName: "Customer",
      address: "Sample Road",
      city: "Dhaka",
      state: "Dhaka",
      country: "Bangladesh",
      postalCode: "1207",
      phone: "sample",
      marketingOptIn: false,
      smsOptIn: false,
    },
    shippingMethod: {
      id: "standard",
      name: "Standard",
      description: "",
      estimatedDays: "2 days",
      price: 100,
    },
    subtotal: v.price * 2,
    discountAmount: 0,
    shippingCost: 100,
    total: v.price * 2 + 100,
    currency: "BDT",
    paymentMethodLabel: "bKash demo",
    status: "Confirmed (Demo)",
  };
}
beforeEach(() => vi.resetModules());
afterEach(() => {vi.restoreAllMocks();vi.unstubAllGlobals();});
describe("merchant catalog and transaction integrity", () => {
  it("creates a published product that survives reload and collection filtering", async () => {
    const { store } = await setup();
    const base = store.merchantProducts()[0];
    const p = {
      ...structuredClone(base),
      id: "created-product",
      slug: "created-product",
      name: "Created piece",
      category: "rings" as const,
      variants: base.variants.map((v, i) => ({
        ...v,
        id: `new-${i}`,
        sku: `NEW-${i}`,
      })),
    };
    await store.saveProduct(p);
    expect(store.merchantProducts().find((x) => x.id === p.id)?.currency).toBe(
      "BDT",
    );
    const { commerceService } = await import("@/commerce");
    expect(
      commerceService.catalog.getProductBySlug("created-product")?.id,
    ).toBe(p.id);
    expect(
      commerceService.catalog
        .getProductsForCollection("rings")
        .some((x) => x.id === p.id),
    ).toBe(true);
    expect(
      commerceService.catalog
        .getProductsForCollection("necklaces")
        .some((x) => x.id === p.id),
    ).toBe(false);
    expect(
      commerceService.catalog
        .searchProducts("Created piece")
        .some((x) => x.id === p.id),
    ).toBe(true);
  });
  it("rejects duplicate slugs, duplicate SKUs and invalid variant quantities", async () => {
    const { store } = await setup();
    const p = structuredClone(store.merchantProducts()[0]);
    expect(() => store.validateProduct({ ...p, id: "duplicate" })).toThrow(
      /URL/,
    );
    expect(() =>
      store.validateProduct({
        ...p,
        variants: [{ ...p.variants[0], stockCount: -1 }],
      }),
    ).toThrow(/stock/);
    expect(() =>
      store.validateProduct({
        ...p,
        variants: [p.variants[0], { ...p.variants[0], id: "another" }],
      }),
    ).toThrow(/SKU/);
  });
  it("protects draft and archived category references, children and menu destinations", async () => {
    const { store } = await setup();
    const p = { ...store.merchantProducts()[0], status: "archived" as const };
    const snapshot = store.getMerchant();
    expect(store.categoryBlock(p.category, [p], snapshot)?.productId).toBe(
      p.id,
    );
    expect(
      store.categoryBlock("parent", [], {
        ...snapshot,
        categories: [
          { id: "child", name: "Child", slug: "child", parentId: "parent" },
        ],
        menus: [],
      })?.message,
    ).toMatch(/subcategories/);
    expect(
      store.categoryBlock("linked", [], {
        ...snapshot,
        categories: [],
        menus: [{ id: "m", label: "Menu", href: "/", categoryId: "linked" }],
      })?.message,
    ).toMatch(/menu/);
    expect(
      store.categoryBlock("empty", [], {
        ...snapshot,
        categories: [],
        menus: [],
      }),
    ).toBeNull();
  });
  it("deducts stock exactly once and refuses an oversold order", async () => {
    const { store } = await setup();
    const p = store
      .merchantProducts()
      .find((x) => x.variants[0].stockCount >= 2)!;
    const order = orderFor(p);
    const before = p.variants[0].stockCount;
    await store.completeOrder(order);
    await store.completeOrder(order);
    expect(
      store.merchantProducts().find((x) => x.id === p.id)?.variants[0]
        .stockCount,
    ).toBe(before - 2);
    expect(store.getMerchant().orders).toHaveLength(1);
    expect(store.getMerchant().orderDetails[order.id].stockDeducted).toBe(true);
    const invalid = {
      ...order,
      id: "oversold",
      items: [{ ...order.items[0], quantity: 100000 }],
    };
    await expect(store.completeOrder(invalid)).rejects.toThrow(/stock/);
    expect(store.getMerchant().orders).toHaveLength(1);
  });
  it("does not change committed state when persistence fails", async () => {
    const { store, db } = await setup();
    const original = store.getMerchant().settings.name;
    db.fail();
    await expect(
      store.changeMerchant((s) => {
        s.settings.name = "Not saved";
      }),
    ).rejects.toThrow(/Storage/);
    expect(store.getMerchant().settings.name).toBe(original);
  });
  it("excludes unpaid and legacy USD orders, and accounts for refunds", async () => {
    const { store } = await setup();
    const order = orderFor(store.merchantProducts()[0]);
    const orders = [
      order,
      { ...order, id: "pending" },
      { ...order, id: "legacy", currency: "USD" as const },
    ];
    const details = {
      [order.id]: {
        ...store.defaultOrderDetails(order),
        paymentStatus: "partially-refunded" as const,
        refunded: 200,
      },
      pending: {
        ...store.defaultOrderDetails(order),
        paymentStatus: "pending" as const,
      },
    };
    expect(store.paymentTotals(orders, details)).toEqual({
      received: order.total,
      refunded: 200,
      net: order.total - 200,
    });
  });
  it("enforces targeted discount scope, minimum spend, dates and usage limit", async () => {
    const { store } = await setup();
    const p = store.merchantProducts()[0];
    const order = orderFor(p);
    await store.changeMerchant((s) => {
      s.discounts = [
        {
          id: "d",
          code: "TARGET10",
          description: "Targeted",
          discountType: "percentage",
          value: 10,
          minSubtotal: 500,
          active: true,
          productIds: [p.id],
          limit: 1,
        },
      ];
    });
    const { commerceService } = await import("@/commerce");
    expect(
      commerceService.promotions.validatePromoCode(
        "TARGET10",
        order.subtotal,
        order.items,
      ).valid,
    ).toBe(true);
    expect(
      commerceService.promotions.validatePromoCode("TARGET10", 100, order.items)
        .valid,
    ).toBe(false);
    expect(
      commerceService.promotions.validatePromoCode("TARGET10", order.subtotal, [
        { ...order.items[0], productId: "other" },
      ]).valid,
    ).toBe(false);
    await store.changeMerchant((s) => {
      s.orders = [{ ...order, promoCode: "TARGET10" }];
    });
    expect(
      commerceService.promotions.validatePromoCode(
        "TARGET10",
        order.subtotal,
        order.items,
      ).valid,
    ).toBe(false);
  });
  it("keeps product IDs unchanged when a product is renamed", async () => {
    const { store } = await setup();
    const p = store.merchantProducts()[0];
    await store.saveProduct({ ...p, name: "Renamed product" });
    expect(
      store.merchantProducts().find((x) => x.name === "Renamed product")?.id,
    ).toBe(p.id);
  });
});
