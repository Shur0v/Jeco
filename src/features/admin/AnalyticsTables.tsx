"use client";
import { useEffect, useMemo, useState } from 'react';
import { AnalyticsEvent } from '@/lib/merchant-store';
import { activityKey, aggregateActivity, eventBreadcrumb } from '@/lib/analytics';
import { Panel, Pager, SearchBox, exportCsv, Empty } from './admin-shared';
export function AnalyticsTables({events,period}:{events:AnalyticsEvent[];period:string}){
  const [query,setQuery]=useState(''),[type,setType]=useState('all'),[selected,setSelected]=useState(''),[page,setPage]=useState(0),[eventPage,setEventPage]=useState(0);
  useEffect(()=>{setPage(0);setEventPage(0);setSelected('');},[query,type,period]);
  const filtered=useMemo(()=>events.filter(e=>(type==='all'||e.type===type)&&`${e.label} ${e.path} ${eventBreadcrumb(e)} ${e.productId || ''}`.toLowerCase().includes(query.toLowerCase())),[events,query,type]);
  const groups=aggregateActivity(filtered);
  const rows=[...filtered].filter(e=>!selected||activityKey(e)===selected).sort((a,b)=>b.at.localeCompare(a.at));
  return <>
    <Panel title="Button activity" action={<button className="studio-button secondary" onClick={()=>exportCsv('button-activity.csv',[
      ['Button name','Location breadcrumb','Page','Clicks','Known local sessions','Last activity'],...groups.map(g=>[g.event.label,eventBreadcrumb(g.event),g.event.path,g.count,g.sessions.size,g.last])
    ])}>Export filtered activity</button>}>
      <div className="studio-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search button, breadcrumb, page or product ID"/>
        <select aria-label="Interaction type" value={type} onChange={e=>setType(e.target.value)}><option value="all">All interactions</option>{[...new Set(events.map(e=>e.type))].sort().map(t=><option key={t}>{t}</option>)}</select>
      </div>
      <p className="studio-caption">Button location, not browsing history. Session counts cover known local preview sessions only; older events may have unavailable labels.</p>
      <div className="studio-table"><table><thead><tr><th>Button name</th><th>Location breadcrumb</th><th>Page</th><th>Clicks</th><th>Local sessions</th><th>Last activity</th></tr></thead><tbody>
        {groups.slice(page*25,page*25+25).map(g=><tr key={g.key}><td><button className="studio-link" onClick={()=>{setSelected(g.key);setEventPage(0);document.getElementById('interaction-events')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{g.event.label}</button></td><td>{eventBreadcrumb(g.event)}</td><td>{g.event.path}</td><td>{g.count}</td><td>{g.sessions.size || 'Unavailable'}</td><td>{new Date(g.last).toLocaleString('en-GB',{timeZone:'Asia/Dhaka'})}</td></tr>)}
      </tbody></table></div>
      {!groups.length&&<Empty title="Your button activity will appear here" text="Explore the storefront to collect named clicks in this browser."/>}
      <Pager page={page} total={groups.length} size={25} onChange={setPage}/>
    </Panel>
    <div id="interaction-events"><Panel title="Chronological interactions" action={<button className="studio-button secondary" onClick={()=>exportCsv('interaction-events.csv',[
      ['Timestamp','Button name','Breadcrumb','Type','Page','Product ID','Local session'],...rows.map(e=>[e.at,e.label,eventBreadcrumb(e),e.type,e.path,e.productId,e.sessionId])
    ])}>Export filtered events</button>}>
      {selected&&<p className="studio-callout">Showing the selected button. <button className="studio-link" onClick={()=>{setSelected('');setEventPage(0);}}>Show all matching events</button></p>}
      <div className="studio-table"><table><thead><tr><th>Time · Dhaka</th><th>Button name</th><th>Location breadcrumb</th><th>Interaction</th><th>Page</th><th>Product ID</th></tr></thead><tbody>
        {rows.slice(eventPage*25,eventPage*25+25).map(e=><tr key={e.id}><td>{new Date(e.at).toLocaleString('en-GB',{timeZone:'Asia/Dhaka'})}</td><td>{e.label}</td><td>{eventBreadcrumb(e)}</td><td>{e.type}</td><td>{e.path}</td><td>{e.productId || '—'}</td></tr>)}
      </tbody></table></div><Pager page={eventPage} total={rows.length} size={25} onChange={setEventPage}/>
    </Panel></div>
  </>;
}
