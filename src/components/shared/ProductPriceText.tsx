/** Enlarge only the numeric portion; currency, formatting and surrounding type stay unchanged. */
export function ProductPriceText({ children }: { children: string }) {
  const match = /[0-9][0-9,.]*/.exec(children);
  if (!match) return <>{children}</>;
  return <>{children.slice(0, match.index)}<span data-product-price-number style={{fontSize:"calc(1em + 4px)",display:"inline",lineHeight:"inherit",fontWeight:"inherit"}}>{match[0]}</span>{children.slice(match.index + match[0].length)}</>;
}
