import { COUNTRIES, MAX_QTY, SIZES } from './shop';

export type SignupField = 'name' | 'email' | 'phone' | 'country' | 'size' | 'qty' | 'currency' | 'consent';

export const validName = (value: string) => {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80 && /\p{L}/u.test(name) && !/[\p{C}<>]/u.test(name);
};

export const validEmail = (value: string) => {
  const email = value.trim();
  return email.length <= 120 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);
};

export const nationalPhoneDigits = (value: string, country: string) => {
  const digits = value.replace(/\D/g, '');
  const dial = COUNTRIES.find(([code]) => code === country)?.[2].slice(1);
  const national = value.trim().startsWith('+') && dial && digits.startsWith(dial)
    ? digits.slice(dial.length) : digits;
  return national.replace(/^0+/, '');
};

export const validNationalPhone = (value: string, country: string) => {
  const dial = COUNTRIES.find(([code]) => code === country)?.[2];
  if (!dial || !/^\+?[\d\s()-]+$/.test(value)) return false;
  if (value.trim().startsWith('+') && !value.replace(/\D/g, '').startsWith(dial.slice(1))) return false;
  const digits = nationalPhoneDigits(value, country);
  if (country === 'IN' && !/^[6-9]\d{9}$/.test(digits)) return false;
  if (country !== 'IN' && !/^\d{6,13}$/.test(digits)) return false;
  return /^\d{8,15}$/.test(dial.slice(1) + digits);
};

export const validFullPhone = (value: string, country: string) => {
  const dial = COUNTRIES.find(([code]) => code === country)?.[2];
  return !!dial && value.startsWith(dial) && /^\d+$/.test(value.slice(dial.length)) &&
    validNationalPhone(value.slice(dial.length), country);
};

export const validSize = (value: string) => (SIZES as readonly string[]).includes(value);
export const validQty = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_QTY;
