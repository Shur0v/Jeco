import type { CartItem, DemoOrder, DemoUserSession } from '@/types/commerce';
import type { AnalyticsEvent, MerchantProduct, MerchantState, OrderDetails } from '@/lib/merchant-store';

export type CustomerProfile=DemoUserSession & {wishlistIds?:string[]};
export type CustomerProfiles=Record<string,CustomerProfile>;
export interface CatalogRepository {
  list(includeUnpublished?:boolean):Promise<MerchantProduct[]>;
  get(id:string):Promise<MerchantProduct|undefined>;
  save(product:MerchantProduct):Promise<void>;
}
export interface CustomerRepository {
  list():Promise<CustomerProfiles>;
  save(profile:CustomerProfile):Promise<void>;
}
export interface CartRepository { get():Promise<CartItem[]>; save(items:CartItem[]):Promise<void>; }
export interface OrderRepository { list():Promise<DemoOrder[]>; complete(order:DemoOrder):Promise<void>; }
export interface InventoryRepository {
  adjust(input:{productId:string;variantId:string;quantity:number;reason:string;expectedQuantity:number}):Promise<void>;
}
export interface PaymentRepository {
  list():Promise<{order:DemoOrder;details:OrderDetails}[]>;
  refund(input:{orderId:string;amount:number;expectedRefunded:number}):Promise<void>;
}
export interface PromotionRepository { list():Promise<MerchantState['discounts']>; save(discounts:MerchantState['discounts']):Promise<void>; }
export interface ContentRepository {
  get():Promise<Pick<MerchantState,'home'|'menus'|'categories'|'campaign'|'marquee'|'settings'>>;
  publishNavigation(categories:MerchantState['categories'],menus:MerchantState['menus']):Promise<void>;
  publishHome(input:Pick<MerchantState,'home'|'marquee'>):Promise<void>;
}
export interface MediaRepository { upload(file:File,allowVideo?:boolean):Promise<string>; }
export interface AnalyticsRepository { list():Promise<AnalyticsEvent[]>; record(event:Omit<AnalyticsEvent,'id'|'at'>):void; }
export interface PreviewServices {
  catalog:CatalogRepository;customers:CustomerRepository;carts:CartRepository;orders:OrderRepository;
  inventory:InventoryRepository;payments:PaymentRepository;promotions:PromotionRepository;content:ContentRepository;
  media:MediaRepository;analytics:AnalyticsRepository;
}
