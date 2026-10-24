import { readEntries, readRecord, writeRecords } from './browser-db';

const KEYS = ['jco_demo_cart_v1','jco_demo_wishlist_v1','jco_demo_recent_v1','jco_demo_profiles_v1','jco_demo_orders_v1','jco_demo_custom_reviews_v1','jco_demo_newsletter_v1','jco_contact_messages_v1'];
const SESSION = 'jco_demo_auth_session_v1';
const cache = new Map<string, string>();
const committedValues = new Map<string,string>();
let pending = Promise.resolve();
let initialized: Promise<void> | undefined;
let channel: BroadcastChannel | undefined;
let status = { pending: 0, error: '', savedAt: '' };
const listeners = new Set<() => void>();
function notify() { queueMicrotask(() => listeners.forEach(fn => fn())); }
export const shopperStatus = () => status;
export function subscribeShopper(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function initShopper() {
  return initialized ||= (async () => {
    const rows = await readEntries<string>('shopper');
    rows.forEach(([k,v]) => {cache.set(k,v);committedValues.set(k,v);});
    if (!(await readRecord('records','shopper-migrated'))) {
      const writes = KEYS.flatMap(key => {
        const value=localStorage.getItem(key);if(!value||cache.has(key))return [];
        const parsed=JSON.parse(value);
        if(key==='jco_demo_profiles_v1' ? (!parsed || Array.isArray(parsed) || typeof parsed!=='object') : !Array.isArray(parsed))throw new Error('Legacy shopper records are invalid. Existing data was retained.');
        return [{store:'shopper' as const,key,value}];
      });
      await writeRecords([...writes,{store:'records',key:'shopper-migrated',value:true}]);
      writes.forEach(w => {cache.set(w.key,w.value);committedValues.set(w.key,w.value);});
      KEYS.forEach(k => localStorage.removeItem(k));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('jco-shopper-changes');
      channel.onmessage = () => { pending = pending.then(async () => {
        const fresh = await readEntries<string>('shopper'); cache.clear(); fresh.forEach(([k,v]) => {cache.set(k,v);committedValues.set(k,v);}); notify();
      }).catch(reportError); };
    }
    const oldSession=localStorage.getItem(SESSION);
    if(oldSession && oldSession.startsWith('{')) {
      const session=JSON.parse(oldSession);const profiles=JSON.parse(cache.get('jco_demo_profiles_v1') || '{}');
      profiles[session.userId.toLowerCase()]={...profiles[session.userId.toLowerCase()],...session};
      const value=JSON.stringify(profiles);await writeRecords([{store:'shopper',key:'jco_demo_profiles_v1',value}]);cache.set('jco_demo_profiles_v1',value);committedValues.set('jco_demo_profiles_v1',value);
      localStorage.setItem(SESSION,session.userId.toLowerCase());
    }
    window.addEventListener?.('storage',(e:StorageEvent)=>{if(e.key===SESSION)notify();});
    notify();
  })();
}
function reportError(e: unknown) { status = {...status,error:(e as Error).message || 'Data could not be saved.'}; notify(); }
export async function flushShopper() { await pending; if (status.error) throw new Error(status.error); }
/** Synchronous view of hydrated records; writes expose pending/error status until IDB commits. */
export const shopperStorage = {
  getItem(key: string) { if(key===SESSION){const id=localStorage.getItem(key);if(!id)return null;if(id.startsWith('{'))return id;const profile=JSON.parse(cache.get('jco_demo_profiles_v1') || '{}')[id];return profile?JSON.stringify(profile):null;}return key==='jco_demo_currency_v1'?localStorage.getItem(key):cache.get(key)||null; },
  setItem(key: string, value: string) {
    if (key === SESSION) { localStorage.setItem(key,JSON.parse(value).userId.toLowerCase());return; }if(key==='jco_demo_currency_v1'){localStorage.setItem(key,value);return;}
    const before = cache.get(key); cache.set(key,value);
    status = {...status,pending:status.pending+1,error:''}; notify();
    pending = pending.then(async () => {
      try { const commit=async()=>{
        let committed=value;
        if(key==='jco_demo_profiles_v1'){
          const latest=JSON.parse((await readRecord<string>('shopper',key)) || '{}');
          const prior=JSON.parse(committedValues.get(key) || '{}'),desired=JSON.parse(value);
          for(const [id,profile] of Object.entries(desired))if(JSON.stringify(prior[id])!==JSON.stringify(profile)){
            const fields={...(latest[id] || {})} as Record<string,unknown>;
            for(const [field,next] of Object.entries(profile as object))if(JSON.stringify(prior[id]?.[field])!==JSON.stringify(next))fields[field]=next;
            latest[id]=fields;
          }
          committed=JSON.stringify(latest);
        }
        await writeRecords([{store:'shopper',key,value:committed}]);
        committedValues.set(key,committed);
        if(cache.get(key)===value)cache.set(key,committed);
      };
      if(typeof navigator!=='undefined'&&navigator.locks)await navigator.locks.request('jco-merchant-write',commit);else await commit(); status = {...status,savedAt:new Date().toISOString()}; channel?.postMessage(key); }
      catch (e) { if (cache.get(key) === value) { const saved=committedValues.get(key); if (saved === undefined) cache.delete(key); else cache.set(key,saved); } reportError(e); }
      finally { status = {...status,pending:status.pending-1}; notify(); }
    });
  },
  removeItem(key: string) { if (key === SESSION) localStorage.removeItem(key); else this.setItem(key,'null'); },
};
export async function reloadShopper() { await pending; cache.clear(); (await readEntries<string>('shopper')).forEach(([k,v])=>cache.set(k,v)); status={pending:0,error:'',savedAt:new Date().toISOString()}; channel?.postMessage('reload'); notify(); }
