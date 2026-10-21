export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
export type AppliedPromo = { code: string; discountType: DiscountType; discountValue: number };

const PERCENT = 100;

const DISCOUNT_BY_TYPE: Record<DiscountType, (subtotal: number, value: number) => number> = {
  PERCENTAGE: (subtotal, value) => (subtotal * value) / PERCENT,
  FIXED_AMOUNT: (_subtotal, value) => value,
  FREE: (subtotal) => subtotal,
};

/** Discount for the current subtotal, so seat changes after applying a code stay correct. */
export const discountFor = (promo: AppliedPromo | null, subtotal: number): number =>
  promo ? Math.min(DISCOUNT_BY_TYPE[promo.discountType](subtotal, promo.discountValue), subtotal) : 0;

export const baht = (amount: number): string => `฿${amount.toLocaleString()}`;
