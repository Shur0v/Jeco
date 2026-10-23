export const DESIGN_TOKENS = {
  colors: {
    pureWhite: '#FFFFFF',
    warmOffWhite: '#FAF8F7',
    softIvory: '#F8F5F2',
    blushPink: '#F6D9D9',
    footerBlush: '#FADADD',
    dustyRose: '#E7A7AA',
    roseBadge: '#E3A4B4',
    cardGrey: '#F6F6F6',
    charcoal: '#292929',
    mutedGrey: '#777777',
    lightBorder: '#EAE6E4',
    goldSwatch: '#D5C185',
    silverSwatch: '#D9D9D9',
    roseGoldSwatch: '#E2B3A3',
    whiteGoldSwatch: '#E5E6E8',
  },
  thresholds: {
    freeShippingBDT: 6000,
    freeGiftBDT: 12000,
  },
} as const;

export const FINISH_SWATCH_COLORS: Record<string, string> = {
  Gold: '#D5C185',
  'Yellow Gold': '#D8BE75',
  Silver: '#D9D9D9',
  'White Gold': '#E2E4E6',
  'Rose Gold': '#E2B3A3',
  'Silver/Gold': 'linear-gradient(135deg, #D9D9D9 50%, #D5C185 50%)',
};
