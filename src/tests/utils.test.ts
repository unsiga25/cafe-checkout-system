import { describe, it, expect } from 'vitest';
import {
  fuzzyMatch,
  filterProducts,
  deduplicateProducts,
  getSizeAdjustedPrice,
  calcSubtotal,
  calcServiceCharge,
  formatCurrency,
  formatOptionKey,
  isDrinkCategory,
} from '../utils';
import { CartItem, Product } from '../types';

// ── Fixtures ─────────────────────────────────────────────
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  title: 'Cappuccino',
  price: 4.5,
  category: 'beverages',
  description: 'A great coffee',
  thumbnail: 'https://example.com/img.jpg',
  isDrink: true,
  nutriScore: 'b',
  customizations: {},
  ...overrides,
});

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  cartItemId: '1__size:Medium',
  product: makeProduct(),
  quantity: 2,
  selectedOptions: { size: 'Medium' },
  unitPrice: 4.5,
  ...overrides,
});

// ── fuzzyMatch ────────────────────────────────────────────
describe('fuzzyMatch', () => {
  it('returns true for empty query', () =>
    expect(fuzzyMatch('Cappuccino beverages', '')).toBe(true));

  it('returns true for whitespace-only query', () =>
    expect(fuzzyMatch('Cappuccino beverages', '   ')).toBe(true));

  it('matches case-insensitively', () =>
    expect(fuzzyMatch('Cappuccino beverages', 'cAPPUCCINO')).toBe(true));

  it('matches partial substring', () =>
    expect(fuzzyMatch('Caramel Latte', 'latte')).toBe(true));

  it('matches multiple tokens — all present', () =>
    expect(fuzzyMatch('Caramel Latte beverages', 'caramel beverages')).toBe(true));

  it('returns false when one token missing', () =>
    expect(fuzzyMatch('Caramel Latte', 'caramel espresso')).toBe(false));

  it('returns false when no tokens match', () =>
    expect(fuzzyMatch('Caramel Latte', 'espresso')).toBe(false));

  it('matches price as substring', () =>
    expect(fuzzyMatch('Cappuccino 4.5 beverages', '4.5')).toBe(true));

  it('matches ingredients in searchable string', () =>
    expect(fuzzyMatch('Cappuccino beverages espresso milk', 'milk')).toBe(true));
});

// ── filterProducts ────────────────────────────────────────
describe('filterProducts', () => {
  const products: Product[] = [
    makeProduct({ id: '1', title: 'Cappuccino', price: 4.5, category: 'beverages' }),
    makeProduct({ id: '2', title: 'Croissant', price: 3.0, category: 'pastries', isDrink: false }),
    makeProduct({ id: '3', title: 'Espresso', price: 3.5, category: 'beverages' }),
    makeProduct({ id: '4', title: 'Matcha Latte', price: 5.5, category: 'tea', isDrink: true }),
  ];

  it('returns all products when query is empty', () =>
    expect(filterProducts(products, '')).toHaveLength(4));

  it('returns all products when query is whitespace', () =>
    expect(filterProducts(products, '   ')).toHaveLength(4));

  it('filters by name (case-insensitive)', () =>
    expect(filterProducts(products, 'espresso')[0].title).toBe('Espresso'));

  it('filters by category', () =>
    expect(filterProducts(products, 'pastries')[0].title).toBe('Croissant'));

  it('filters by price', () =>
    expect(filterProducts(products, '5.5')[0].title).toBe('Matcha Latte'));

  it('returns multiple matches', () =>
    expect(filterProducts(products, 'beverages')).toHaveLength(2));

  it('returns empty array for no matches', () =>
    expect(filterProducts(products, 'matcha espresso')).toHaveLength(0));

  it('returns empty array for completely unmatched query', () =>
    expect(filterProducts(products, 'xyz123')).toHaveLength(0));
});

