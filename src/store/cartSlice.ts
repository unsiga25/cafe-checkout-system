import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, DrinkSize, Product, Receipt } from '../types';
import { calcServiceCharge, calcSubtotal, getCartItemId, getSizeAdjustedPrice } from '../utils';

interface AddToCartPayload {
  product: Product;
  size?: DrinkSize;
}

interface UpdateQuantityPayload {
  cartItemId: string;
  delta: number;
}

interface CartState {
  items: CartItem[];
  receipt: Receipt | null;
}

const initialState: CartState = {
  items: [],
  receipt: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { product, size } = action.payload;
      const cartItemId = getCartItemId(product.id, size);
      const existing = state.items.find((i) => i.cartItemId === cartItemId);
      const unitPrice = getSizeAdjustedPrice(product.price, size);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ cartItemId, product, quantity: 1, size, unitPrice });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.cartItemId !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<UpdateQuantityPayload>) {
      const { cartItemId, delta } = action.payload;
      const item = state.items.find((i) => i.cartItemId === cartItemId);
      if (!item) return;
      item.quantity = Math.max(0, item.quantity + delta);
      if (item.quantity === 0) {
        state.items = state.items.filter((i) => i.cartItemId !== cartItemId);
      }
    },
    checkout(state) {
      const subtotal = calcSubtotal(state.items);
      const serviceCharge = calcServiceCharge(subtotal);
      state.receipt = {
        items: [...state.items],
        subtotal,
        serviceCharge,
        total: parseFloat((subtotal + serviceCharge).toFixed(2)),
        timestamp: new Date().toISOString(),
      };
      state.items = [];
    },
    clearReceipt(state) {
      state.receipt = null;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, checkout, clearReceipt } = cartSlice.actions;
export default cartSlice.reducer;