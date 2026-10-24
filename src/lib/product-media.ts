import type { MerchantProduct } from './merchant-store';
/** Reorder by original index, preserving alt text and variant image ownership. */
export function reorderProductMedia(product:MerchantProduct,order:number[]):Partial<MerchantProduct>{
  const images=order.map(i=>product.images[i]);
  return {images,imageAlt:order.map(i=>product.imageAlt?.[i] || ''),visualSpec:{...product.visualSpec,customImage:images[0]},variants:product.variants.map(v=>({...v,imageIndex:Math.max(0,order.indexOf(v.imageIndex || 0))}))};
}
