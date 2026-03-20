import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, SortField, SortOrder } from '../types';
import { deduplicateProducts } from '../utils';

interface MockAPIProduct {
  id?: string | number;
  _id?: string | number;
  title: string;
  price: number | string;
  category: string;
  description: string;
  thumbnail: string;
  ingredients: string;
  allergens: string;
  isDrink: boolean | string;
  nutriScore: string;
  customizations?: Record<string, string[]>;
}

export const fetchMenuItems = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'menu/fetchMenuItems',
  async (_, { rejectWithValue }) => {
    try {
      const url = 'https://69bd4da62bc2a25b22ae34fa.mockapi.io/products';
      const response = await fetch(url);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: MockAPIProduct[] = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return rejectWithValue('No products found.');
      }

      const mapped: Product[] = data.map((p, index) => {
        // Try every possible id field MockAPI might use
        const rawId = p.id ?? p._id ?? index + 1;
        const id = String(rawId);

        return {
          id,
          title: p.title ?? 'Unnamed',
          price: Number(p.price),
          category: p.category ?? '',
          description: p.description ?? '',
          thumbnail: p.thumbnail ?? '',
          ingredients: p.ingredients ?? 'Not listed',
          allergens: p.allergens ?? 'None listed',
          isDrink: p.isDrink === true || p.isDrink === 'true',
          nutriScore: p.nutriScore ?? 'c',
          customizations: p.customizations ?? {},
        };
      });

      return deduplicateProducts(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(`Failed to fetch menu: ${message}`);
    }
  }
);

interface MenuState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

const initialState: MenuState = {
  items: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  sortField: 'title',
  sortOrder: 'asc',
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortField(state, action: PayloadAction<SortField>) {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortOrder = 'asc';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { setSearchQuery, setSortField } = menuSlice.actions;
export default menuSlice.reducer;