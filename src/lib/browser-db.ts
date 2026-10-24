/** Browser-only storage boundary. The future HTTP adapter must not import this module. */
export const DATABASE_VERSION = 3;
export type StoreName = 'records' | 'entities' | 'media' | 'shopper';
export function openPreviewDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('Browser storage is unavailable. Nothing was saved.'));
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('jco-merchant-preview', DATABASE_VERSION);
    r.onupgradeneeded = () => {
      for (const name of ['records', 'entities', 'media', 'shopper'])
        if (!r.result.objectStoreNames.contains(name)) r.result.createObjectStore(name);
    };
    r.onsuccess = () => { r.result.onversionchange = () => r.result.close(); resolve(r.result); };
    r.onerror = () => reject(new Error('Browser storage could not open. Existing data was retained.'));
    r.onblocked = () => reject(new Error('Close older store tabs and retry the storage upgrade.'));
  });
}
export async function readRecord<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openPreviewDB();
  try { return await new Promise<T | undefined>((resolve, reject) => {
    const r = db.transaction(store).objectStore(store).get(key);
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  }); } finally { db.close(); }
}
export async function readEntries<T>(store: StoreName): Promise<[string, T][]> {
  const db = await openPreviewDB();
  try { return await new Promise((resolve, reject) => {
    const rows: [string, T][] = [];
    const r = db.transaction(store).objectStore(store).openCursor();
    r.onsuccess = () => { const c = r.result; if (c) { rows.push([String(c.key), c.value]); c.continue(); } else resolve(rows); };
    r.onerror = () => reject(r.error);
  }); } finally { db.close(); }
}
export type Write = { store: StoreName; key: string; value?: unknown; remove?: boolean };
export async function readSnapshot(names:StoreName[]):Promise<Record<StoreName,[string,unknown][]>> {
  const db=await openPreviewDB();
  try {return await new Promise((resolve,reject)=>{
    const output={} as Record<StoreName,[string,unknown][]>;
    const tx=db.transaction(names,'readonly');
    for(const name of names){output[name]=[];const r=tx.objectStore(name).openCursor();r.onsuccess=()=>{const c=r.result;if(c){output[name].push([String(c.key),c.value]);c.continue();}};}
    tx.oncomplete=()=>resolve(output);tx.onerror=tx.onabort=()=>reject(new Error('Browser data could not be read consistently.'));
  });}finally{db.close();}
}
export async function writeRecords(writes: Write[], clear: StoreName[] = []) {
  const names = [...new Set([...writes.map(w => w.store), ...clear])];
  if (!names.length) return;
  const db = await openPreviewDB();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(names, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(new Error('Storage is full or unavailable. Your change was not saved.'));
    try {
      for (const name of clear) tx.objectStore(name).clear();
      for (const w of writes) w.remove ? tx.objectStore(w.store).delete(w.key) : tx.objectStore(w.store).put(w.value, w.key);
    } catch (error) { tx.abort(); reject(error); }
  }); } finally { db.close(); }
}
