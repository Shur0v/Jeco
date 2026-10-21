import { AdminDashboard } from '@/features/admin/AdminDashboard';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Store Admin | J&CO. Jewellery', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminDashboard/>; }
