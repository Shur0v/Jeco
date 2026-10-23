"use client";

import React from "react";
import Link from "next/link";
import {
  SHOP_MEGA_MENU,
  GOLD_14K_MEGA_MENU,
  EARRINGS_MEGA_MENU,
} from "@/config/site";
import { getEditorialBannerSvg } from "@/lib/artwork";

function FestivalSaleOffer({ onClose }: { onClose: () => void }) {
  return (
    <Link
      href="/collections/festival-sale"
      onClick={onClose}
      className="festival-menu-offer"
    >
      <strong>Festival Sale</strong>
      <span>Discover selected jewellery offers</span>
      <span className="festival-menu-cta">Shop sale →</span>
    </Link>
  );
}

interface MegaMenuProps {
  activeMenu: "shop" | "14k-gold" | "earrings" | null;
  onClose: () => void;
}

export function MegaMenu({ activeMenu, onClose }: MegaMenuProps) {
  if (!activeMenu) return null;

  const demiFineImage = getEditorialBannerSvg("demi-fine");
  const luxury14kImage = getEditorialBannerSvg("luxury-14k");
  const menu = activeMenu === "earrings" ? EARRINGS_MEGA_MENU : SHOP_MEGA_MENU;

  if (activeMenu === "14k-gold") {
    return (
      <div
        className="mega-panel absolute top-full left-0 w-full bg-white border-b border-[#EAE6E4] shadow-[0_14px_30px_rgba(0,0,0,0.04)] z-50 animate-in fade-in duration-150"
        id="store-mega-menu"
        role="region"
        aria-label="14K Gold Mega Menu"
      >
        <div className="w-full mx-auto px-8 lg:px-12 py-10 grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              BY CATEGORY
            </h3>
            <ul className="space-y-3">
              {GOLD_14K_MEGA_MENU.byCategory.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-3">
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              BY COLLECTION
            </h3>
            <ul className="space-y-3">
              {GOLD_14K_MEGA_MENU.byCollection.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-3">
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              BY MATERIAL
            </h3>
            <ul className="space-y-3">
              {GOLD_14K_MEGA_MENU.byMaterial.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mega-panel absolute top-full left-0 w-full bg-white border-b border-[#EAE6E4] shadow-[0_14px_30px_rgba(0,0,0,0.04)] z-50 animate-in fade-in duration-150"
      id="store-mega-menu"
      role="region"
      aria-label={
        activeMenu === "earrings" ? "Earrings Mega Menu" : "Shop Mega Menu"
      }
    >
      <div className="w-full mx-auto px-8 lg:px-12 py-8 grid grid-cols-12 gap-8 items-start">
        {/* Left Navigation Columns */}
        <div className="col-span-7 grid grid-cols-4 gap-6 pt-2">
          <div>
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              DISCOVER
            </h3>
            <ul className="space-y-3">
              {menu.discover.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              BY CATEGORY
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-3">
                {menu.byCategoryCol1.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {menu.byCategoryCol2.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#292929] mb-5">
              BY MATERIAL
            </h3>
            <ul className="space-y-3">
              {menu.byMaterial.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-[13.5px] text-[#292929] hover:text-[#777777] transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Editorial Feature Visuals (Matching Screenshot 9) */}
        <div className="col-span-5 grid grid-cols-2 gap-2">
          <Link
            href="/collections/gold-filled"
            onClick={onClose}
            className="group relative aspect-[4/5] bg-[#F6F6F6] overflow-hidden block"
          >
            <img
              src={demiFineImage}
              alt="Demi-Fine Jewellery Collection"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 py-3 bg-gradient-to-t from-black/35 to-transparent text-center">
              <span className="text-[12px] tracking-[0.16em] uppercase text-white font-medium">
                DEMI-FINE
              </span>
            </div>
          </Link>

          <Link
            href="/collections/14k-gold"
            onClick={onClose}
            className="group relative aspect-[4/5] bg-[#F5F2EE] overflow-hidden block"
          >
            <img
              src={luxury14kImage}
              alt="Luxury 14K Solid Gold Collection"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 py-3 bg-gradient-to-t from-black/25 to-transparent text-center">
              <span className="text-[12px] tracking-[0.16em] uppercase text-[#292929] font-medium">
                LUXURY
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
