import { ICommerceService } from '@/commerce/contracts';
import { mockCommerceAdapter } from '@/commerce/adapters/mock';

export function createCommerceService(): ICommerceService {
  return mockCommerceAdapter;
}
