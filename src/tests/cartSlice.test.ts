import { describe, it, expect } from 'vitest';
import cartReducer, {
  addToCart, removeFromCart, updateQuantity,
  updateItemOptions, checkout, clearReceipt,
} from '../store/cartSlice';
import { Product } from '../types';

const drink: Product = {
  id: '1', title: 'Latte', price: 5.0, category: 'beverages',
  description: '', thumbnail: '', isDrink: true, nutriScore: 'b',
  customizations: { size: ['Small', 'Medium', 'Large'] },
};

const food: Product = {
  id: '2', title: 'Croissant', price: 3.5, category: 'pastries',
  description: '', thumbnail: '', isDrink: false, nutriScore: 'c',
  customizations: {},
};

const empty = { items: [], receipt: null };

describe('cartSlice', () => {

  describe('addToCart', () => {
    it('adds a food item with no options', () => {
      const state = cartReducer(empty, addToCart({
        product: food,
        selectedOptions: {},
        quantity: 1,
      }));
      expect(state.items[0].cartItemId).toBe('2');
      expect(state.items[0].unitPrice).toBe(3.5);
    });

    it('adjusts price for drink size Large', () => {
      const state = cartReducer(empty, addToCart({
        product: drink,
        selectedOptions: { size: 'Large' },
        quantity: 1,
      }));
      expect(state.items[0].unitPrice).toBeCloseTo(6.25, 2);
    });

    it('adjusts price for drink size Small', () => {
      const state = cartReducer(empty, addToCart({
        product: drink,
        selectedOptions: { size: 'Small' },
        quantity: 1,
      }));
      expect(state.items[0].unitPrice).toBeCloseTo(4.0, 2);
    });

    it('adjusts price for drink size Medium (no change)', () => {
      const state = cartReducer(empty, addToCart({
        product: drink,
        selectedOptions: { size: 'Medium' },
        quantity: 1,
      }));
      expect(state.items[0].unitPrice).toBeCloseTo(5.0, 2);
    });

    it('increments quantity when same item and same options added again', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('adds quantity > 1 correctly', () => {
      const state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 3,
      }));
      expect(state.items[0].quantity).toBe(3);
    });

    it('creates separate entries for different sizes', () => {
      let state = cartReducer(empty, addToCart({
        product: drink, selectedOptions: { size: 'Small' }, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: drink, selectedOptions: { size: 'Large' }, quantity: 1,
      }));
      expect(state.items).toHaveLength(2);
    });

    it('creates separate entries for different milk options', () => {
      let state = cartReducer(empty, addToCart({
        product: drink, selectedOptions: { size: 'Medium', milk: 'Oat' }, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: drink, selectedOptions: { size: 'Medium', milk: 'Soy' }, quantity: 1,
      }));
      expect(state.items).toHaveLength(2);
    });

    it('stores special instructions', () => {
      const state = cartReducer(empty, addToCart({
        product: food,
        selectedOptions: {},
        quantity: 1,
        specialInstructions: 'No nuts please',
      }));
      expect(state.items[0].specialInstructions).toBe('No nuts please');
    });
  });

  describe('removeFromCart', () => {
    it('removes item by cartItemId', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, removeFromCart('2'));
      expect(state.items).toHaveLength(0);
    });

    it('does not affect other items', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: drink, selectedOptions: { size: 'Medium' }, quantity: 1,
      }));
      state = cartReducer(state, removeFromCart('2'));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].product.title).toBe('Latte');
    });
  });

  describe('updateQuantity', () => {
    it('increments quantity by 1', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, updateQuantity({ cartItemId: '2', delta: 1 }));
      expect(state.items[0].quantity).toBe(2);
    });

    it('decrements quantity by 1', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 2,
      }));
      state = cartReducer(state, updateQuantity({ cartItemId: '2', delta: -1 }));
      expect(state.items[0].quantity).toBe(1);
    });

    it('removes item when quantity hits 0', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, updateQuantity({ cartItemId: '2', delta: -1 }));
      expect(state.items).toHaveLength(0);
    });

    it('does not go below 0', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, updateQuantity({ cartItemId: '2', delta: -5 }));
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateItemOptions', () => {
    it('updates size and recalculates price', () => {
      let state = cartReducer(empty, addToCart({
        product: drink, selectedOptions: { size: 'Small' }, quantity: 1,
      }));
      const cartItemId = state.items[0].cartItemId;
      state = cartReducer(state, updateItemOptions({
        cartItemId,
        selectedOptions: { size: 'Large' },
      }));
      expect(state.items[0].unitPrice).toBeCloseTo(6.25, 2);
    });

    it('merges quantities when updated options match existing item', () => {
      let state = cartReducer(empty, addToCart({
        product: drink, selectedOptions: { size: 'Small' }, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: drink, selectedOptions: { size: 'Large' }, quantity: 2,
      }));
      const smallId = state.items.find((i) => i.selectedOptions['size'] === 'Small')!.cartItemId;
      state = cartReducer(state, updateItemOptions({
        cartItemId: smallId,
        selectedOptions: { size: 'Large' },
      }));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
    });
  });

  describe('checkout', () => {
    it('produces correct subtotal, service charge and total', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, addToCart({
        product: drink, selectedOptions: { size: 'Medium' }, quantity: 1,
      }));
      state = cartReducer(state, checkout());
      expect(state.receipt?.subtotal).toBeCloseTo(8.5, 2);
      expect(state.receipt?.serviceCharge).toBeCloseTo(0.85, 2);
      expect(state.receipt?.total).toBeCloseTo(9.35, 2);
    });

    it('clears cart after checkout', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, checkout());
      expect(state.items).toHaveLength(0);
    });

    it('stores items snapshot in receipt', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 2,
      }));
      state = cartReducer(state, checkout());
      expect(state.receipt?.items).toHaveLength(1);
      expect(state.receipt?.items[0].quantity).toBe(2);
    });

    it('receipt includes a valid timestamp', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, checkout());
      expect(new Date(state.receipt!.timestamp).getFullYear()).toBeGreaterThan(2020);
    });
  });

  describe('clearReceipt', () => {
    it('sets receipt to null', () => {
      let state = cartReducer(empty, addToCart({
        product: food, selectedOptions: {}, quantity: 1,
      }));
      state = cartReducer(state, checkout());
      state = cartReducer(state, clearReceipt());
      expect(state.receipt).toBeNull();
    });
  });

});