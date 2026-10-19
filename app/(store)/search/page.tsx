import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchPageView } from '@/features/search/SearchPageView';

export const metadata: Metadata = {
  title: 'Search Jewellery | J&CO. Jewellery',
  description: 'Search our catalog of 14K solid gold flatbacks, huggie hoops, and statement rings.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[13px] text-[#777777]">
          Loading search...
        </div>
      }
    >
      <SearchPageView />
    </Suspense>
  );
}
