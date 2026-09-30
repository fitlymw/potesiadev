export interface Product {
  id: string;
  name: string;
  type: string;
  lore: string;
  features: string[];
  passive: {
    stat: string;
    value: string;
  };
  careInstructions: string[];
  images: string[];
  price?: number;
  sizes?: string[];
}

export interface Collection {
  id: string;
  name: string;
  itemCount: number;
  image: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
