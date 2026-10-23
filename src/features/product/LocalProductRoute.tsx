"use client";
import Link from "next/link";
import { useMerchant } from "@/hooks/useMerchant";
import { merchantReady } from "@/lib/merchant-store";
import { commerceService } from "@/commerce";
import { ProductDetailView } from "./ProductDetailView";
export function LocalProductRoute({ slug }: { slug: string }) {
  useMerchant();
  const p = commerceService.catalog.getProductBySlug(slug);
  if (!merchantReady())
    return <div className="workspace-empty">Opening this piece…</div>;
  return p ? (
    <ProductDetailView key={p.id} product={p} />
  ) : (
    <div className="workspace-empty">
      <h1>Product unavailable</h1>
      <p>This piece is not currently published.</p>
      <Link href="/" className="rose-button">
        Back to home
      </Link>
    </div>
  );
}
