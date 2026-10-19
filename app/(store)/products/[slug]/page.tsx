import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { commerceService } from '@/commerce';
import { ProductDetailView } from '@/features/product/ProductDetailView';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = commerceService.catalog.getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Product Not Found | J&CO. Jewellery',
    };
  }

  return {
    title: `${product.name} | J&CO. Jewellery`,
    description: product.description,
    openGraph: {
      title: `${product.name} | J&CO. Jewellery`,
      description: product.description,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = commerceService.catalog.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name} (Demo Item)`,
    description: product.description,
    sku: product.variants[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'J&CO. Jewellery (Demo)',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
