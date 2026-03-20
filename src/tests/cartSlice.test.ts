import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, removeFromCart, updateQuantity, checkout, clearReceipt } from '../store/cartSlice';
import { Product } from '../types';

const drink: Product = { id: 1, title: 'Latte', price: 5.0, category: 'beverages', description: '', thumbnail: '', isDrink: true };
const food: Product = { id: 2, title: 'Croissant', price: 3.5, category: 'pastries', description: '', thumbnail: '', isDrink: false };
const empty = { items: [], receipt: null };

describe('cartSlice', () => {
  it('adds a food item', () => {
    const state = cartReducer(empty, addToCart({ product: food }));
    expect(state.items[0].cartItemId).toBe('2');
    expect(state.items[0].unitPrice).toBe(3.5);
  });
  it('adjusts price for drink size Large', () => {
    const state = cartReducer(empty, addToCart({ product: drink, size: 'Large' }));
    expect(state.items[0].unitPrice).toBeCloseTo(6.25, 2);
  });
  it('increments quantity for same item', () => {
    let state = cartReducer(empty, addToCart({ product: food }));
    state = cartReducer(state, addToCart({ product: food }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });
  it('creates separate entries for different sizes', () => {
    let state = cartReducer(empty, addToCart({ product: drink, size: 'Small' }));
    state = cartReducer(state, addToCart({ product: drink, size: 'Large' }));
    expect(state.items).toHaveLength(2);
  });
  it('removes item', () => {
    let state = cartReducer(empty, addToCart({ product: food }));
    state = cartReducer(state, removeFromCart('2'));
    expect(state.items).toHaveLength(0);
  });
  it('removes item when quantity hits 0', () => {
    let state = cartReducer(empty, addToCart({ product: food }));
    state = cartReducer(state, updateQuantity({ cartItemId: '2', delta: -1 }));
    expect(state.items).toHaveLength(0);
  });
  it('checkout produces correct totals', () => {
    let state = cartReducer(empty, addToCart({ product: food }));
    state = cartReducer(state, addToCart({ product: drink, size: 'Medium' }));
    state = cartReducer(state, checkout());
    expect(state.receipt?.subtotal).toBeCloseTo(8.5, 2);
    expect(state.receipt?.serviceCharge).toBeCloseTo(0.85, 2);
    expect(state.receipt?.total).toBeCloseTo(9.35, 2);
    expect(state.items).toHaveLength(0);
  });
  it('clearReceipt sets receipt to null', () => {
    let state = cartReducer(empty, addToCart({ product: food }));
    state = cartReducer(state, checkout());
    state = cartReducer(state, clearReceipt());
    expect(state.receipt).toBeNull();
  });
});