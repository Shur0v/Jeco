"use client";
import { useEffect, useState } from "react";
import {
  getMerchant,
  initMerchant,
  subscribeMerchant,
} from "@/lib/merchant-store";
export function useMerchant() {
  const [, render] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const unsub = subscribeMerchant(() => render((v) => v + 1));
    initMerchant()
      .then(() => render((v) => v + 1))
      .catch((e) => setError(e.message));
    return unsub;
  }, []);
  return { data: getMerchant(), error };
}
