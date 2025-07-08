
export interface SavedAddress {
  id: string;
  alias: string;
  address: string;
  lat: number;
  lng: number;
}

export interface User {
  id:string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  role: 'customer' | 'admin';
  savedAddresses?: SavedAddress[];
}

export type NewUser = Omit<User, 'id'>;
export type UpdateUser = Partial<Omit<User, 'id' | 'email'>>; // Prevent email from being changed in this flow

export interface Product {
  id: string;
  name:string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  category: string;
  'data-ai-hint'?: string;
}

export type NewProduct = Omit<Product, 'id'>;
export type UpdateProduct = Partial<NewProduct>;

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
  sourceStoreId?: string;
}

export type NewOrder = Omit<Order, 'id'>;

export interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export type NewLocation = Omit<Location, 'id'>;
export type UpdateLocation = Partial<NewLocation>;


export interface LocationInfo {
  type: 'pickup' | 'delivery';
  address: string;
  location: Location;
  addressId?: string;
}
