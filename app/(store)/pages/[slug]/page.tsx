import { InformationView } from '@/features/information/InformationView';
import { notFound } from 'next/navigation';
import { INFORMATION_PAGES } from '@/features/information/content';
export function generateStaticParams() { return Object.keys(INFORMATION_PAGES).map(slug=>({slug})); }
export default async function InformationPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params;if(!INFORMATION_PAGES[slug])notFound();return <InformationView slug={slug}/>; }
