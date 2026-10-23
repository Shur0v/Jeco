"use client";

import { useSearchParams } from "next/navigation";

/** Update the dashboard panel and its shareable URL entirely on the client. */
export function useDashboardNavigation<T extends string>(
  allowed: readonly T[],
  fallback: T,
) {
  const params = useSearchParams();
  const requested = params.get("tab") as T | null;
  const tab = requested && allowed.includes(requested) ? requested : fallback;

  function navigate(next: T) {
    if (!allowed.includes(next) || next === tab) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    // Next.js integrates the native History API with useSearchParams. This
    // renders the already-loaded panel without an RSC request or page reload.
    window.history.pushState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  return [tab, navigate] as const;
}
