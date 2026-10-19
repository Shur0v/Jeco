import { CurrencyCode, MetalFinish, ProductVisualSpec } from '@/types/commerce';
import { CURRENCIES } from '@/config/site';

export function formatMoney(amountInUSD: number, currency: CurrencyCode = 'USD'): string {
  const cfg = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amountInUSD * cfg.rateFromUSD;
  return `${cfg.symbol}${converted.toFixed(2)} ${cfg.code}`;
}

export function formatMoneyShort(amountInUSD: number, currency: CurrencyCode = 'USD'): string {
  const cfg = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amountInUSD * cfg.rateFromUSD;
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

export function createDemoOrderMeta() {
  const now = new Date();
  const stamp = now.getTime();
  return {
    id: `ord-${stamp}`,
    orderNumber: `JCO-${100000 + (stamp % 900000)}`,
    createdAt: now.toISOString(),
  };
}

