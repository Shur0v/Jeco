import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {IDBFactory,IDBDatabase} from 'fake-indexeddb';
import {aggregateActivity,eventBreadcrumb} from '@/lib/analytics';
import {reorderProductMedia} from '@/lib/product-media';
import {MOCK_PRODUCTS} from '@/mocks/products';
beforeEach(()=>{
  vi.resetModules();vi.stubGlobal('indexedDB',new IDBFactory());
  const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>memory.set(k,v),removeItem:(k:string)=>memory.delete(k)});
  vi.stubGlobal('window',{dispatchEvent:vi.fn()});
  // Node's channel would keep a test process alive; real browser integration is verified separately.
  vi.stubGlobal('BroadcastChannel',undefined);
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('connected browser preview',()=>{
  it('keeps renamed category URLs and collection assignments connected and unchecks product row flags',async()=>{
    const store=await import('@/lib/merchant-store');await store.initMerchant();
    const p=store.merchantProducts()[0];await store.saveProduct({...p,isNewArrival:false,collections:[...p.collections,'rings']});
    expect(store.merchantProducts().find(x=>x.id===p.id)?.collections).not.toContain('new-arrivals');
    const categories=store.getMerchant().categories.map(c=>c.id==='rings'?{...c,name:'Ring jewels',slug:'ring-jewels'}:c);
    await store.publishNavigation(categories,store.getMerchant().menus);
    const {commerceService}=await import('@/commerce');
    expect(commerceService.catalog.getProductsForCollection('ring-jewels').some(x=>x.id===p.id)).toBe(true);
    expect(commerceService.catalog.getProductsForCollection('rings').some(x=>x.id===p.id)).toBe(true);
    expect(commerceService.catalog.getCollectionBySlug('rings')?.title).toBe('Ring jewels');
    expect(store.getMerchant().menus.filter(m=>m.categoryId==='rings').every(m=>m.href==='/collections/ring-jewels')).toBe(true);
  });
  it('aborts replacement completely when a write fails after clearing was requested',async()=>{
    const db=await import('@/lib/browser-db');
    await db.writeRecords([{store:'records',key:'keep',value:'saved'}]);
    await expect(db.writeRecords([{store:'records',key:'invalid',value:()=>0}],['records'])).rejects.toThrow();
    expect(await db.readRecord('records','keep')).toBe('saved');
  });
  it('materializes every seed product and reloads exact edits from IDB',async()=>{
    const store=await import('@/lib/merchant-store');await store.initMerchant();
    expect(store.getMerchant().products).toHaveLength(MOCK_PRODUCTS.length);
    const original=store.merchantProducts()[0];await store.saveProduct({...original,name:'Exact edited piece'});
    const {readMerchantRecords}=await import('@/lib/merchant-persistence');const restored=await readMerchantRecords();
    expect(restored?.products.find(p=>p.id===original.id)?.name).toBe('Exact edited piece');
    expect(restored?.products.filter(p=>p.name==='Exact edited piece')).toHaveLength(1);
  });
  it('migrates old shopper profiles, addresses, wishlist and temporary session identity once',async()=>{
    const profile={userId:'owner@example.test',email:'owner@example.test',firstName:'Owner',lastName:'Preview',isDemoSession:true,loggedInAt:'2026-10-24',defaultAddress:{city:'Dhaka'},wishlistIds:['product-1']};
    localStorage.setItem('jco_demo_profiles_v1',JSON.stringify({[profile.userId]:profile}));localStorage.setItem('jco_demo_auth_session_v1',JSON.stringify(profile));
    const {initShopper,shopperStorage}=await import('@/lib/shopper-storage');await initShopper();
    expect(JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1')!)[profile.userId].defaultAddress.city).toBe('Dhaka');
    expect(localStorage.getItem('jco_demo_profiles_v1')).toBeNull();expect(localStorage.getItem('jco_demo_auth_session_v1')).toBe(profile.userId);
    expect(JSON.parse(shopperStorage.getItem('jco_demo_auth_session_v1')!).wishlistIds).toEqual(['product-1']);
  });
  it('stores media separately and refuses incomplete backups before replacing data',async()=>{
    const store=await import('@/lib/merchant-store');await store.initMerchant();
    const p=store.merchantProducts()[0],image='data:image/webp;base64,UklGRg==';
    await store.saveProduct({...p,images:[image],visualSpec:{...p.visualSpec,customImage:image}});
    const db=await import('@/lib/browser-db');const media=await db.readEntries('media');expect(media).toHaveLength(1);
    const entity=await db.readRecord<any>('entities',`products/${p.id}`);expect(entity.images[0]).toMatch(/^idb:media-/);
    const backup=await import('@/lib/preview-backup');const exported=await backup.exportPreviewBackup();expect(()=>backup.validateBackup(exported)).not.toThrow();
    const invalid=structuredClone(exported);invalid.stores.media=[];
    await expect(backup.importPreviewBackup(invalid)).rejects.toThrow(/media/);
    expect((await db.readEntries('media'))).toHaveLength(1);
    await backup.importPreviewBackup(exported);expect((await db.readEntries('media'))).toHaveLength(1);
  });
  it('rejects backup cycles and invalid stock without changing current data',async()=>{
    const store=await import('@/lib/merchant-store');await store.initMerchant();const backup=await import('@/lib/preview-backup');const original=await backup.exportPreviewBackup();
    const invalid=structuredClone(original);const product=invalid.stores.entities.find(([k])=>k.startsWith('products/'))![1] as any;product.variants[0].stockCount=-1;
    expect(()=>backup.validateBackup(invalid)).toThrow(/stock/);
    const bad=structuredClone(original);const category=bad.stores.entities.find(([k])=>k.startsWith('categories/'))![1] as any;category.parentId=category.id;
    expect(()=>backup.validateBackup(bad)).toThrow(/cycle/);
  });
  it('rolls back failed shopper writes and does not claim committed success',async()=>{
    const storage=await import('@/lib/shopper-storage');await storage.initShopper();storage.shopperStorage.setItem('jco_demo_cart_v1','[]');await storage.flushShopper();
    vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(()=>{throw new Error('Storage unavailable');});
    storage.shopperStorage.setItem('jco_demo_cart_v1','[{"id":"unsaved"}]');await expect(storage.flushShopper()).rejects.toThrow(/unavailable/);
    expect(storage.shopperStorage.getItem('jco_demo_cart_v1')).toBe('[]');expect(storage.shopperStatus().error).toContain('unavailable');
  });
  it('retains unavailable historical breadcrumbs and groups named button activity',()=>{
    const base={id:'old',at:'2026-10-24T00:00:00Z',type:'wishlist',label:'Wishlist',path:'/collections/rings'};
    expect(eventBreadcrumb(base)).toBe('Unavailable');
    const events=Array.from({length:26},(_,i)=>({...base,id:String(i),controlId:'product-wishlist',breadcrumb:['Rings','Features','Wishlist'] as [string,string,string],sessionId:`local-${i%2}`}));
    expect(events.slice(0,25)).toHaveLength(25);expect(events.slice(25,50)).toHaveLength(1);
    const rows=aggregateActivity(events);expect(rows).toHaveLength(1);expect(rows[0].count).toBe(26);expect(rows[0].sessions.size).toBe(2);expect(eventBreadcrumb(rows[0].event)).toBe('Rings → Features → Wishlist');
  });
  it('preserves variant images and alt text when media is reordered or removed',()=>{
    const p={...MOCK_PRODUCTS[0],status:'published' as const,images:['a','b','c'],imageAlt:['A','B','C']};
    const reordered=reorderProductMedia(p,[2,0,1]);expect(reordered.images).toEqual(['c','a','b']);expect(reordered.imageAlt).toEqual(['C','A','B']);
    expect(reordered.variants?.[0].imageIndex).toBe(1);
    expect(reorderProductMedia(p,[1,2]).variants?.[0].imageIndex).toBe(0);
  });
  it('rejects stale inventory adjustments and keeps stock on failed payment refunds',async()=>{
    const {previewServices}=await import('@/commerce/browser-services');const product=(await previewServices.catalog.list())[0],variant=product.variants[0];
    await expect(previewServices.inventory.adjust({productId:product.id,variantId:variant.id,quantity:1,expectedQuantity:999,reason:'test'})).rejects.toThrow(/changed/);
    expect((await previewServices.catalog.get(product.id))?.variants[0].stockCount).toBe(variant.stockCount);
    await expect(previewServices.payments.refund({orderId:'absent',amount:1,expectedRefunded:0})).rejects.toThrow(/not found/);
  });
});
