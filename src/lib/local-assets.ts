import mappings from '@/mocks/asset-map.json';
const map=mappings as Record<string,string>;
export const localAsset=(url:string)=>map[url] || url;
export function localizeAssets<T>(value:T):T {
  if(typeof value==='string')return localAsset(value) as T;
  if(Array.isArray(value))return value.map(v=>localizeAssets(v)) as T;
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localizeAssets(v)])) as T;
  return value;
}
