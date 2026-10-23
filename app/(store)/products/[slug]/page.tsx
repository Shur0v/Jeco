import type {Metadata} from 'next';
import {LocalProductRoute} from '@/features/product/LocalProductRoute';
import {commerceService} from '@/commerce';
interface Props {params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const product=commerceService.catalog.getProductBySlug(slug);return{title:`${product?.name||'Jewellery'} | J&CO. Jewellery`,description:product?.description};}
export default async function ProductPage({params}:Props){const {slug}=await params;return <LocalProductRoute slug={slug}/>;}
