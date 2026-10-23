"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  initMerchant,
  recordEvent,
  merchantProducts,
} from "@/lib/merchant-store";
export function StorefrontTracker() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith("/admin")) return;
    let active = true;
    void initMerchant()
      .then(() => {
        if (!active) return;
        const slug = path.startsWith("/products/") ? path.split("/").pop() : "";
        const product = merchantProducts().find((p) => p.slug === slug);
        recordEvent({
          path,
          type: product ? "product-view" : "page-view",
          label: product ? "Product page" : "Page",
          productId: product?.id,
        });
      })
      .catch(() => {});
    const capture = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target : null;
      if (
        !el ||
        el.closest(
          '[data-no-track],input,textarea,select,[contenteditable="true"]',
        )
      )
        return;
      const button = el.closest("button,a");
      const href = button?.getAttribute("href") || "";
      const productId =
        el.closest("[data-product-id]")?.getAttribute("data-product-id") ||
        merchantProducts().find((p) => href === `/products/${p.slug}`)?.id;
      const action = button?.getAttribute("aria-label") || "";
      const type = /wishlist/i.test(action)
        ? "wishlist"
        : /quick add|add .*to bag|add to bag/i.test(action)
          ? "add-to-cart"
          : href.startsWith("/products/")
            ? "product-click"
            : el.closest("nav")
              ? "menu-click"
              : el.closest("[data-home-section]")
                ? "banner-click"
                : "click";
      recordEvent({
        path,
        type,
        label:
          button?.getAttribute("data-track-label") ||
          (/wishlist/i.test(action)
            ? "Wishlist"
            : type === "add-to-cart"
              ? "Add to bag"
              : button?.tagName === "A"
                ? "Link"
                : button
                  ? "Button"
                  : "Page area"),
        productId,
        categoryId: href.startsWith("/collections/")
          ? href.split("/")[2]?.split("?")[0]
          : undefined,
        section:
          el
            .closest("[data-home-section]")
            ?.getAttribute("data-home-section") || undefined,
      });
    };
    document.addEventListener("click", capture, true);
    return () => {
      active = false;
      document.removeEventListener("click", capture, true);
    };
  }, [path]);
  return null;
}
