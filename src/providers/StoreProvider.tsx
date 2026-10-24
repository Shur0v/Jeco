"use client";
import { BrowserSaveStatus } from "@/components/shared/BrowserSaveStatus";
import { initShopper, flushShopper, shopperStorage, subscribeShopper, shopperStatus } from "@/lib/shopper-storage";

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
  ) => Promise<{ success: boolean; error?: string }>;
  registerDemo: (payload: RegisterPayload) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateDemoProfile: (updates: Partial<DemoUserSession>) => Promise<boolean>;
  logoutDemo: () => void;
  // Demo Orders
  orders: DemoOrder[];
  recordDemoOrder: (order: DemoOrder) => void;
  updateOrderStatus: (id: string, status: DemoOrder["status"]) => void;
  // Custom Reviews
  customReviews: Review[];
  addCustomReview: (
    review: Omit<Review, "id" | "date" | "helpfulCount">,
  ) => Promise<boolean>;
  // Search & UI
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toast: { id: number; message: string } | null;
  showToast: (message: string) => void;
  // Newsletter
  subscribedEmails: string[];
  subscribeNewsletter: (email: string) => Promise<boolean>;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
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
        shopperStorage.getItem("jco_demo_profiles_v1") || "{}",
      );
      profiles[session.userId.toLowerCase()] = {
        ...profiles[session.userId.toLowerCase()],
        ...session,
        wishlistIds,
      };
      shopperStorage.setItem("jco_demo_profiles_v1", JSON.stringify(profiles));
    } catch {}
  }, [wishlistIds, session, isHydrated]);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    const unsub = subscribeMerchant((kind) => {
      if(kind === "events")return;
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

  // Hydrate shared IndexedDB records before enabling shopper workflows.
  useEffect(() => {
    void initMerchant().then(() => initShopper()).then(() => {
      try {
        hydrateCatalog();
        const savedCart = shopperStorage.getItem(STORAGE_KEYS.CART);
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
          shopperStorage.setItem(
            STORAGE_KEYS.CART,
            JSON.stringify([]),
          );
        }

        const savedWishlist = shopperStorage.getItem(
          STORAGE_KEYS.WISHLIST,
        );
        if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

        const savedRecent = shopperStorage.getItem(STORAGE_KEYS.RECENT);
        if (savedRecent) setRecentlyViewedIds(JSON.parse(savedRecent));

        const savedSession = shopperStorage.getItem(STORAGE_KEYS.SESSION);
        if (savedSession && PRIVATE_AREAS_ENABLED)
          setSession(JSON.parse(savedSession));

        const savedOrders = shopperStorage.getItem(STORAGE_KEYS.ORDERS);
        setOrders(getMerchant().orders);

        const savedCurrency = shopperStorage.getItem(
          STORAGE_KEYS.CURRENCY,
        );
        if (savedCurrency) setCurrencyState("BDT");

        const savedReviews = shopperStorage.getItem(STORAGE_KEYS.REVIEWS);
        if (savedReviews) setCustomReviews(JSON.parse(savedReviews));

        const savedNewsletter = shopperStorage.getItem(
          STORAGE_KEYS.NEWSLETTER,
        );
        if (savedNewsletter) setSubscribedEmails(JSON.parse(savedNewsletter));
      } catch {
        // Ignore storage access errors in restricted environments
      } finally {
        setIsHydrated(true);
      }
    }).catch(() => showToast("Browser data could not load. Refresh to retry; existing data was retained."));
  }, [showToast]);

  useEffect(() => {
    const apply = () => {
      const status = shopperStatus();
      if (status.error) showToast(status.error);
      if (status.pending) return;
      try {
        const load = (key: string, fallback: unknown) => JSON.parse(shopperStorage.getItem(key) || JSON.stringify(fallback));
        setWishlistIds(prev => { const next=load(STORAGE_KEYS.WISHLIST,prev); return JSON.stringify(prev)===JSON.stringify(next)?prev:next; });
        setRecentlyViewedIds(prev => { const next=load(STORAGE_KEYS.RECENT,prev); return JSON.stringify(prev)===JSON.stringify(next)?prev:next; });
        setCustomReviews(prev => { const next=load(STORAGE_KEYS.REVIEWS,prev); return JSON.stringify(prev)===JSON.stringify(next)?prev:next; });
        setSubscribedEmails(prev => { const next=load(STORAGE_KEYS.NEWSLETTER,prev); return JSON.stringify(prev)===JSON.stringify(next)?prev:next; });
        setCartItems(prev => { const next=load(STORAGE_KEYS.CART,prev); return JSON.stringify(prev)===JSON.stringify(next)?prev:next; });
        const activeSession=shopperStorage.getItem(STORAGE_KEYS.SESSION);
        setSession(prev=>{const next=activeSession?JSON.parse(activeSession):null;return JSON.stringify(prev)===JSON.stringify(next)?prev:next;});
      } catch { showToast("Saved browser data could not be read."); }
    };
    const unsubscribe = subscribeShopper(apply);
    const error = (event: Event) => showToast((event as CustomEvent<string>).detail);
    window.addEventListener('jco:storage-error',error);
    return () => { unsubscribe(); window.removeEventListener('jco:storage-error',error); };
  }, [showToast]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState("BDT");
    try {
      shopperStorage.setItem(STORAGE_KEYS.CURRENCY, code);
    } catch {}
  }, []);

  const persistCart = useCallback((next: CartItem[]) => {
    setCartItems(next);
    try {
      shopperStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(next));
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
      const finishImage = product.images[matchedVariant.imageIndex || 0] || getProductStudioSvg(
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
              quantity: Math.min(qtyToAdd, matchedVariant.stockCount),
              image: finishImage,
              maxStock: matchedVariant.stockCount,
              giftNote: options?.giftNote,
            },
          ];
        }
        try {
          shopperStorage.setItem(
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

  useEffect(() => {
    if (!isHydrated) return;
    setCartItems(prev => {
      const next = prev.flatMap(item => {
        const product = commerceService.catalog.getProductById(item.productId);
        const variant = product?.variants.find(v=>v.id===item.variantId);
        return product && variant ? [{...item, name:product.name, slug:product.slug, price:variant.price, compareAtPrice:variant.compareAtPrice, maxStock:variant.stockCount, image:product.images[variant.imageIndex || 0] || product.images[0]}] : [];
      });
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      shopperStorage.setItem(STORAGE_KEYS.CART,JSON.stringify(next));
      return next;
    });
  }, [merchant.products, isHydrated]);

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
          shopperStorage.setItem(
            STORAGE_KEYS.WISHLIST,
            JSON.stringify(next),
          );
        } catch {}
        void flushShopper().then(()=>showToast(exists ? 'Removed from your wishlist' : 'Saved to your wishlist')).catch(e=>showToast(e.message));
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
        shopperStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // CRITICAL: Permissive Demo Login — ANY non-empty user ID/email and ANY non-empty password succeeds
  // Never store, log, or transmit the password!
  const loginDemo = useCallback(
    async (userIdOrEmail: string, password: string) => {
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
            shopperStorage.getItem("jco_demo_profiles_v1") || "{}",
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


      if (profile.wishlistIds) setWishlistIds(profile.wishlistIds);
      try {
        shopperStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify(newSession),
        );
      } catch {}
      try {
        const profiles=JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1') || '{}');
        profiles[newSession.userId.toLowerCase()]={...profiles[newSession.userId.toLowerCase()],...newSession,wishlistIds:profile.wishlistIds || []};
        shopperStorage.setItem('jco_demo_profiles_v1',JSON.stringify(profiles));
        shopperStorage.setItem(STORAGE_KEYS.WISHLIST,JSON.stringify(profile.wishlistIds || []));
        await flushShopper();
      } catch(e) { shopperStorage.removeItem(STORAGE_KEYS.SESSION); return {success:false,error:(e as Error).message}; }
      setSession(newSession); if(!profile.wishlistIds)setWishlistIds([]);
      showToast(`Signed in to demo account as ${trimmedId}`);
      return { success: true };
    },
    [showToast],
  );

  const registerDemo = useCallback(
    async (payload: RegisterPayload) => {
      const trimmedEmail = payload.email.trim();
      const trimmedPassword = payload.password.trim();
      if (!trimmedEmail || !trimmedPassword || !payload.firstName.trim()) {
        return {
          success: false,
          error: "Please fill in all required fields.",
        };
      }

      const existingProfiles=JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1') || '{}');
      if(existingProfiles[trimmedEmail.toLowerCase()])return {success:false,error:'This preview account already exists. Please log in instead.'};
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

      try {
        shopperStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify(newSession),
        );
      } catch {}

      try {
        const profiles = JSON.parse(
          shopperStorage.getItem("jco_demo_profiles_v1") || "{}",
        );
        profiles[newSession.userId.toLowerCase()] = {...newSession,wishlistIds:[]};
        shopperStorage.setItem(
          "jco_demo_profiles_v1",
          JSON.stringify(profiles),
        );
      } catch {}
      shopperStorage.setItem(STORAGE_KEYS.WISHLIST,"[]");
      try { await flushShopper(); } catch(e) { shopperStorage.removeItem(STORAGE_KEYS.SESSION); return {success:false,error:(e as Error).message}; }
      setSession(newSession);setWishlistIds([]);
      showToast(`Welcome to J&CO. Jewels, ${newSession.firstName}!`);
      return {success:true};
    },
    [showToast],
  );

  const updateDemoProfile = useCallback(async (updates: Partial<DemoUserSession>) => {
    if(!session)return false;
    const next={...session,...updates};
    try {
      const profiles=JSON.parse(shopperStorage.getItem('jco_demo_profiles_v1') || '{}');
      profiles[next.userId.toLowerCase()]={...profiles[next.userId.toLowerCase()],...next,wishlistIds};
      shopperStorage.setItem('jco_demo_profiles_v1',JSON.stringify(profiles));
      await flushShopper(); shopperStorage.setItem(STORAGE_KEYS.SESSION,JSON.stringify(next));setSession(next);showToast('Profile saved in this browser');return true;
    } catch(e) {showToast((e as Error).message);return false;}
  }, [session,wishlistIds,showToast]);

  const logoutDemo = useCallback(() => {
    setSession(null);
    try {
      shopperStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {}
    showToast("Signed out of demo session");
  }, [showToast]);

  const updateOrderStatus = useCallback((id:string,status:DemoOrder['status'])=>{
    void import('@/lib/merchant-store').then(({changeMerchant,defaultOrderDetails})=>changeMerchant(s=>{
      const order=s.orders.find(o=>o.id===id);if(!order)throw new Error('Order not found.');order.status=status;
      const details=s.orderDetails[id] || defaultOrderDetails(order);s.orderDetails[id]={...details,fulfillment:status==='Preparing Shipment (Demo)'?'processing':'unfulfilled'};
    })).then(()=>showToast('Order updated')).catch(e=>showToast(e.message));
  },[showToast]);
  const recordDemoOrder = useCallback((_order:DemoOrder)=>{setOrders(getMerchant().orders);},[]);

  const addCustomReview = useCallback(async (reviewInput: Omit<Review,'id'|'date'|'helpfulCount'>) => {
    const review:Review={...reviewInput,id:crypto.randomUUID(),date:new Date().toLocaleDateString('en-US'),helpfulCount:0};
    try {shopperStorage.setItem(STORAGE_KEYS.REVIEWS,JSON.stringify([review,...customReviews]));await flushShopper();setCustomReviews([review,...customReviews]);showToast('Your review was saved in this browser.');return true;}
    catch(e){showToast((e as Error).message);return false;}
  },[customReviews,showToast]);
  const subscribeNewsletter = useCallback(async (email:string)=>{
    const clean=email.trim().toLowerCase();if(!clean.includes('@'))return false;
    try{const next=[...new Set([...subscribedEmails,clean])];shopperStorage.setItem(STORAGE_KEYS.NEWSLETTER,JSON.stringify(next));await flushShopper();setSubscribedEmails(next);showToast('Subscription saved in this browser (demo).');return true;}
    catch(e){showToast((e as Error).message);return false;}
  },[subscribedEmails,showToast]);

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
    <StoreContext.Provider value={value}><BrowserSaveStatus />{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
