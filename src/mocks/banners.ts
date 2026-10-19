import { getEditorialBannerSvg } from '@/lib/artwork';

export const HOMEPAGE_CONTENT = {
  hero: {
    kicker: 'SECURE & COMFORTABLE 24/7',
    headline: 'YOUR EVERYDAY EARRINGS, SORTED',
    ctaLabel: 'FIND YOUR FLATBACKS',
    ctaHref: '/collections/flatback',
  },
  categoriesGrid: [
    { label: 'STUDS', href: '/collections/studs', shape: 'bezel-stud' as const, finish: 'Silver' as const },
    { label: 'HUGGIES', href: '/collections/huggie-earrings', shape: 'dome-huggie' as const, finish: 'Gold' as const },
    { label: 'NECKLACES', href: '/collections/necklaces', shape: 'layered-chain-necklace' as const, finish: 'Gold' as const },
    { label: 'PIERCINGS', href: '/collections/piercings', shape: 'flower-diamond-flatback' as const, finish: 'Gold' as const },
    { label: 'OPEN HUGGIES', href: '/collections/open-huggies', shape: 'ball-huggie' as const, finish: 'Silver' as const },
    { label: 'HOOPS', href: '/collections/hoop-earrings', shape: 'pave-huggie' as const, finish: 'Gold' as const },
    { label: 'RINGS', href: '/collections/rings', shape: 'croissant-dome-ring' as const, finish: 'Gold' as const },
    { label: 'PERSONALIZED', href: '/collections/personalized', shape: 'disc-initial-necklace' as const, finish: 'Gold' as const },
  ],
  giftingSplit: {
    leftTitle: 'HOLIDAY MEDALLIONS',
    leftSubtitle: 'Meaningful talismans crafted for gifting',
    leftCta: 'SHOP NOW',
    leftHref: '/collections/necklaces',
    rightTitle: 'A LITTLE GIFT, A LOT OF LOVE',
    rightSubtitle: 'Complimentary gift note & blush keepsake box',
    rightCta: 'SHOP GIFTS',
    rightHref: '/collections/best-sellers',
  },
  featuredFlatbackSpotlight: {
    productId: 'prod-14k-pave-cz-heart-flatback',
    tickerText: 'POKE-FREE FLATBACKS · SLEEP & SHOWER 24/7 · HYPOALLERGENIC',
  },
  personalizedBanner: {
    title: 'PERSONALIZED',
    subtitle: 'Engrave initials, dates, or symbols that tell your story.',
    ctaLabel: 'SHOP NOW',
    ctaHref: '/collections/personalized',
    image: getEditorialBannerSvg('personalized-hands'),
  },
  luxuryUnboxing: {
    title: 'UNBOX A TOUCH OF LUXURY',
    subtitle: 'Every order arrives in our signature embossed floral drawer box with a suede travel pouch.',
    ctaLabel: 'LEARN MORE',
    ctaHref: '/collections/shop-all',
    image: getEditorialBannerSvg('gift-boxes'),
  },
  giftEveryTime: {
    title: 'A GIFT, EVERY TIME',
    subtitle: 'Treat yourself or a loved one.',
    ctaLabel: 'LEARN MORE',
    ctaHref: '/collections/best-sellers',
    image: getEditorialBannerSvg('gift-boxes'),
  },
};
