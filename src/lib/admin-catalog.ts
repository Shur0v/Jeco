import { Product } from '@/types/commerce';
import { merchantProducts, saveProduct, initMerchant } from './merchant-store';
export type ProductUpdate = Pick<Product,'id'|'name'|'basePrice'|'inStock'> & {hidden?:boolean;stockCount?:number};
export function hydrateCatalog(){ /* initMerchant owns migration and hydration. */ }
export async function saveCatalogProduct(update:ProductUpdate){
  await initMerchant();
  const product=merchantProducts(undefined,true).find(p=>p.id===update.id);
  if(!product)throw new Error('Product not found.');
  await saveProduct({...product,name:update.name,status:update.hidden?'archived':'published',variants:product.variants.map(v=>({...v,price:update.basePrice,stockCount:update.inStock?(update.stockCount??v.stockCount):0,inStock:update.inStock}))});
}
export function applyCatalogUpdates(products:Product[],includeHidden=false):Product[]{return merchantProducts(products,includeHidden);}
