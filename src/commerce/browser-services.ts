import { validateEditorialBlocks } from "@/lib/editorial-content";
/** Browser implementation. Future HTTP services implement contracts/domain.ts instead. */
import type { PreviewServices } from './contracts/domain';
import { publishNavigation,initMerchant,getMerchant,merchantProducts,saveProduct,completeOrder,changeMerchant,defaultOrderDetails,uid,readMedia,recordEvent,moneyBDT } from '@/lib/merchant-store';
import { initShopper,shopperStorage,flushShopper } from '@/lib/shopper-storage';
const ready=async()=>{await initMerchant();};
export const previewServices:PreviewServices={
  catalog:{
    async list(hidden=false){await ready();return merchantProducts(undefined,hidden);},
    async get(id){await ready();return merchantProducts(undefined,true).find(p=>p.id===id);},
    save:saveProduct,
  },
  customers:{
    async list(){await initShopper();return JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1')||'{}');},
    async save(profile){await initShopper();const profiles=JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1')||'{}');profiles[profile.userId.toLowerCase()]={...profiles[profile.userId.toLowerCase()],...profile};shopperStorage.setItem('jco_demo_profiles_v1',JSON.stringify(profiles));await flushShopper();},
  },
  carts:{
    async get(){await initShopper();return JSON.parse(shopperStorage.getItem('jco_demo_cart_v1')||'[]');},
    async save(items){await initShopper();shopperStorage.setItem('jco_demo_cart_v1',JSON.stringify(items));await flushShopper();},
  },
  orders:{async list(){await ready();return getMerchant().orders;},complete:completeOrder},
  inventory:{async adjust({productId,variantId,quantity,reason,expectedQuantity}){
    if(!Number.isInteger(quantity)||quantity<0||!reason.trim())throw new Error('Enter a nonnegative whole quantity and a reason.');
    await changeMerchant(s=>{const p=s.products.find(p=>p.id===productId),v=p?.variants.find(v=>v.id===variantId);if(!p||!v)throw new Error('Variant not found.');if(v.stockCount!==expectedQuantity)throw new Error('Stock changed in another view. Reopen the adjustment.');const before=v.stockCount;v.stockCount=quantity;v.inStock=quantity>0;p.inStock=p.variants.some(v=>v.stockCount>0);s.adjustments.unshift({id:uid('stock'),at:new Date().toISOString(),productId,variantId,before,after:quantity,reason:reason.trim()});});
  }},
  payments:{
    async list(){await ready();return getMerchant().orders.map(order=>({order,details:getMerchant().orderDetails[order.id]||defaultOrderDetails(order)}));},
    async refund({orderId,amount,expectedRefunded}){
      if(!Number.isFinite(amount)||amount<=0)throw new Error('Enter a positive refund amount.');
      await changeMerchant(s=>{const order=s.orders.find(o=>o.id===orderId);if(!order)throw new Error('Order not found.');const previous=s.orderDetails[orderId]||defaultOrderDetails(order);if(previous.refunded!==expectedRefunded)throw new Error('Payment changed elsewhere. Reopen the order.');if(!['successful','partially-refunded'].includes(previous.paymentStatus)||amount>order.total-previous.refunded)throw new Error('Refund exceeds the remaining received balance.');const refunded=Math.round((previous.refunded+amount)*100)/100;s.orderDetails[orderId]={...previous,refunded,paymentStatus:refunded===order.total?'refunded':'partially-refunded',history:[...previous.history,{at:new Date().toISOString(),text:`Demo refund ${moneyBDT(amount)}`}]};});
    },
  },
  promotions:{async list(){await ready();return getMerchant().discounts;},async save(discounts){await changeMerchant(s=>{s.discounts=discounts;});}},
  content:{publishNavigation,async get(){await ready();const {home,menus,categories,campaign,marquee,settings}=getMerchant();return {home,menus,categories,campaign,marquee,settings};},async publishHome(input){validateEditorialBlocks(input.home);await changeMerchant(s=>{s.home=input.home;s.marquee=input.marquee;});}},
  media:{upload:readMedia},
  analytics:{async list(){await ready();return getMerchant().events;},record:recordEvent},
};
