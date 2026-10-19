import React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#777777] mb-2">
          404 · PAGE NOT FOUND
        </p>
        <h1 className="font-serif text-[32px] sm:text-[40px] text-[#292929] mb-4">
          We couldn&apos;t find the piece you were looking for.
        </h1>
        <p className="text-[13.5px] text-[#777777] max-w-md mb-8">
          Explore our curated everyday flatbacks, signature dome huggies, or
          statement rings below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/collections/shop-all"
            className="bg-[#E7A7AA] hover:bg-[#dc9599] text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors"
          >
            Shop All Jewellery
          </Link>
          <Link
            href="/"
            className="border border-[#292929] text-[#292929] hover:bg-[#292929] hover:text-white text-[11.5px] tracking-[0.14em] uppercase font-medium px-8 py-3.5 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
