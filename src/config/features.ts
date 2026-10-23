// Mock account and merchant dashboard previews are enabled together.
export const PRIVATE_AREAS_ENABLED = true;

export function isPrivateAreaPath(pathname: string): boolean {
  return /^\/(?:admin|account|dashboard)(?:\/|$)/.test(pathname);
}
