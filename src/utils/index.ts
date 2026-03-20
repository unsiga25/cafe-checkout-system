import { CartItem, Product } from '../types';

export const SIZE_MULTIPLIERS: Record<string, number> = {
  Small: 0.8,
  Medium: 1.0,
  Large: 1.25,
};

export function getSizeAdjustedPrice(basePrice: number, sizeOption?: string): number {
  if (!sizeOption) return basePrice;
  const multiplier = SIZE_MULTIPLIERS[sizeOption] ?? 1.0;
  return parseFloat((basePrice * multiplier).toFixed(2));
}

export function derivePrice(nutriScore: string, category: string): number {
  const base = isDrinkCategory(category) ? 4.5 : 6.0;
  const scoreMap: Record<string, number> = { a: 0, b: 0.5, c: 1.0, d: 1.5, e: 2.0 };
  return parseFloat((base + (scoreMap[nutriScore?.toLowerCase()] ?? 1.0)).toFixed(2));
}

export const DRINK_KEYWORDS = [
  'beverage', 'drink', 'coffee', 'tea', 'juice', 'smoothie',
  'water', 'soda', 'cola', 'milk', 'latte', 'espresso', 'cappuccino',
];

export function isDrinkCategory(category: string): boolean {
  return DRINK_KEYWORDS.some((k) => category.toLowerCase().includes(k));
}

export function fuzzyMatch(target: string, query: string): boolean {
  if (!query.trim()) return true;
  const t = target.toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every((token) => t.includes(token));
}

export function filterProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  return products.filter((p) =>
    fuzzyMatch(`${p.title} ${p.price} ${p.category} ${p.ingredients}`, query)
  );
}

export function deduplicateProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = `${p.title.toLowerCase()}|${p.category.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function calcSubtotal(items: CartItem[]): number {
  return parseFloat(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)
  );
}

export const SERVICE_CHARGE_RATE = 0.1;

export function calcServiceCharge(subtotal: number): number {
  return parseFloat((subtotal * SERVICE_CHARGE_RATE).toFixed(2));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Capitalise first letter of a key name for display  e.g. "sugarLevel" → "Sugar Level"
export function formatOptionKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}