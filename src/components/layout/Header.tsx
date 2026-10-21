"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { CURRENCIES, MAIN_NAV_ITEMS } from "@/config/site";
import { useStore } from "@/hooks/useStore";
import { CurrencyCode } from "@/types/commerce";
import { MegaMenu } from "@/components/navigation/MegaMenu";
import { MobileNavDrawer } from "@/components/navigation/MobileNavDrawer";
import { PRIVATE_AREAS_ENABLED } from "@/config/features";
import { usePathname } from "next/navigation";

export function Header() {
  const {
    currency,
    setCurrency,
    itemCount,
    setIsCartDrawerOpen,
    setIsSearchOpen,
    session,
  } = useStore();

  const [activeMegaMenu, setActiveMegaMenu] = useState<
    "shop" | "14k-gold" | "earrings" | null
  >(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  function cancelMenuClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
  function closeMenu() {
    cancelMenuClose();
    setActiveMegaMenu(null);
  }
  function scheduleMenuClose() {
    cancelMenuClose();
    closeTimer.current = setTimeout(() => setActiveMegaMenu(null), 180);
  }
  useEffect(() => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    setIsCurrencyOpen(false);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleResize = () => {
      if (!desktop.matches) setActiveMegaMenu(null);
      else setIsMobileMenuOpen(false);
    };
    desktop.addEventListener("change", handleResize);
    return () => desktop.removeEventListener("change", handleResize);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMegaMenu(null);
        setIsCurrencyOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {activeMegaMenu && (
        <button
          className="mega-backdrop"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={closeMenu}
          onPointerEnter={scheduleMenuClose}
        />
      )}
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#EAE6E4]"
        onPointerEnter={cancelMenuClose}
        onPointerLeave={scheduleMenuClose}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            scheduleMenuClose();
        }}
      >
        <div className="store-header-inner mx-auto px-4 sm:px-6 lg:px-[60px] h-[68px] flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger + Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#292929] hover:text-[#777777]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>

            <Link
              href="/"
              className="brand-wordmark font-serif text-[30px] sm:text-[34px] tracking-[-0.02em] text-[#292929] whitespace-nowrap shrink-0 leading-none"
            >
              J&amp;CO.
            </Link>
          </div>

          {/* Center: Desktop Single-Line Navigation Links */}
          <nav
            className="hidden lg:flex flex-1 min-w-0 ml-5 items-center gap-5 xl:gap-8 overflow-x-auto no-scrollbar py-2 mask-fade-right"
            aria-label="Primary store navigation"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const hasMega = Boolean(item.megaMenuType);
              const isActive = hasMega && activeMegaMenu === item.megaMenuType;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onPointerEnter={() => {
                    cancelMenuClose();
                    setActiveMegaMenu(item.megaMenuType || null);
                  }}
                  onFocus={() => {
                    cancelMenuClose();
                    setActiveMegaMenu(item.megaMenuType || null);
                  }}
                  onClick={closeMenu}
                  onKeyDown={(event) => {
                    if (hasMega && event.key === "ArrowDown") {
                      event.preventDefault();
                      cancelMenuClose();
                      setActiveMegaMenu(item.megaMenuType || null);
                      requestAnimationFrame(() =>
                        document
                          .querySelector<HTMLAnchorElement>(
                            "#store-mega-menu a",
                          )
                          ?.focus(),
                      );
                    }
                  }}
                  aria-expanded={hasMega ? isActive : undefined}
                  aria-controls={hasMega ? "store-mega-menu" : undefined}
                  className={`text-[13px] whitespace-nowrap shrink-0 transition-colors py-1 border-b ${
                    isActive
                      ? "text-[#292929] border-[#292929] font-medium"
                      : "text-[#292929] border-transparent hover:text-[#777777]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
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
                  {Object.values(CURRENCIES).map((c) => (
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

        {/* Desktop Mega Menu */}
        <MegaMenu activeMenu={activeMegaMenu} onClose={closeMenu} />

        {/* Mobile Navigation Drawer */}
        <MobileNavDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>
    </>
  );
}
