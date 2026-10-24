import { readSnapshot, writeRecords, StoreName } from './browser-db';
import { flushShopper } from './shopper-storage';
import { freshMerchantState, flushMerchantWrites } from './merchant-store';
import { persistMerchantRecords } from './merchant-persistence';
const stores: StoreName[]=['records','entities','media','shopper'];
export type PreviewBackup={format:'jco-browser-preview';version:1;exportedAt:string;stores:Record<StoreName,[string,unknown][]>};
export function validateBackup(input: unknown): asserts input is PreviewBackup {
  const b=input as PreviewBackup;
  if (!b || b.format!=='jco-browser-preview' || b.version!==1 || !b.stores) throw new Error('Choose a supported J&CO. preview backup.');
  for(const store of stores) {
    const rows=b.stores[store]; if(!Array.isArray(rows)||rows.some(r=>!Array.isArray(r)||r.length!==2||typeof r[0]!=='string')||new Set(rows.map(r=>r[0])).size!==rows.length) throw new Error(`Invalid ${store} records.`);
  }
  const entities=new Map(b.stores.entities),media=new Map(b.stores.media),records=new Map(b.stores.records);
  const manifest=records.get('manifest') as {version:number;keys:string[]};
  if(manifest?.version!==3||!Array.isArray(manifest.keys)||manifest.keys.some(k=>!entities.has(k)))throw new Error('Backup is incomplete: missing catalog records.');
  const resolve=(key:string): any[]=>{const values=entities.get(key);if(!Array.isArray(values))throw new Error(`Missing ${key}.`);return values.map(v=>typeof v==='string'&&v.startsWith('ref:')?entities.get(v.slice(4)):v);};
  const products=resolve('products'), categories=resolve('categories'),menus=resolve('menus');
  const categoryIds=new Set(categories.map(c=>c?.id)), productIds=new Set(products.map(p=>p?.id));
  const variantIds=new Set<string>(),slugs=new Set<string>(),skus=new Set<string>();
  for(const p of products){
    if(!p?.id||!p.name||!p.slug||slugs.has(p.slug)||!['published','draft','archived'].includes(p.status)||!Array.isArray(p.variants)||!p.variants.length)throw new Error('Invalid product or duplicate slug.');
    slugs.add(p.slug);
    // Legacy category IDs match slugs; new category records use immutable IDs.
    if(!categories.some(c=>c?.id===p.category||c?.slug===p.category))throw new Error('A product category is missing.');
    if(p.subcategoryId&&!categoryIds.has(p.subcategoryId))throw new Error('A product subcategory is missing.');
    for(const v of p.variants){if(!v?.id||variantIds.has(v.id)||!v.sku||skus.has(v.sku.toLowerCase())||!Number.isFinite(v.price)||v.price<0||!Number.isInteger(v.stockCount)||v.stockCount<0)throw new Error('Invalid variant, duplicate SKU, or stock quantity.');variantIds.add(v.id);skus.add(v.sku.toLowerCase());}
  }
  if(productIds.size!==products.length||categoryIds.size!==categories.length)throw new Error('Duplicate entity IDs.');
  const menuIds=new Set(menus.map(m=>m?.id));
  for(const c of categories){if(!c?.id||!c.slug||c.parentId&&!categoryIds.has(c.parentId))throw new Error('Invalid category relationship.');let current=c;const seen=new Set();while(current?.parentId){if(seen.has(current.id))throw new Error('Category cycle.');seen.add(current.id);current=categories.find(c=>c.id===current.parentId);}}
  for(const m of menus){if(!m?.id||m.categoryId&&!categoryIds.has(m.categoryId)||m.parentId&&!menuIds.has(m.parentId))throw new Error('Invalid menu relationship.');let current=m;const seen=new Set();while(current?.parentId){if(seen.has(current.id))throw new Error('Menu cycle.');seen.add(current.id);current=menus.find(m=>m.id===current.parentId);}}
  function check(value:unknown){if(typeof value==='string'&&value.startsWith('idb:media-')&&!media.has(value.slice(4)))throw new Error('A referenced media file is missing.');if(Array.isArray(value))value.forEach(check);else if(value&&typeof value==='object')Object.values(value).forEach(check);}
  b.stores.entities.forEach(([,v])=>check(v));
  for(const [,v] of b.stores.shopper){if(typeof v!=='string')throw new Error('Invalid shopper data.');JSON.parse(v);}
  const orders=resolve('orders');const ids=new Set();for(const o of orders){if(!o?.id||ids.has(o.id)||!Array.isArray(o.items)||!Number.isFinite(o.total)||o.total<0||!o.shippingAddress)throw new Error('Invalid historical order.');ids.add(o.id);}
}
export async function exportPreviewBackup():Promise<PreviewBackup>{
  await flushShopper();await flushMerchantWrites();
  return {format:'jco-browser-preview',version:1,exportedAt:new Date().toISOString(),stores:await readSnapshot(stores)};
}
export async function importPreviewBackup(input:unknown){
  validateBackup(input);await flushShopper();await flushMerchantWrites();
  await writeRecords(stores.flatMap(store=>input.stores[store].map(([key,value])=>({store,key,value}))),stores);
  broadcastReplacement();
}
export async function resetPreview(){
  await flushShopper();await flushMerchantWrites();
  await persistMerchantRecords(freshMerchantState(),true);
  localStorage.removeItem('jco_demo_auth_session_v1');
  broadcastReplacement();
}

function broadcastReplacement(){if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('jco-merchant-changes');channel.postMessage('replace');channel.close();}}
