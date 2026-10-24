"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { CURRENCIES, MAIN_NAV_ITEMS } from "@/config/site";
import { useStore } from "@/hooks/useStore";
import { CurrencyCode } from "@/types/commerce";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import { PRIVATE_AREAS_ENABLED } from "@/config/features";
import { usePathname } from "next/navigation";
import { useMerchant } from "@/hooks/useMerchant";
import { SaleBanner } from "@/components/shared/SaleBanner";
import { useHomeContent } from "@/features/homepage/home-content";
import { commerceService } from "@/commerce";
import {
  EditorialProduct,
  selectEditorialProducts,
} from "@/features/homepage/EditorialSections";
export function Header() {
  const { data: merchant } = useMerchant(),
    home = useHomeContent(),
    configuration = home.id("header");
  const {
    currency,
    setCurrency,
    itemCount,
    setIsCartDrawerOpen,
    setIsSearchOpen,
    session,
  } = useStore();
  const [open, setOpen] = useState(false),
    [navHover, setNavHover] = useState(false),
    [selected, setSelected] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false),
    [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pathname = usePathname();
  const visible = merchant.menus.filter(
    (m) =>
      !m.hidden &&
      !merchant.categories.find((c) => c.id === m.categoryId)?.hidden,
  );
  const menus = merchant.menuPublished
    ? visible.filter((m) => !m.parentId)
    : MAIN_NAV_ITEMS.map((m, i) => ({ ...m, id: String(i) }));
  const current =
    menus.find((m) => m.id === selected) ||
    menus.find((m) => m.label.toLowerCase() === "rings") ||
    menus[0];
  const children = visible.filter((m) => m.parentId === current?.id);
  const top = configuration.items || [];
  const products = commerceService.catalog.getAllProducts();
  const matches = selectEditorialProducts(
    {
      ...configuration,
      collection:
        configuration.collection && configuration.collection !== "all"
          ? configuration.collection
          : current?.href.split("/").pop(),
    },
    products,
    2,
  );
  const featured = matches.length
    ? matches
    : products.filter((p) => p.isFeatured).slice(0, 2);
  function cancelMenuClose() {
    if (timer.current) clearTimeout(timer.current);
  }
  function closeMenu() {
    cancelMenuClose();
    setOpen(false);
    setNavHover(false);
  }
  function scheduleMenuClose() {
    cancelMenuClose();
    timer.current = setTimeout(closeMenu, 200);
  }
  useEffect(() => {
    setOpen(false);
    setNavHover(false);
    setIsMobileMenuOpen(false);
    setIsCurrencyOpen(false);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        setIsMobileMenuOpen(false);
        setIsCurrencyOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <>
      {open && (
        <button
          className="mega-backdrop"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={closeMenu}
          onPointerEnter={scheduleMenuClose}
        />
      )}
      <header
        className="store-editorial-header sticky top-0 z-40 bg-white border-b border-[#EAE6E4]"
        onPointerEnter={cancelMenuClose}
        onPointerLeave={scheduleMenuClose}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) scheduleMenuClose();
        }}
      >
        <div className="store-header-inner editorial-header-inner">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <Link
              href="/"
              className="brand-wordmark font-serif text-[34px] leading-none"
            >
              J&amp;CO.
            </Link>
          </div>
          <nav
            className="editorial-primary-nav"
            aria-label="Primary store navigation"
            onPointerEnter={() => setNavHover(true)}
            onFocusCapture={() => setNavHover(true)}
          >
            {top.map((item, i) => (
              <Link
                key={item.id}
                href={item.href}
                onPointerEnter={() => {
                  cancelMenuClose();
                  setOpen(i === 0);
                }}
                onFocus={() => {
                  cancelMenuClose();
                  setOpen(i === 0);
                }}
                onClick={closeMenu}
                aria-expanded={i === 0 ? open : undefined}
                aria-controls={i === 0 ? "store-mega-menu" : undefined}
                onKeyDown={(e) => {
                  if (i === 0 && e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLAnchorElement>("#store-mega-menu a")
                        ?.focus(),
                    );
                  }
                }}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          {/* Right: Currency + Search + Account + Bag */}
          <div
            className="flex items-center gap-3.5 sm:gap-5 shrink-0"
            onPointerEnter={closeMenu}
            onFocusCapture={closeMenu}
          >
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen((prev) => !prev)}
                className="flex items-center gap-1 text-[11.5px] text-[#292929] hover:text-[#777777] whitespace-nowrap py-1"
                aria-label="Select currency"
                aria-expanded={isCurrencyOpen}
              >
                <span>{CURRENCIES[currency].label}</span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-[#EAE6E4] shadow-md py-1 z-50">
                  {Object.values(CURRENCIES)
                    .filter((c) => c.code === "BDT")
                    .map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCurrency(c.code as CurrencyCode);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#FAF8F7] flex items-center justify-between ${
                          currency === c.code
                            ? "font-medium text-[#292929] bg-[#FAF8F7]"
                            : "text-[#777777]"
                        }`}
                      >
                        <span>{c.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1 text-[#292929] hover:text-[#777777] transition-colors"
              aria-label="Search store"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            {/* Account Icon */}
            {PRIVATE_AREAS_ENABLED && (
              <Link
                href={session ? "/account" : "/account/login"}
                className="p-1 text-[#292929] hover:text-[#777777] transition-colors relative"
                aria-label={
                  session ? "View your account" : "Log in to your account"
                }
                title={
                  session
                    ? `Logged in as ${session.userId}`
                    : "Log in / Create Account"
                }
              >
                <User className="w-[18px] h-[18px] stroke-[1.5]" />
                {session && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E7A7AA]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )}

            {/* Cart Drawer Icon with Soft Blush Counter */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1 text-[#292929] hover:text-[#777777] transition-colors relative flex items-center"
              aria-label={`Shopping bag with ${itemCount} items`}
            >
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#F6D9D9] text-[#292929] text-[10px] font-medium flex items-center justify-center tabular-nums">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <SaleBanner campaign={merchant.campaign} hovered={navHover || open} />
        {open && (
          <div
            id="store-mega-menu"
            className="editorial-shop-menu"
            onPointerEnter={() => {
              cancelMenuClose();
              setNavHover(true);
            }}
          >
            <nav
              className="editorial-menu-categories"
              aria-label="Shop categories"
            >
              {menus.map((m) => (
                <Link
                  key={m.id}
                  href={m.href}
                  className={current?.id === m.id ? "selected" : ""}
                  onPointerEnter={() => setSelected(m.id)}
                  onFocus={() => setSelected(m.id)}
                  onClick={closeMenu}
                >
                  {m.label}
                </Link>
              ))}
            </nav>
            <nav
              className="editorial-menu-subcategories"
              aria-label={current?.label + " collections"}
            >
              <Link
                href={current?.href || "/collections/shop-all"}
                onClick={closeMenu}
              >
                ALL {current?.label.toUpperCase()}
              </Link>
              {children.map((m) => (
                <Link key={m.id} href={m.href} onClick={closeMenu}>
                  {m.label}
                </Link>
              ))}
              {!children.length &&
                merchant.categories
                  .filter(
                    (c) =>
                      !c.hidden &&
                      c.parentId ===
                        merchant.categories.find((c) =>
                          current?.href.endsWith("/" + c.slug),
                        )?.id &&
                      !!c.parentId,
                  )
                  .map((c) => (
                    <Link
                      key={c.id}
                      href={"/collections/" + c.slug}
                      onClick={closeMenu}
                    >
                      {c.name}
                    </Link>
                  ))}
            </nav>
            <div className="editorial-menu-products" onClick={closeMenu}>
              {featured.map((p) => (
                <EditorialProduct key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        <MobileNavDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>
    </>
  );
}
