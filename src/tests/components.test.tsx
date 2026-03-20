import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addToCart } from '../store/cartSlice';
import menuReducer from '../store/menuSlice';
import CartItemRow from '../components/CartItemRow';
import ReceiptModal from '../components/ReceiptModal';
import { CartItem, Product, Receipt } from '../types';

// ── Ionic mock ───────────────────────────────────────────
vi.mock('@ionic/react', () => {
  const React = require('react');
  const p = (tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement(tag, props, children);
  return {
    IonItem: p('div'),
    IonLabel: p('span'),
    IonNote: p('span'),
    IonButton: ({
      children, onClick, ...props
    }: React.PropsWithChildren<{ onClick?: () => void; [k: string]: unknown }>) =>
      React.createElement('button', { onClick, ...props }, children),
    IonButtons: p('div'),
    IonIcon: () => React.createElement('span'),
    IonThumbnail: p('div'),
    IonImg: ({ alt, src }: { alt: string; src: string }) =>
      React.createElement('img', { alt, src }),
    IonBadge: p('span'),
    IonModal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
      isOpen ? React.createElement('div', { role: 'dialog' }, children) : null,
    IonHeader: p('div'),
    IonToolbar: p('div'),
    IonTitle: p('h2'),
    IonContent: p('div'),
    IonFooter: p('div'),
    IonList: p('ul'),
    IonSelect: p('select'),
    IonSelectOption: p('option'),
    IonTextarea: p('textarea'),
    IonSpinner: () => React.createElement('div', { 'data-testid': 'spinner' }),
    IonText: p('div'),
  };
});

// ── Fixtures ─────────────────────────────────────────────
const drinkProduct: Product = {
  id: '1',
  title: 'Latte',
  price: 5.0,
  category: 'beverages',
  description: 'Smooth latte',
  thumbnail: 'img.jpg',
  isDrink: true,
  nutriScore: 'b',
  customizations: {
    size: ['Small', 'Medium', 'Large'],
    milk: ['Whole', 'Oat', 'Soy'],
  },
};

const foodProduct: Product = {
  id: '2',
  title: 'Croissant',
  price: 3.5,
  category: 'pastries',
  description: 'Buttery croissant',
  thumbnail: 'img2.jpg',
  isDrink: false,
  nutriScore: 'c',
  customizations: {},
};

const drinkItem: CartItem = {
  cartItemId: '1__size:Medium',
  product: drinkProduct,
  quantity: 2,
  selectedOptions: { size: 'Medium', milk: 'Whole' },
  unitPrice: 5.0,
};

const foodItem: CartItem = {
  cartItemId: '2',
  product: foodProduct,
  quantity: 1,
  selectedOptions: {},
  unitPrice: 3.5,
};

const makeStore = (items: CartItem[] = []) =>
  configureStore({
    reducer: { cart: cartReducer, menu: menuReducer },
    preloadedState: { cart: { items, receipt: null } },
  });

// ── CartItemRow tests ─────────────────────────────────────
describe('CartItemRow', () => {
  it('renders product title', () => {
    render(
      <Provider store={makeStore([drinkItem])}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    expect(screen.getByText('Latte')).toBeInTheDocument();
  });

  it('shows size badge for drinks', () => {
    render(
      <Provider store={makeStore([drinkItem])}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    // Size badge shows "Medium — $5.00"
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
  });

  it('does not show size badge for food', () => {
    render(
      <Provider store={makeStore([foodItem])}>
        <CartItemRow item={foodItem} />
      </Provider>
    );
    expect(screen.queryByText(/Medium/)).not.toBeInTheDocument();
  });

  it('shows other selected options as tags', () => {
    render(
      <Provider store={makeStore([drinkItem])}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    expect(screen.getByText(/Milk: Whole/i)).toBeInTheDocument();
  });

  it('shows quantity', () => {
    render(
      <Provider store={makeStore([drinkItem])}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    expect(screen.getByTestId('qty-display')).toHaveTextContent('2');
  });

  it('increments quantity when + clicked', () => {
    const store = makeStore([drinkItem]);
    render(
      <Provider store={store}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('increase-qty'));
    expect(store.getState().cart.items[0].quantity).toBe(3);
  });

  it('decrements quantity when - clicked', () => {
    const store = makeStore([drinkItem]);
    render(
      <Provider store={store}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('decrease-qty'));
    expect(store.getState().cart.items[0].quantity).toBe(1);
  });

  it('removes item when quantity reaches 0', () => {
    const singleDrink: CartItem = { ...drinkItem, quantity: 1 };
    const store = makeStore([singleDrink]);
    render(
      <Provider store={store}>
        <CartItemRow item={singleDrink} />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('decrease-qty'));
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it('removes item on trash click', () => {
    const store = makeStore([drinkItem]);
    render(
      <Provider store={store}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('remove-item'));
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it('shows correct line total (unitPrice × quantity)', () => {
    render(
      <Provider store={makeStore([drinkItem])}>
        <CartItemRow item={drinkItem} />
      </Provider>
    );
    // 5.0 × 2 = $10.00
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('shows special instructions when present', () => {
    const itemWithNote: CartItem = {
      ...foodItem,
      specialInstructions: 'No nuts please',
    };
    render(
      <Provider store={makeStore([itemWithNote])}>
        <CartItemRow item={itemWithNote} />
      </Provider>
    );
    expect(screen.getByText(/No nuts please/)).toBeInTheDocument();
  });

  it('does not show instructions section when empty', () => {
    render(
      <Provider store={makeStore([foodItem])}>
        <CartItemRow item={foodItem} />
      </Provider>
    );
    expect(screen.queryByText(/📝/)).not.toBeInTheDocument();
  });
});

// ── ReceiptModal tests ────────────────────────────────────
const receipt: Receipt = {
  items: [drinkItem, foodItem],
  subtotal: 13.5,
  serviceCharge: 1.35,
  total: 14.85,
  timestamp: new Date('2024-01-15T10:30:00').toISOString(),
};

describe('ReceiptModal', () => {
  it('renders as a dialog', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows all item names', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

  it('shows subtotal', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByTestId('receipt-subtotal')).toHaveTextContent('$13.50');
  });

  it('shows service charge', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByTestId('receipt-service')).toHaveTextContent('$1.35');
  });

  it('shows grand total', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByTestId('receipt-total')).toHaveTextContent('$14.85');
  });

  it('shows item quantities', () => {
    render(
      <Provider store={makeStore()}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    expect(screen.getByText(/×2/)).toBeInTheDocument();
    expect(screen.getByText(/×1/)).toBeInTheDocument();
  });

  it('clears receipt when Done button clicked', () => {
    const store = configureStore({
      reducer: { cart: cartReducer, menu: menuReducer },
      preloadedState: { cart: { items: [], receipt } },
    });
    render(
      <Provider store={store}>
        <ReceiptModal receipt={receipt} />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('close-receipt-btn'));
    expect(store.getState().cart.receipt).toBeNull();
  });
});

// ── Integration: add → cart flow ──────────────────────────
describe('Cart integration', () => {
  it('adds two different products correctly', () => {
    const store = makeStore();
    store.dispatch(addToCart({ product: foodProduct, selectedOptions: {}, quantity: 1 }));
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Large' }, quantity: 1 }));
    const { items } = store.getState().cart;
    expect(items).toHaveLength(2);
  });

  it('same product same options accumulates quantity', () => {
    const store = makeStore();
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Medium' }, quantity: 1 }));
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Medium' }, quantity: 1 }));
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0].quantity).toBe(2);
  });

  it('same product different sizes are separate entries', () => {
    const store = makeStore();
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Small' }, quantity: 1 }));
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Large' }, quantity: 1 }));
    expect(store.getState().cart.items).toHaveLength(2);
  });

  it('large size price is 25% more than base', () => {
    const store = makeStore();
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Large' }, quantity: 1 }));
    expect(store.getState().cart.items[0].unitPrice).toBeCloseTo(5.0 * 1.25, 2);
  });

  it('small size price is 20% less than base', () => {
    const store = makeStore();
    store.dispatch(addToCart({ product: drinkProduct, selectedOptions: { size: 'Small' }, quantity: 1 }));
    expect(store.getState().cart.items[0].unitPrice).toBeCloseTo(5.0 * 0.8, 2);
  });
});