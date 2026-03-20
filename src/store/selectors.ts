import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { filterProducts } from '../utils';
import { Product } from '../types';

const selectMenuItems = (state: RootState) => state.menu.items;
const selectSearchQuery = (state: RootState) => state.menu.searchQuery;
const selectSortField = (state: RootState) => state.menu.sortField;
const selectSortOrder = (state: RootState) => state.menu.sortOrder;

export const selectFilteredSortedProducts = createSelector(
  [selectMenuItems, selectSearchQuery, selectSortField, selectSortOrder],
  (items, query, sortField, sortOrder) => {
    const filtered = filterProducts(items, query);
    const sorted = [...filtered].sort((a: Product, b: Product) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }
);

export const selectCartItemCount = createSelector(
  (state: RootState) => state.cart.items,
  (items) => items.reduce((sum, i) => sum + i.quantity, 0)
);

export const selectCartSubtotal = createSelector(
  (state: RootState) => state.cart.items,
  (items) => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
);