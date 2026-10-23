"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CartItem,
  CurrencyCode,
  DemoOrder,
  DemoUserSession,
  MetalFinish,
  Product,
  PromoCode,
  Review,
} from "@/types/commerce";
import { commerceService } from "@/commerce";
import { SITE_CONFIG } from "@/config/site";
import { hydrateCatalog } from "@/lib/admin-catalog";
import { useMerchant } from "@/hooks/useMerchant";
import {
  initMerchant,
  subscribeMerchant,
  getMerchant,
} from "@/lib/merchant-store";
import { PRIVATE_AREAS_ENABLED } from "@/config/features";
import { getProductStudioSvg } from "@/lib/artwork";

const STORAGE_KEYS = {
  CART: "jco_demo_cart_v1",
  WISHLIST: "jco_demo_wishlist_v1",
  RECENT: "jco_demo_recent_v1",
  SESSION: "jco_demo_auth_session_v1",
  ORDERS: "jco_demo_orders_v1",
  CURRENCY: "jco_demo_currency_v1",
  REVIEWS: "jco_demo_custom_reviews_v1",
  NEWSLETTER: "jco_demo_newsletter_v1",
};

interface RegisterPayload {
  firstName: string;
  lastName: string;
  birthDate?: string;
  email: string;
  password: string;
}

