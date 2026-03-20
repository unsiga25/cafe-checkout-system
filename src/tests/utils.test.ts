import { describe, it, expect } from 'vitest';
import {
  fuzzyMatch, filterProducts, deduplicateProducts,
  getSizeAdjustedPrice, calcSubtotal, calcServiceCharge, getCartItemId,
} from '../utils';
import { CartItem, Product } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1, title: 'Cappuccino', price: 4.5, category: 'beverages',
  description: 'A great coffee', thumbnail: 'https://example.com/img.jpg',
  isDrink: true, ...overrides,
});

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  cartItemId: '1-Medium', product: makeProduct(), quantity: 2,
  size: 'Medium', unitPrice: 4.5, ...overrides,
});

describe('fuzzyMatch', () => {
  it('returns true for empty query', () => expect(fuzzyMatch('Cappuccino beverages', '')).toBe(true));
  it('matches case-insensitively', () => expect(fuzzyMatch('Cappuccino beverages', 'cAPPUCCINO')).toBe(true));
  it('matches partial substring', () => expect(fuzzyMatch('Caramel Latte', 'latte')).toBe(true));
  it('matches multiple tokens', () => expect(fuzzyMatch('Caramel Latte beverages', 'caramel beverages')).toBe(true));
  it('returns false when not present', () => expect(fuzzyMatch('Caramel Latte', 'espresso')).toBe(false));
  it('matches price as substring', () => expect(fuzzyMatch('Cappuccino 4.5 beverages', '4.5')).toBe(true));
});

describe('filterProducts', () => {
  const products: Product[] = [
    makeProduct({ id: 1, title: 'Cappuccino', price: 4.5, category: 'beverages' }),
    makeProduct({ id: 2, title: 'Croissant', price: 3.0, category: 'pastries', isDrink: false }),
    makeProduct({ id: 3, title: 'Espresso', price: 3.5, category: 'beverages' }),
  ];
  it('returns all when query empty', () => expect(filterProducts(products, '')).toHaveLength(3));
  it('filters by name', () => expect(filterProducts(products, 'espresso')[0].title).toBe('Espresso'));
  it('filters by category', () => expect(filterProducts(products, 'pastries')[0].title).toBe('Croissant'));
  it('returns empty for no matches', () => expect(filterProducts(products, 'matcha')).toHaveLength(0));
});

describe('deduplicateProducts', () => {
  it('removes exact duplicates', () => {
    const dup = makeProduct();
    expect(deduplicateProducts([dup, dup, makeProduct({ id: 2, title: 'Espresso' })])).toHaveLength(2);
  });
  it('keeps products with different prices', () => {
    expect(deduplicateProducts([makeProduct({ price: 4.0 }), makeProduct({ price: 5.0 })])).toHaveLength(2);
  });
  it('deduplicates case-insensitively', () => {
    const a = makeProduct({ title: 'Latte', category: 'Beverages' });
    const b = makeProduct({ title: 'latte', category: 'beverages' });
    expect(deduplicateProducts([a, b])).toHaveLength(1);
  });
});

describe('getSizeAdjustedPrice', () => {
  it('returns base price when no size', () => expect(getSizeAdjustedPrice(4.0)).toBe(4.0));
  it('applies Small multiplier', () => expect(getSizeAdjustedPrice(5.0, 'Small')).toBeCloseTo(4.0, 2));
  it('applies Medium multiplier', () => expect(getSizeAdjustedPrice(5.0, 'Medium')).toBeCloseTo(5.0, 2));
  it('applies Large multiplier', () => expect(getSizeAdjustedPrice(4.0, 'Large')).toBeCloseTo(5.0, 2));
});

describe('calcSubtotal', () => {
  it('returns 0 for empty cart', () => expect(calcSubtotal([])).toBe(0));
  it('sums correctly', () => {
    const items: CartItem[] = [
      makeCartItem({ unitPrice: 4.5, quantity: 2 }),
      makeCartItem({ cartItemId: '2', unitPrice: 3.0, quantity: 1 }),
    ];
    expect(calcSubtotal(items)).toBeCloseTo(12.0, 2);
  });
});

describe('calcServiceCharge', () => {
  it('calculates 10%', () => expect(calcServiceCharge(20.0)).toBeCloseTo(2.0, 2));
  it('returns 0 for zero', () => expect(calcServiceCharge(0)).toBe(0));
});

describe('getCartItemId', () => {
  it('returns productId for food', () => expect(getCartItemId(42)).toBe('42'));
  it('appends size for drinks', () => expect(getCartItemId(42, 'Large')).toBe('42-Large'));
  it('different sizes give different IDs', () => expect(getCartItemId(1, 'Small')).not.toBe(getCartItemId(1, 'Large')));
});