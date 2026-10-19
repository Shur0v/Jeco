import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { commerceService } from '@/commerce';
import { CollectionCatalogView } from '@/features/catalog/CollectionCatalogView';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = commerceService.catalog.getCollectionBySlug(slug);
  const title = col
    ? `${col.title} | J&CO. Jewellery`
    : `${slug.toUpperCase()} | J&CO. Jewellery`;
  const description =
    col?.description ||
    'Explore curated everyday luxury demi-fine and 14K solid gold jewellery.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto px-8 py-16 text-center text-[13px] text-[#777777]">
          Loading collection...
        </div>
      }
    >
      <CollectionCatalogView slug={slug} />
    </Suspense>
  );
}
