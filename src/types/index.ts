export type DrinkSize = 'Small' | 'Medium' | 'Large';

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  thumbnail: string;
  isDrink: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  size?: DrinkSize;
  unitPrice: number;
}

export interface Receipt {
  items: CartItem[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  timestamp: string;
}

export type SortField = 'title' | 'price' | 'category';
export type SortOrder = 'asc' | 'desc';