"use client";
import { useSyncExternalStore } from 'react';
import { shopperStatus, subscribeShopper } from '@/lib/shopper-storage';
const serverStatus={pending:0,error:'',savedAt:''};
export function BrowserSaveStatus(){
  const state=useSyncExternalStore(subscribeShopper,shopperStatus,()=>serverStatus);
  if(!state.pending&&!state.error)return null;
  return <div role={state.error?'alert':'status'} className="fixed bottom-4 left-4 z-[100] max-w-sm rounded-xl border bg-white px-4 py-3 text-sm shadow-lg">{state.error || 'Saving changes in this browser…'}</div>;
}
