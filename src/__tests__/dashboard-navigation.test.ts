import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const route = vi.hoisted(() => ({ href: 'https://example.com/account' }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URL(route.href).searchParams,
}));
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';

describe('dashboard panel navigation', () => {
  let navigate: (tab: 'overview' | 'orders' | 'products') => void;
  let pushState: ReturnType<typeof vi.fn>;
  let reload: ReturnType<typeof vi.fn>;
  function Panel() {
    const [tab, go] = useDashboardNavigation(['overview', 'orders', 'products'] as const, 'overview');
    navigate = go;
    return createElement('section', { 'data-panel': tab }, tab);
  }
  const render = () => renderToStaticMarkup(createElement(Panel));

  beforeEach(() => {
    route.href = 'https://example.com/account?keep=1#summary';
    reload = vi.fn();
    pushState = vi.fn((_state: unknown, _title: string, url: string) => {
      route.href = new URL(url, route.href).href;
      window.location.href = route.href;
    });
    vi.stubGlobal('window', { location: { href: route.href, reload }, history: { pushState } });
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('switches the selected panel and preserves the URL without reloading or fetching', () => {
    expect(render()).toContain('data-panel="overview"');
    navigate!('orders');
    expect(route.href).toBe('https://example.com/account?keep=1&tab=orders#summary');
    expect(render()).toContain('data-panel="orders"');
    expect(pushState).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('renders direct tab links and restored browser-history URLs', () => {
    route.href = 'https://example.com/admin?tab=products';
    expect(render()).toContain('data-panel="products"');
    route.href = 'https://example.com/admin?tab=orders';
    expect(render()).toContain('data-panel="orders"');
    route.href = 'https://example.com/admin?tab=products';
    expect(render()).toContain('data-panel="products"');
    expect(pushState).not.toHaveBeenCalled();
  });
  it('falls back safely for an unknown panel and avoids duplicate history entries', () => {
    route.href = 'https://example.com/account?tab=unknown';
    expect(render()).toContain('data-panel="overview"');
    navigate!('overview');
    expect(pushState).not.toHaveBeenCalled();
  });
});
