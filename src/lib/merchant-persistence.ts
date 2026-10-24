import { readEntries, readRecord, readSnapshot, writeRecords, Write } from './browser-db';
import type { MerchantState } from './merchant-store';

// Media bytes are stored once, independently of catalog/content records.
const mediaIds = new Map<string,string>();
async function encode(value: unknown, media: Write[]): Promise<unknown> {
  if (typeof value === 'string' && /^data:(image|video)\//.test(value)) {
    let id = mediaIds.get(value);
    if (!id) {
      const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
      id = 'media-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''); mediaIds.set(value,id);
    }
    if (!(await readRecord('media',id)) && !media.some(w=>w.key===id)) media.push({store:'media',key:id,value});
    return `idb:${id}`;
  }
  if (Array.isArray(value)) return Promise.all(value.map(v=>encode(v,media)));
  if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k,v])=>[k,await encode(v,media)])));
  return value;
}
function decode(value: unknown, media: Map<string,string>): any {
  if (typeof value === 'string' && value.startsWith('idb:media-')) {
    const result = media.get(value.slice(4)); if (!result) throw new Error('A saved media file is missing. Restore a complete backup.'); return result;
  }
  if (Array.isArray(value)) return value.map(v=>decode(v,media));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v,media)]));
  return value;
}
export async function readMerchantRecords(): Promise<MerchantState | undefined> {
  const snapshot=await readSnapshot(['records','entities','media']);
  const records=new Map(snapshot.records);
  const manifest = records.get('manifest') as {version:3; keys:string[]} | undefined;
  if (!manifest) return;
  const entities = new Map(snapshot.entities);
  const media = new Map(snapshot.media) as Map<string,string>;
  const output: Record<string,unknown> = {};
  for (const key of manifest.keys) {
    const value = entities.get(key);
    if (value === undefined) throw new Error(`Saved record ${key} is missing. Existing data has not been reset.`);
    if (key.includes('/')) continue;
    output[key] = Array.isArray(value) && value.every(v=>typeof v==='string' && v.startsWith('ref:'))
      ? value.map(ref => { const item = entities.get(ref.slice(4)); if (!item) throw new Error('Saved entity is missing.'); return item; }) : value;
  }
  return decode(output,media) as MerchantState;
}
export async function persistMerchantRecords(next: MerchantState, reset=false) {
  const media: Write[]=[];
  const encoded = await encode({...next,events:[]},media) as Record<string,unknown>;
  const entries: [string,unknown][]=[];
  for (const [key,value] of Object.entries(encoded)) {
    if (Array.isArray(value) && value.length && value.every(v=>v && typeof v==='object' && 'id' in v)) {
      entries.push([key,value.map(v=>`ref:${key}/${v.id}`)]);
      value.forEach(v=>entries.push([`${key}/${v.id}`,v]));
    } else entries.push([key,value]);
  }
  const previous = new Map(await readEntries('entities'));
  const keys = new Set(entries.map(([k])=>k));
  const writes: Write[] = entries.filter(([k,v])=>JSON.stringify(previous.get(k))!==JSON.stringify(v)).map(([key,value])=>({store:'entities',key,value}));
  previous.forEach((_,key)=> { if (!keys.has(key)) writes.push({store:'entities',key,remove:true}); });
  const changed=reset?entries.map(([key,value])=>({store:'entities' as const,key,value})):writes;
  await writeRecords([...media,...changed,{store:'records',key:'manifest',value:{version:3,keys:[...keys]}},{store:'records',key:'events',value:next.events},...(reset?[{store:'records' as const,key:'shopper-migrated',value:true},{store:'records' as const,key:'legacy-complete',value:true}]:[])],reset?['records','entities','media','shopper']:[]);
}
