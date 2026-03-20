import { CartItem, DrinkSize, Product } from '../types';

export const SIZE_MULTIPLIERS: Record<DrinkSize, number> = {
  Small: 0.8,
  Medium: 1.0,
  Large: 1.25,
};

export const DRINK_CATEGORIES = ['beverages', 'drinks', 'coffee', 'tea', 'juice', 'smoothies'];

export function isDrinkCategory(category: string): boolean {
  return DRINK_CATEGORIES.some((c) => category.toLowerCase().includes(c));
}

export function getCartItemId(productId: number, size?: DrinkSize): string {
  return size ? `${productId}-${size}` : `${productId}`;
}

export function getSizeAdjustedPrice(basePrice: number, size?: DrinkSize): number {
  if (!size) return basePrice;
  return parseFloat((basePrice * SIZE_MULTIPLIERS[size]).toFixed(2));
}

export function fuzzyMatch(target: string, query: string): boolean {
  if (!query.trim()) return true;
  const t = target.toLowerCase();
  const q = query.toLowerCase().trim();
  return q.split(/\s+/).every((token) => t.includes(token));
}

export function filterProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  return products.filter((p) => {
    const searchable = `${p.title} ${p.price} ${p.category}`;
    return fuzzyMatch(searchable, query);
  });
}

export function deduplicateProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = `${p.title.toLowerCase()}|${p.price}|${p.category.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function calcSubtotal(items: CartItem[]): number {
  return parseFloat(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));
}

export const SERVICE_CHARGE_RATE = 0.1;

export function calcServiceCharge(subtotal: number): number {
  return parseFloat((subtotal * SERVICE_CHARGE_RATE).toFixed(2));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}