"use client";
import {previewServices} from "@/commerce/browser-services";
import { useEffect } from "react";
import { clickMetadata } from "@/lib/analytics";
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
        previewServices.analytics.record({
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
        !!el.closest('[data-no-track], [data-private-content]') || (!!el.closest('form') && !el.closest('[data-track-control]')) ||
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
      const metadata = clickMetadata(el,path);
      let sessionId = sessionStorage.getItem('jco-analytics-session');
      if (!sessionId) { sessionId=crypto.randomUUID(); sessionStorage.setItem('jco-analytics-session',sessionId); }
      previewServices.analytics.record({
        path,
        type:metadata.type,
        label:metadata.label,
        controlId:metadata.controlId,
        breadcrumb:metadata.breadcrumb,
        sessionId,
        productId,
        categoryId: href.startsWith("/collections/")
          ? href.split("/")[2]?.split("?")[0]
          : undefined,
        section:metadata.section,
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
