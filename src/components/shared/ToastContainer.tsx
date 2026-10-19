'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export function ToastContainer() {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 bg-[#292929] text-white px-4 py-3 text-[12.5px] shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <CheckCircle2 className="w-4 h-4 text-[#F6D9D9] shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
