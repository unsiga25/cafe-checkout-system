export type DrinkSize = 'Small' | 'Medium' | 'Large';
export type TemperatureOption = 'Hot' | 'Iced';
export type MilkOption = 'None' | 'Whole' | 'Oat' | 'Almond' | 'Soy';
export type SugarLevel = 'None' | 'Less' | 'Normal' | 'Extra';

export interface ProductCustomization {
  size?: DrinkSize;
  temperature?: TemperatureOption;
  milk?: MilkOption;
  sugarLevel?: SugarLevel;
  quantity: number;
  specialInstructions: string;
}

export interface Product {
  id: string;           // barcode / code from OFF
  title: string;
  price: number;        // derived from nutriScore or fixed fallback
  category: string;
  description: string;
  thumbnail: string;
  ingredients: string;
  allergens: string;
  isDrink: boolean;
  nutriScore: string;   // a/b/c/d/e
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  size?: DrinkSize;
  temperature?: TemperatureOption;
  milk?: MilkOption;
  sugarLevel?: SugarLevel;
  specialInstructions?: string;
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