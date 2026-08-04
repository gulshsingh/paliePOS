import { REGEX } from '../constants/regex';

export const isValidEmail = (email: string): boolean => REGEX.EMAIL.test(email);
export const isValidPhone = (phone: string): boolean => REGEX.PHONE.test(phone);
export const isValidPrice = (price: string): boolean => REGEX.PRICE.test(price);
export const isRequired   = (value: string): boolean => value.trim().length > 0;
