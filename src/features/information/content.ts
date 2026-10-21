export const INFORMATION_PAGES: Record<
  string,
  { title: string; intro: string; sections: { title: string; body: string }[] }
> = {
  faq: {
    title: "Frequently asked questions",
    intro: "A little help, whenever you need it.",
    sections: [
      {
        title: "What materials are your pieces made from?",
        body: "Explore 14K solid gold, gold filled, sterling silver and titanium. Each product page lists its materials, dimensions and care instructions.",
      },
      {
        title: "How do I find my ring size?",
        body: "Measure the inside diameter of a ring that fits comfortably. US 5 is approximately 15.7 mm, US 6 is 16.5 mm, US 7 is 17.3 mm and US 8 is 18.2 mm. For the most accurate fit, use a ring sizer.",
      },
      {
        title: "Can I send a gift?",
        body: "Yes. Add a gift note at checkout. Our jewellery is presented in signature blush packaging.",
      },
      {
        title: "How can I follow my order?",
        body: "Sign in to your customer account and open My orders to see order details and the latest fulfilment status.",
      },
    ],
  },
  shipping: {
    title: "Shipping & delivery",
    intro: "From our jewellery box to yours.",
    sections: [
      {
        title: "Standard tracked shipping",
        body: "Standard shipping is $6.95 USD, or complimentary on orders of $60 USD or more. Estimated delivery is 4–7 business days.",
      },
      {
        title: "Express delivery",
        body: "DHL Express Priority is $18 USD with an estimated delivery of 2–3 business days. Overnight courier is $29 USD. Available methods and order totals appear at checkout.",
      },
      {
        title: "Duties & taxes",
        body: "Any destination import charges depend on local rules. Delivery estimates may vary by destination and customs processing.",
      },
      {
        title: "Preview orders",
        body: "This frontend uses simulated fulfilment. No parcel is dispatched and no payment is charged.",
      },
    ],
  },
  care: {
    title: "Materials & care",
    intro: "Beautiful today. Loved for longer.",
    sections: [
      {
        title: "14K solid gold",
        body: "Solid gold has a lasting warm glow. Clean gently with a soft cloth and store each piece separately to protect its finish.",
      },
      {
        title: "Sterling silver",
        body: "Use a silver polishing cloth to restore shine. Keep your silver dry and store it in a closed pouch when you are not wearing it.",
      },
      {
        title: "Gold filled & plated jewellery",
        body: "Avoid perfumes, lotions and harsh cleaning products. Remove your pieces before swimming and dry them gently after contact with water.",
      },
      {
        title: "Your everyday ritual",
        body: "Put jewellery on last and take it off first. Store delicate chains flat and keep gemstones away from abrasive surfaces.",
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "Your details deserve thoughtful care.",
    sections: [
      {
        title: "About this preview",
        body: "This is a browser-based storefront demonstration. Cart contents, account profile, wishlists, newsletter subscriptions, orders and merchant settings are saved in this browser’s local storage.",
      },
      {
        title: "Account information",
        body: "Passwords are not saved or sent. Sample credentials create a demo session only. Use fictional information when trying the checkout.",
      },
      {
        title: "Third-party images",
        body: "Sample jewellery photographs load from public image hosts. Those hosts receive the normal browser request information needed to deliver an image.",
      },
      {
        title: "Removing your data",
        body: "Clear this site’s browser storage to remove locally saved preview information. A production privacy policy must be supplied before launching a live store.",
      },
    ],
  },
  terms: {
    title: "Terms & conditions",
    intro: "A few details for your peace of mind.",
    sections: [
      {
        title: "Storefront demonstration",
        body: "This website is a frontend preview. Products, prices, promotions, fulfilment and customer accounts are presented for demonstration.",
      },
      {
        title: "Payments & orders",
        body: "Checkout creates a simulated order in your browser. It does not charge a card, contact a payment provider or create a purchase contract.",
      },
      {
        title: "Product photography",
        body: "Online sample images illustrate the intended design. Final product imagery, descriptions and commercial policies should be confirmed before a live launch.",
      },
      {
        title: "Returns",
        body: "Please contact customer care for help with an order. A live store’s returns and refund terms must be supplied by the merchant.",
      },
    ],
  },
  contact: {
    title: "Contact us",
    intro: "We’re here for the little details.",
    sections: [
      {
        title: "Customer care",
        body: "Have a question about a piece, your order, or finding your perfect stack? Leave a message below.",
      },
    ],
  },
};
