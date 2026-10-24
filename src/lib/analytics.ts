import type { AnalyticsEvent } from './merchant-store';
export const isClick = (e: AnalyticsEvent) => !['page-view','product-view','order-complete'].includes(e.type);
export const eventBreadcrumb = (e: AnalyticsEvent) => e.breadcrumb?.join(' → ') || 'Unavailable';
export const activityKey = (e: AnalyticsEvent) => JSON.stringify([e.path,e.controlId || e.label,e.breadcrumb || null]);
export function aggregateActivity(events: AnalyticsEvent[]) {
  const groups = new Map<string,{key:string;event:AnalyticsEvent;count:number;sessions:Set<string>;last:string}>();
  for (const event of events.filter(isClick)) {
    const key=activityKey(event), row=groups.get(key) || {key,event,count:0,sessions:new Set<string>(),last:event.at};
    row.count++; if(event.sessionId)row.sessions.add(event.sessionId); if(event.at>row.last)row.last=event.at; groups.set(key,row);
  }
  return [...groups.values()].sort((a,b)=>b.count-a.count || b.last.localeCompare(a.last));
}
export const titleCase = (text: string) => text.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function clickMetadata(el: Element, path: string) {
  const control=el.closest('button,a,[data-track-control]');
  const href=control?.getAttribute('href') || '';
  const explicit=control?.getAttribute('data-track-label');
  const aria=control?.getAttribute('aria-label') || '';
  const type=/wishlist/i.test(aria) || explicit==='Wishlist' ? 'wishlist' : /quick add|add .*to bag|add to bag/i.test(aria) || explicit==='Add to bag' ? 'add-to-cart' : href.startsWith('/products/') ? 'product-click' : el.closest('nav') ? 'menu-click' : el.closest('[data-home-section]') ? 'banner-click' : 'click';
  // Only marked labels or static control text. Never inspect inputs, editable text, or account forms.
  const staticText=control?.closest('form,[data-private-content]') ? '' : control?.textContent?.trim().replace(/\s+/g,' ').slice(0,80);
  const label=explicit || (type==='wishlist'?'Wishlist':type==='add-to-cart'?'Add to bag':type==='product-click'?'View product':staticText || aria.slice(0,80) || 'Page area');
  const page=titleCase(path.startsWith('/collections/') ? path.split('/')[2] : path==='/'?'Homepage':path.split('/')[1] || 'Page');
  const section=el.closest('[data-track-section]')?.getAttribute('data-track-section') || el.closest('[data-home-section]')?.getAttribute('data-home-section') || (el.closest('nav')?'Navigation':el.closest('[data-product-id]')?'Features':'Page');
  return {label,type,href,section,controlId:control?.getAttribute('data-track-control') || `${type}:${href || label}`,breadcrumb:[page,titleCase(section),label] as [string,string,string]};
}