// ── deduplicateProducts ───────────────────────────────────
describe('deduplicateProducts', () => {
  it('returns empty array for empty input', () =>
    expect(deduplicateProducts([])).toHaveLength(0));

  it('removes exact duplicates (same title + category)', () => {
    const dup = makeProduct();
    expect(
      deduplicateProducts([dup, dup, makeProduct({ id: '2', title: 'Espresso' })])
    ).toHaveLength(2);
  });

  it('keeps products with same title but different category', () =>
    expect(
      deduplicateProducts([
        makeProduct({ category: 'coffee' }),
        makeProduct({ category: 'iced drinks' }),
      ])
    ).toHaveLength(2));

  it('keeps first occurrence when deduplicating', () => {
    const first = makeProduct({ id: '1', title: 'Latte' });
    const second = makeProduct({ id: '2', title: 'latte' });
    const result = deduplicateProducts([first, second]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('deduplicates case-insensitively on title and category', () => {
    const a = makeProduct({ title: 'Latte', category: 'Beverages' });
    const b = makeProduct({ title: 'latte', category: 'beverages' });
    expect(deduplicateProducts([a, b])).toHaveLength(1);
  });

  it('keeps products with different titles in same category', () =>
    expect(
      deduplicateProducts([
        makeProduct({ title: 'Latte', category: 'coffee' }),
        makeProduct({ title: 'Espresso', category: 'coffee' }),
      ])
    ).toHaveLength(2));
});

// ── getSizeAdjustedPrice ──────────────────────────────────
describe('getSizeAdjustedPrice', () => {
  it('returns base price when no size given', () =>
    expect(getSizeAdjustedPrice(4.0)).toBe(4.0));

  it('returns base price for undefined size', () =>
    expect(getSizeAdjustedPrice(4.0, undefined)).toBe(4.0));

  it('applies Small multiplier (0.8 = −20%)', () =>
    expect(getSizeAdjustedPrice(5.0, 'Small')).toBeCloseTo(4.0, 2));

  it('applies Medium multiplier (1.0 = no change)', () =>
    expect(getSizeAdjustedPrice(5.0, 'Medium')).toBeCloseTo(5.0, 2));

  it('applies Large multiplier (1.25 = +25%)', () =>
    expect(getSizeAdjustedPrice(4.0, 'Large')).toBeCloseTo(5.0, 2));

  it('returns base price for unknown size (fallback to 1.0)', () =>
    expect(getSizeAdjustedPrice(4.0, 'XL')).toBeCloseTo(4.0, 2));

  it('rounds result to 2 decimal places', () => {
    const result = getSizeAdjustedPrice(3.33, 'Large');
    const decimals = result.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});

// ── calcSubtotal ──────────────────────────────────────────
describe('calcSubtotal', () => {
  it('returns 0 for empty cart', () =>
    expect(calcSubtotal([])).toBe(0));

  it('sums unitPrice × quantity for single item', () =>
    expect(calcSubtotal([makeCartItem({ unitPrice: 4.5, quantity: 2 })])).toBeCloseTo(9.0, 2));

  it('sums multiple items correctly', () => {
    const items: CartItem[] = [
      makeCartItem({ unitPrice: 4.5, quantity: 2 }),
      makeCartItem({ cartItemId: '2', unitPrice: 3.0, quantity: 1 }),
    ];
    expect(calcSubtotal(items)).toBeCloseTo(12.0, 2);
  });

  it('handles quantity of 1', () =>
    expect(calcSubtotal([makeCartItem({ unitPrice: 6.0, quantity: 1 })])).toBeCloseTo(6.0, 2));

  it('rounds to 2 decimal places', () => {
    const items = [makeCartItem({ unitPrice: 1.005, quantity: 1 })];
    const result = calcSubtotal(items);
    const decimals = result.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});

// ── calcServiceCharge ─────────────────────────────────────
describe('calcServiceCharge', () => {
  it('calculates 10% of subtotal', () =>
    expect(calcServiceCharge(20.0)).toBeCloseTo(2.0, 2));

  it('returns 0 for zero subtotal', () =>
    expect(calcServiceCharge(0)).toBe(0));

  it('rounds to 2 decimal places', () => {
    const result = calcServiceCharge(33.33);
    const decimals = result.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('correctly charges 10% on large amounts', () =>
    expect(calcServiceCharge(100.0)).toBeCloseTo(10.0, 2));
});

// ── formatCurrency ────────────────────────────────────────
describe('formatCurrency', () => {
  it('formats whole numbers with 2 decimals', () =>
    expect(formatCurrency(5)).toBe('$5.00'));

  it('formats decimal amounts', () =>
    expect(formatCurrency(4.5)).toBe('$4.50'));

  it('formats zero', () =>
    expect(formatCurrency(0)).toBe('$0.00'));

  it('formats large amounts', () =>
    expect(formatCurrency(1234.56)).toBe('$1234.56'));
});

// ── formatOptionKey ───────────────────────────────────────
describe('formatOptionKey', () => {
  it('capitalises first letter', () =>
    expect(formatOptionKey('size')).toBe('Size'));

  it('splits camelCase into words', () =>
    expect(formatOptionKey('sugarLevel')).toBe('Sugar Level'));

  it('handles single word', () =>
    expect(formatOptionKey('milk')).toBe('Milk'));

  it('handles already capitalised', () =>
    expect(formatOptionKey('Temperature')).toBe('Temperature'));
});

// ── isDrinkCategory ───────────────────────────────────────
describe('isDrinkCategory', () => {
  it('identifies coffee as a drink', () =>
    expect(isDrinkCategory('coffee')).toBe(true));

  it('identifies tea as a drink', () =>
    expect(isDrinkCategory('tea')).toBe(true));

  it('identifies juice as a drink', () =>
    expect(isDrinkCategory('juice')).toBe(true));

  it('identifies smoothie as a drink', () =>
    expect(isDrinkCategory('smoothie')).toBe(true));

  it('identifies pastry as not a drink', () =>
    expect(isDrinkCategory('pastry')).toBe(false));

  it('identifies sandwich as not a drink', () =>
    expect(isDrinkCategory('sandwich')).toBe(false));

  it('is case-insensitive', () =>
    expect(isDrinkCategory('COFFEE')).toBe(true));
});