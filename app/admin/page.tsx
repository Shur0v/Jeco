import { MerchantStudio as AdminDashboard } from "@/features/admin/MerchantStudio";
import type { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Store Admin | J&CO. Jewellery",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="workspace-empty muted">Opening merchant studio…</div>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