interface StoreContextValue {
  isHydrated: boolean;
  // Currency
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  // Cart
  cartItems: CartItem[];
  itemCount: number;
  subtotal: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  freeGiftRemaining: number;
  freeGiftProgress: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    options?: {
      finish?: MetalFinish;
      size?: string;
      quantity?: number;
      openDrawer?: boolean;
      giftNote?: string;
    },
  ) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  // Promo
  appliedPromo: PromoCode | null;
  discountAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Recently Viewed
  recentlyViewedIds: string[];
  trackProductView: (productId: string) => void;
  // Demo Auth
  session: DemoUserSession | null;
  loginDemo: (
    userIdOrEmail: string,
    password: string,
  ) => { success: boolean; error?: string };
  registerDemo: (payload: RegisterPayload) => {
    success: boolean;
    error?: string;
  };
  updateDemoProfile: (updates: Partial<DemoUserSession>) => void;
  logoutDemo: () => void;
  // Demo Orders
  orders: DemoOrder[];
  recordDemoOrder: (order: DemoOrder) => void;
  updateOrderStatus: (id: string, status: DemoOrder["status"]) => void;
  // Custom Reviews
  customReviews: Review[];
  addCustomReview: (
    review: Omit<Review, "id" | "date" | "helpfulCount">,
  ) => void;
  // Search & UI
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toast: { id: number; message: string } | null;
  showToast: (message: string) => void;
  // Newsletter
  subscribedEmails: string[];
  subscribeNewsletter: (email: string) => boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function getDefaultInitialCart(): CartItem[] {
  const domeHuggie = commerceService.catalog.getProductById(
    "prod-dome-huggie-hoop",
  );
  if (!domeHuggie) return [];
  const goldVariant = domeHuggie.variants[0];
  return [
    {
      id: `${domeHuggie.id}__${goldVariant.id}`,
      productId: domeHuggie.id,
      variantId: goldVariant.id,
      slug: domeHuggie.slug,
      name: domeHuggie.name,
      finish: goldVariant.finish,
      size: goldVariant.size,
      price: goldVariant.price,
      compareAtPrice: goldVariant.compareAtPrice,
      quantity: 1,
      image: domeHuggie.images[0],
      maxStock: goldVariant.stockCount,
    },
  ];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { data: merchant } = useMerchant();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currency, setCurrencyState] = useState<CurrencyCode>("BDT");
  const [cartItems, setCartItems] = useState<CartItem[]>(getDefaultInitialCart);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    "prod-14k-pave-cz-heart-flatback",
    "prod-sparkle-heart-dome-gold-ring",
  ]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([
    "prod-dome-huggie-hoop",
  ]);
  const [session, setSession] = useState<DemoUserSession | null>(null);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [customReviews, setCustomReviews] = useState<Review[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  useEffect(() => {
    if (!isHydrated || !session) return;
    try {
      const profiles = JSON.parse(
        localStorage.getItem("jco_demo_profiles_v1") || "{}",
      );
      profiles[session.userId.toLowerCase()] = {
        ...profiles[session.userId.toLowerCase()],
        ...session,
        wishlistIds,
      };
      localStorage.setItem("jco_demo_profiles_v1", JSON.stringify(profiles));
    } catch {}
  }, [wishlistIds, session, isHydrated]);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    const unsub = subscribeMerchant(() => {
      setOrders((prev) => [
        ...getMerchant().orders,
        ...prev.filter((o) => !getMerchant().orders.some((n) => n.id === o.id)),
      ]);
    });
    initMerchant().catch(() =>
      showToast("Browser storage is unavailable. Changes cannot be saved."),
    );
    return unsub;
  }, [showToast]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        hydrateCatalog();
        const savedCart = window.localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          const old = JSON.parse(savedCart) as CartItem[];
          setCartItems(
            old.flatMap((item) => {
              const p = commerceService.catalog.getProductById(item.productId);
              const v = p?.variants.find((v) => v.id === item.variantId);
              return p && v
                ? [
                    {
                      ...item,
                      price: v.price,
                      compareAtPrice: v.compareAtPrice,
                      maxStock: v.stockCount,
                    },
                  ]
                : [];
            }),
          );
        } else {
          window.localStorage.setItem(
            STORAGE_KEYS.CART,
            JSON.stringify(getDefaultInitialCart()),
          );
        }

        const savedWishlist = window.localStorage.getItem(
          STORAGE_KEYS.WISHLIST,
        );
        if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

        const savedRecent = window.localStorage.getItem(STORAGE_KEYS.RECENT);
        if (savedRecent) setRecentlyViewedIds(JSON.parse(savedRecent));

        const savedSession = window.localStorage.getItem(STORAGE_KEYS.SESSION);
        if (savedSession && PRIVATE_AREAS_ENABLED)
          setSession(JSON.parse(savedSession));

        const savedOrders = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedCurrency = window.localStorage.getItem(
          STORAGE_KEYS.CURRENCY,
        );
        if (savedCurrency) setCurrencyState("BDT");

        const savedReviews = window.localStorage.getItem(STORAGE_KEYS.REVIEWS);
        if (savedReviews) setCustomReviews(JSON.parse(savedReviews));

        const savedNewsletter = window.localStorage.getItem(
          STORAGE_KEYS.NEWSLETTER,
        );
        if (savedNewsletter) setSubscribedEmails(JSON.parse(savedNewsletter));
      } catch {
        // Ignore storage access errors in restricted environments
      } finally {
        setIsHydrated(true);
      }
    });
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState("BDT");
    try {
      window.localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
    } catch {}
  }, []);

  const persistCart = useCallback((next: CartItem[]) => {
    setCartItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(next));
    } catch {}
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      options?: {
        finish?: MetalFinish;
        size?: string;
        quantity?: number;
        openDrawer?: boolean;
        giftNote?: string;
      },
    ) => {
      const targetFinish = options?.finish || product.availableFinishes[0];
      const targetSize = options?.size;
      const qtyToAdd = Math.max(1, options?.quantity || 1);

      const matchedVariant =
        product.variants.find(
          (v) =>
            v.finish === targetFinish && (!targetSize || v.size === targetSize),
        ) || product.variants[0];

      if (!matchedVariant || !matchedVariant.inStock || !product.inStock) {
        showToast("Selected item is currently sold out.");
        return;
      }

      const cartItemId = `${product.id}__${matchedVariant.id}`;
      const finishImage = getProductStudioSvg(
        product.visualSpec,
        matchedVariant.finish,
        0,
      );

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === cartItemId);
        let updated: CartItem[];
        if (existingIndex > -1) {
          updated = prev.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  quantity: Math.min(item.maxStock, item.quantity + qtyToAdd),
                }
              : item,
          );
        } else {
          updated = [
            ...prev,
            {
              id: cartItemId,
              productId: product.id,
              variantId: matchedVariant.id,
              slug: product.slug,
              name: product.name,
              finish: matchedVariant.finish,
              size: matchedVariant.size,
              price: matchedVariant.price,
              compareAtPrice: matchedVariant.compareAtPrice,
              quantity: qtyToAdd,
              image: finishImage,
              maxStock: matchedVariant.stockCount || 20,
              giftNote: options?.giftNote,
            },
          ];
        }
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.CART,
            JSON.stringify(updated),
          );
        } catch {}
        return updated;
      });

      if (options?.openDrawer !== false) {
        setIsCartDrawerOpen(true);
      } else {
        showToast(`Added ${product.name} to your bag`);
      }
    },
    [showToast],
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        const filtered = cartItems.filter((item) => item.id !== cartItemId);
        persistCart(filtered);
        return;
      }
      const next = cartItems.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: Math.min(item.maxStock, quantity) }
          : item,
      );
      persistCart(next);
    },
    [cartItems, persistCart],
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      const next = cartItems.filter((item) => item.id !== cartItemId);
      persistCart(next);
      showToast("Removed item from bag");
    },
    [cartItems, persistCart, showToast],
  );

  const clearCart = useCallback(() => {
    persistCart([]);
    setAppliedPromo(null);
  }, [persistCart]);

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      Number(
        cartItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2),
      ),
    [cartItems],
  );

  const freeShippingRemaining = useMemo(
    () =>
      Math.max(
        0,
        Number((merchant.settings.freeShipping - subtotal).toFixed(2)),
      ),
    [subtotal, merchant.settings],
  );

  const freeShippingProgress = useMemo(
    () =>
      Math.min(
        100,
        Math.round((subtotal / merchant.settings.freeShipping) * 100),
      ),
    [subtotal, merchant.settings],
  );

  const freeGiftRemaining = useMemo(
    () =>
      Math.max(0, Number((merchant.settings.freeGift - subtotal).toFixed(2))),
    [subtotal, merchant.settings],
  );

  const freeGiftProgress = useMemo(
    () =>
      Math.min(100, Math.round((subtotal / merchant.settings.freeGift) * 100)),
    [subtotal, merchant.settings],
  );

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    const check = commerceService.promotions.validatePromoCode(
      appliedPromo.code,
      subtotal,
      cartItems,
    );
    return check.valid ? check.discountAmount : 0;
  }, [appliedPromo, subtotal, cartItems, merchant]);

  const applyPromoCode = useCallback(
    (code: string) => {
      const res = commerceService.promotions.validatePromoCode(
        code,
        subtotal,
        cartItems,
      );
      if (!res.valid || !res.promo) {
        return {
          success: false,
          message: res.errorMessage || "Invalid promo code",
        };
      }
      setAppliedPromo(res.promo);
      return {
        success: true,
        message: `Applied ${res.promo.code} (${res.promo.description})`,
      };
    },
    [subtotal, cartItems, merchant],
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        const next = exists
          ? prev.filter((id) => id !== productId)
          : [productId, ...prev];
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.WISHLIST,
            JSON.stringify(next),
          );
        } catch {}
        showToast(
          exists ? "Removed from your wishlist" : "Saved to your wishlist",
        );
        return next;
      });
    },
    [showToast],
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const trackProductView = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const next = [productId, ...filtered].slice(0, 8);
      try {
        window.localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // CRITICAL: Permissive Demo Login — ANY non-empty user ID/email and ANY non-empty password succeeds
  // Never store, log, or transmit the password!
  const loginDemo = useCallback(
    (userIdOrEmail: string, password: string) => {
      const trimmedId = userIdOrEmail.trim();
      const trimmedPass = password.trim();
      if (!trimmedId || !trimmedPass) {
        return {
          success: false,
          error: "Please enter both a User ID / Email and a Password.",
        };
      }

      const namePart = trimmedId.includes("@")
        ? trimmedId.split("@")[0]
        : trimmedId;
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      let profile: Partial<DemoUserSession> & { wishlistIds?: string[] } = {};
      try {
        profile =
          JSON.parse(
            window.localStorage.getItem("jco_demo_profiles_v1") || "{}",
          )[trimmedId.toLowerCase()] || {};
      } catch {}

      const newSession: DemoUserSession = {
        userId: trimmedId,
        email: trimmedId,
        firstName: profile.firstName || capitalized,
        lastName: profile.lastName || "Member",
        birthDate: profile.birthDate,
        phone: profile.phone,
        defaultAddress: profile.defaultAddress,
        loggedInAt: new Date().toISOString(),
        isDemoSession: true,
      };

      setSession(newSession);
      if (profile.wishlistIds) setWishlistIds(profile.wishlistIds);
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify(newSession),
        );
      } catch {}
      showToast(`Signed in to demo account as ${trimmedId}`);
      return { success: true };
    },
    [showToast],
  );

  const registerDemo = useCallback(
    (payload: RegisterPayload) => {
      const trimmedEmail = payload.email.trim();
      const trimmedPassword = payload.password.trim();
      if (!trimmedEmail || !trimmedPassword || !payload.firstName.trim()) {
        return {
          success: false,
          error: "Please fill in all required fields.",
        };
      }

      // Never store or log payload.password
      const newSession: DemoUserSession = {
        userId: trimmedEmail,
        email: trimmedEmail,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        birthDate: payload.birthDate,
        loggedInAt: new Date().toISOString(),
        isDemoSession: true,
      };

      setSession(newSession);
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify(newSession),
        );
      } catch {}
      showToast(`Welcome to J&CO. Jewels, ${newSession.firstName}!`);
      try {
        const profiles = JSON.parse(
          window.localStorage.getItem("jco_demo_profiles_v1") || "{}",
        );
        profiles[newSession.userId.toLowerCase()] = newSession;
        window.localStorage.setItem(
          "jco_demo_profiles_v1",
          JSON.stringify(profiles),
        );
      } catch {}
      return { success: true };
    },
    [showToast],
  );

  const updateDemoProfile = useCallback(
    (updates: Partial<DemoUserSession>) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updates };
        try {
          const profiles = JSON.parse(
            window.localStorage.getItem("jco_demo_profiles_v1") || "{}",
          );
          profiles[next.userId.toLowerCase()] = next;
          window.localStorage.setItem(
            "jco_demo_profiles_v1",
            JSON.stringify(profiles),
          );
          window.localStorage.setItem(
            STORAGE_KEYS.SESSION,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
      showToast("Demo profile updated");
    },
    [showToast],
  );

  const logoutDemo = useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {}
    showToast("Signed out of demo session");
  }, [showToast]);

  const updateOrderStatus = useCallback(
    (id: string, status: DemoOrder["status"]) => {
      setOrders((prev) => {
        const next = prev.map((order) =>
          order.id === id ? { ...order, status } : order,
        );
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.ORDERS,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
      showToast("Order status updated");
    },
    [showToast],
  );

  const recordDemoOrder = useCallback((order: DemoOrder) => {
    setOrders((prev) => {
      if (prev.some((o) => o.orderNumber === order.orderNumber)) {
        return prev;
      }
      const next = [order, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addCustomReview = useCallback(
    (reviewInput: Omit<Review, "id" | "date" | "helpfulCount">) => {
      const now = new Date();
      const dateStr = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
        now.getDate(),
      ).padStart(2, "0")}/${now.getFullYear()}`;
      const newReview: Review = {
        ...reviewInput,
        id: `demo-rev-${Date.now()}`,
        date: dateStr,
        helpfulCount: 1,
      };
      setCustomReviews((prev) => {
        const next = [newReview, ...prev];
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.REVIEWS,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
      showToast("Thank you! Your demo review has been added.");
    },
    [showToast],
  );

  const subscribeNewsletter = useCallback(
    (email: string) => {
      const clean = email.trim().toLowerCase();
      if (!clean || !clean.includes("@")) return false;
      setSubscribedEmails((prev) => {
        const next = prev.includes(clean) ? prev : [...prev, clean];
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.NEWSLETTER,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
      showToast("Subscribed to J&CO. Jewels exclusive updates (Demo)");
      return true;
    },
    [showToast],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      isHydrated,
      currency,
      setCurrency,
      cartItems,
      itemCount,
      subtotal,
      freeShippingRemaining,
      freeShippingProgress,
      freeGiftRemaining,
      freeGiftProgress,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      appliedPromo,
      discountAmount,
      applyPromoCode,
      removePromoCode,
      wishlistIds,
      toggleWishlist,
      isInWishlist,
      recentlyViewedIds,
      trackProductView,
      session,
      loginDemo,
      registerDemo,
      updateDemoProfile,
      logoutDemo,
      orders,
      recordDemoOrder,
      updateOrderStatus,
      customReviews,
      addCustomReview,
      isSearchOpen,
      setIsSearchOpen,
      toast,
      showToast,
      subscribedEmails,
      subscribeNewsletter,
    }),
    [
      isHydrated,
      currency,
      setCurrency,
      cartItems,
      itemCount,
      subtotal,
      freeShippingRemaining,
      freeShippingProgress,
      freeGiftRemaining,
      freeGiftProgress,
      isCartDrawerOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      appliedPromo,
      discountAmount,
      applyPromoCode,
      removePromoCode,
      wishlistIds,
      toggleWishlist,
      isInWishlist,
      recentlyViewedIds,
      trackProductView,
      session,
      loginDemo,
      registerDemo,
      updateDemoProfile,
      logoutDemo,
      orders,
      recordDemoOrder,
      updateOrderStatus,
      customReviews,
      addCustomReview,
      isSearchOpen,
      toast,
      showToast,
      subscribedEmails,
      subscribeNewsletter,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
