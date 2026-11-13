export type Currency = 'INR' | 'USD';

/** Base price. USD is an approximate conversion — edit here to change it everywhere. */
export const PRICE: Record<Currency, number> = { INR: 1200, USD: 14 };

/** Shipping per order (India lower, international higher). NOT shown on the page yet — kept for when payments open. */
export const SHIPPING: Record<Currency, number> = { INR: 99, USD: 12 };

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export const MAX_QTY = 5;

export const fmt = (c: Currency, n: number) =>
  c === 'INR' ? '₹' + n.toLocaleString('en-IN') : '$' + n.toLocaleString('en-US');

/** Product photos, in display order. The on-body photo is intentionally last. */
export const IMAGES = [
  { src: '/assets/tee-front.webp', full: '/assets/full/tee-front.webp', w: 900, h: 985, tag: 'FRONT', alt: "Front: Nothing Personal. I'm Just Correct. print on a washed-black full-sleeve tee" },
  { src: '/assets/back-print.webp', full: '/assets/full/back-print.webp', w: 900, h: 776, tag: 'BACK PRINT', alt: 'Back neck starburst emblem print, close-up' },
  { src: '/assets/flatlay-set.webp', full: '/assets/full/flatlay-set.webp', w: 1200, h: 800, tag: 'FRONT + BACK', alt: 'Front and back of the tee laid flat' },
  { src: '/assets/model.webp', full: '/assets/full/model.webp', w: 900, h: 1200, tag: 'ON BODY', alt: 'Model wearing the washed-black full-sleeve tee' },
];

/** [ISO code, flag, dial code, name] */
export const COUNTRIES: [string, string, string, string][] = [
  ['IN','🇮🇳','+91','India'],['US','🇺🇸','+1','United States'],['GB','🇬🇧','+44','United Kingdom'],['CA','🇨🇦','+1','Canada'],
  ['AE','🇦🇪','+971','UAE'],['AU','🇦🇺','+61','Australia'],['SG','🇸🇬','+65','Singapore'],['SA','🇸🇦','+966','Saudi Arabia'],
  ['QA','🇶🇦','+974','Qatar'],['KW','🇰🇼','+965','Kuwait'],['OM','🇴🇲','+968','Oman'],['BH','🇧🇭','+973','Bahrain'],
  ['BD','🇧🇩','+880','Bangladesh'],['NP','🇳🇵','+977','Nepal'],['LK','🇱🇰','+94','Sri Lanka'],['PK','🇵🇰','+92','Pakistan'],
  ['MY','🇲🇾','+60','Malaysia'],['ID','🇮🇩','+62','Indonesia'],['TH','🇹🇭','+66','Thailand'],['PH','🇵🇭','+63','Philippines'],
  ['JP','🇯🇵','+81','Japan'],['KR','🇰🇷','+82','South Korea'],['HK','🇭🇰','+852','Hong Kong'],['NZ','🇳🇿','+64','New Zealand'],
  ['DE','🇩🇪','+49','Germany'],['FR','🇫🇷','+33','France'],['NL','🇳🇱','+31','Netherlands'],['IE','🇮🇪','+353','Ireland'],
  ['IT','🇮🇹','+39','Italy'],['ES','🇪🇸','+34','Spain'],['SE','🇸🇪','+46','Sweden'],['CH','🇨🇭','+41','Switzerland'],
  ['ZA','🇿🇦','+27','South Africa'],['NG','🇳🇬','+234','Nigeria'],['KE','🇰🇪','+254','Kenya'],['BR','🇧🇷','+55','Brazil'],['MX','🇲🇽','+52','Mexico'],
];

/** Visitor country from the browser alone (used when the host gives no geo header). */
export function guessCountryFromBrowser(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'IN';
    const region = (navigator.languages?.[0] || navigator.language || '').split('-')[1]?.toUpperCase();
    return region && region !== 'IN' ? region : 'US';
  } catch {
    return 'IN';
  }
}
