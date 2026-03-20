import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product, Receipt } from '../types';
import { calcServiceCharge, calcSubtotal, getSizeAdjustedPrice } from '../utils';

export interface AddToCartPayload {
  product: Product;
  selectedOptions: Record<string, string>;
  specialInstructions?: string;
  quantity: number;
}

interface UpdateQuantityPayload {
  cartItemId: string;
  delta: number;
}

interface CartState {
  items: CartItem[];
  receipt: Receipt | null;
}

const initialState: CartState = { items: [], receipt: null };

function buildCartItemId(productId: string, selectedOptions: Record<string, string>): string {
  const suffix = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
  return suffix ? `${productId}__${suffix}` : productId;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { product, selectedOptions, specialInstructions, quantity } = action.payload;
      const cartItemId = buildCartItemId(product.id, selectedOptions);
      const unitPrice = getSizeAdjustedPrice(product.price, selectedOptions['size']);
      const existing = state.items.find((i) => i.cartItemId === cartItemId);

      if (existing) {
        existing.quantity += quantity;
        if (specialInstructions) existing.specialInstructions = specialInstructions;
      } else {
        state.items.push({
          cartItemId,
          product,
          quantity,
          selectedOptions,
          specialInstructions,
          unitPrice,
        });
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
    updateItemOptions(
  state,
  action: PayloadAction<{ cartItemId: string; selectedOptions: Record<string, string> }>
) {
  const { cartItemId, selectedOptions } = action.payload;
  const item = state.items.find((i) => i.cartItemId === cartItemId);
  if (!item) return;

  // Recalculate price if size changed
  item.selectedOptions = selectedOptions;
  item.unitPrice = getSizeAdjustedPrice(item.product.price, selectedOptions['size']);

  // Rebuild cartItemId to reflect new options
  const newId = buildCartItemId(item.product.id, selectedOptions);

  // If another item already has this exact config, merge quantities
  const conflict = state.items.find(
    (i) => i.cartItemId === newId && i.cartItemId !== cartItemId
  );
  if (conflict) {
    conflict.quantity += item.quantity;
    state.items = state.items.filter((i) => i.cartItemId !== cartItemId);
  } else {
    item.cartItemId = newId;
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

export const {
  addToCart, removeFromCart, updateQuantity,
  updateItemOptions, checkout, clearReceipt,
} = cartSlice.actions;
export default cartSlice.reducer;