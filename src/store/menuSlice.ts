import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, SortField, SortOrder } from '../types';
import { deduplicateProducts, isDrinkCategory } from '../utils';

interface DummyProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  thumbnail: string;
}

interface DummyResponse {
  products: DummyProduct[];
}

export const fetchMenuItems = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'menu/fetchMenuItems',
  async (_, { rejectWithValue }) => {
    try {
      const categories = ['groceries', 'beverages'];
      const requests = categories.map((cat) =>
        fetch(`https://dummyjson.com/products/category/${cat}?limit=20`)
      );
      requests.push(fetch('https://dummyjson.com/products?limit=50&skip=0'));

      const responses = await Promise.all(requests);
      const jsonResults: DummyResponse[] = await Promise.all(responses.map((r) => r.json()));

      const allProducts: DummyProduct[] = jsonResults.flatMap((r) => r.products ?? []);

      const mapped: Product[] = allProducts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        description: p.description,
        thumbnail: p.thumbnail,
        isDrink: isDrinkCategory(p.category),
      }));

      return deduplicateProducts(mapped);
    } catch (err) {
      return rejectWithValue('Failed to fetch menu items. Please try again.');
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