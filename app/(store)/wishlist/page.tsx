import type { Metadata } from 'next';
import { WishlistView } from '@/features/wishlist/WishlistView';

export const metadata: Metadata = {
  title: 'My Wishlist | J&CO. Jewellery',
  description: 'View and manage your saved J&CO. Jewellery pieces.',
};

export default function WishlistPage() {
  return <WishlistView />;
}
