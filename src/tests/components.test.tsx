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

vi.mock('@ionic/react', () => {
  const React = require('react');
  const p = (tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement(tag, props, children);
  return {
    IonItem: p('div'), IonLabel: p('span'), IonNote: p('span'),
    IonButton: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; [k: string]: unknown }>) =>
      React.createElement('button', { onClick, ...props }, children),
    IonButtons: p('div'), IonIcon: () => React.createElement('span'),
    IonThumbnail: p('div'),
    IonImg: ({ alt, src }: { alt: string; src: string }) => React.createElement('img', { alt, src }),
    IonBadge: p('span'),
    IonModal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
      isOpen ? React.createElement('div', { role: 'dialog' }, children) : null,
    IonHeader: p('div'), IonToolbar: p('div'), IonTitle: p('h2'),
    IonContent: p('div'), IonFooter: p('div'), IonList: p('ul'),
  };
});

const drinkProduct: Product = { id: 1, title: 'Latte', price: 5.0, category: 'beverages', description: '', thumbnail: 'img.jpg', isDrink: true };
const foodProduct: Product = { id: 2, title: 'Croissant', price: 3.5, category: 'pastries', description: '', thumbnail: 'img2.jpg', isDrink: false };
const drinkItem: CartItem = { cartItemId: '1-Medium', product: drinkProduct, quantity: 2, size: 'Medium', unitPrice: 5.0 };
const foodItem: CartItem = { cartItemId: '2', product: foodProduct, quantity: 1, size: undefined, unitPrice: 3.5 };

const makeStore = (items: CartItem[] = []) =>
  configureStore({ reducer: { cart: cartReducer, menu: menuReducer }, preloadedState: { cart: { items, receipt: null } } });

describe('CartItemRow', () => {
  it('renders product title', () => {
    render(<Provider store={makeStore([drinkItem])}><CartItemRow item={drinkItem} /></Provider>);
    expect(screen.getByText('Latte')).toBeInTheDocument();
  });
  it('shows size badge for drinks', () => {
    render(<Provider store={makeStore([drinkItem])}><CartItemRow item={drinkItem} /></Provider>);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
  it('no size badge for food', () => {
    render(<Provider store={makeStore([foodItem])}><CartItemRow item={foodItem} /></Provider>);
    expect(screen.queryByText('Medium')).not.toBeInTheDocument();
  });
  it('shows quantity', () => {
    render(<Provider store={makeStore([drinkItem])}><CartItemRow item={drinkItem} /></Provider>);
    expect(screen.getByTestId('qty-display')).toHaveTextContent('2');
  });
  it('increments quantity', () => {
    const store = makeStore([drinkItem]);
    render(<Provider store={store}><CartItemRow item={drinkItem} /></Provider>);
    fireEvent.click(screen.getByTestId('increase-qty'));
    expect(store.getState().cart.items[0].quantity).toBe(3);
  });
  it('removes item on trash click', () => {
    const store = makeStore([drinkItem]);
    render(<Provider store={store}><CartItemRow item={drinkItem} /></Provider>);
    fireEvent.click(screen.getByTestId('remove-item'));
    expect(store.getState().cart.items).toHaveLength(0);
  });
  it('shows correct line total', () => {
    render(<Provider store={makeStore([drinkItem])}><CartItemRow item={drinkItem} /></Provider>);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});

const receipt: Receipt = {
  items: [drinkItem, foodItem], subtotal: 13.5,
  serviceCharge: 1.35, total: 14.85,
  timestamp: new Date('2024-01-15T10:30:00').toISOString(),
};

describe('ReceiptModal', () => {
  it('renders as dialog', () => {
    render(<Provider store={makeStore()}><ReceiptModal receipt={receipt} /></Provider>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('shows item names', () => {
    render(<Provider store={makeStore()}><ReceiptModal receipt={receipt} /></Provider>);
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });
  it('shows subtotal', () => {
    render(<Provider store={makeStore()}><ReceiptModal receipt={receipt} /></Provider>);
    expect(screen.getByTestId('receipt-subtotal')).toHaveTextContent('$13.50');
  });
  it('shows grand total', () => {
    render(<Provider store={makeStore()}><ReceiptModal receipt={receipt} /></Provider>);
    expect(screen.getByTestId('receipt-total')).toHaveTextContent('$14.85');
  });
  it('clears receipt on Done click', () => {
    const store = configureStore({ reducer: { cart: cartReducer, menu: menuReducer }, preloadedState: { cart: { items: [], receipt } } });
    render(<Provider store={store}><ReceiptModal receipt={receipt} /></Provider>);
    fireEvent.click(screen.getByTestId('close-receipt-btn'));
    expect(store.getState().cart.receipt).toBeNull();
  });
});