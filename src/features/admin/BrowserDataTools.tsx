"use client";
import { useRef, useState } from 'react';
import { exportPreviewBackup, importPreviewBackup, resetPreview, validateBackup } from '@/lib/preview-backup';
import { Panel } from './admin-shared';
export function BrowserDataTools(){
  const fileInput=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function run(work:()=>Promise<void>){setBusy(true);setError('');try{await work();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <Panel title="Browser data & backups"><p className="studio-caption">This browser holds your preview records. Export a backup before clearing browser data. Backups contain customer details and uploaded media; keep them private. Import replaces this browser’s data.</p>
    <div className="studio-actions">
      <button type="button" className="studio-button secondary" disabled={busy} onClick={()=>run(async()=>{const backup=await exportPreviewBackup();const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`jco-preview-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);})}>Export complete backup</button>
      <button type="button" className="studio-button secondary" disabled={busy} onClick={()=>fileInput.current?.click()}>Import backup</button><input ref={fileInput} aria-label="Backup file" type="file" accept="application/json,.json" disabled={busy} hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;void run(async()=>{const data=JSON.parse(await file.text());validateBackup(data);if(!confirm('Replace all local preview data with this backup? Export your current data first.'))return;await importPreviewBackup(data);location.reload();});}}/>
      <button type="button" className="studio-button secondary" disabled={busy} onClick={()=>{if(confirm('Reset this browser to the original sample catalog? This removes local orders, customer profiles, uploads and analytics. Export a backup first.'))void run(async()=>{await resetPreview();location.href='/admin?tab=settings';});}}>Reset preview data</button>
    </div>{busy&&<p role="status">Saving browser data…</p>}{error&&<p className="studio-error" role="alert">{error}</p>}
  </Panel>;
}
