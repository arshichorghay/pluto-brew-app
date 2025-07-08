export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  'data-ai-hint'?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
}

export interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
}
