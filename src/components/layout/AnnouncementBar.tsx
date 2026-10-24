'use client';

import React, { useEffect, useState } from 'react';
import { SITE_CONFIG } from '@/config/site';
import {useMerchant} from '@/hooks/useMerchant';

export function AnnouncementBar() {
  const {data}=useMerchant();
  const [msgIndex, setMsgIndex] = useState(0);

  return (
    <div
      className="w-full bg-[#292929] text-white text-[11.5px] tracking-[0.03em] py-2 px-4 flex items-center justify-center select-none cursor-pointer transition-colors hover:bg-[#1f1f1f]"
      onClick={() =>
        setMsgIndex((prev) => (prev + 1) % SITE_CONFIG.announcementMessages.length)
      }
      role="region"
      aria-label="Promotional announcement"
      title="Click to view next store offer"
    >
      <p className="text-center font-normal truncate">
        {msgIndex===0?data.settings.announcement:SITE_CONFIG.announcementMessages[msgIndex]}
      </p>
    </div>
  );
}
