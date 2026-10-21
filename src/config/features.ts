// Enable together when the account and merchant areas are ready to launch.
export const PRIVATE_AREAS_ENABLED = false;

export function isPrivateAreaPath(pathname: string): boolean {
  return /^\/(?:admin|account|dashboard)(?:\/|$)/.test(pathname);
}
