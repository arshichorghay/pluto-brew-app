
import type { Product, User, Order, Location } from './types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Heineken', description: 'A classic pale lager with a mild, slightly bitter taste.', price: 4.99, imageUrl: '/products/heineken.png', stock: 150, category: 'Lager', 'data-ai-hint': 'heineken beer bottle' },
  { id: '2', name: 'Guinness Draught', description: 'A legendary Irish dry stout, rich and creamy with a smooth finish.', price: 5.49, imageUrl: '/products/guinness.png', stock: 100, category: 'Stout', 'data-ai-hint': 'guinness beer glass' },
  { id: '3', name: 'Corona Extra', description: 'A refreshing Mexican lager, perfect with a slice of lime.', price: 4.50, imageUrl: '/products/corona.png', stock: 200, category: 'Lager', 'data-ai-hint': 'corona beer bottle' },
  { id: '4', name: 'Stella Artois', description: 'A classic Belgian pilsner with a well-balanced, floral hop aroma.', price: 5.25, imageUrl: '/products/stella.png', stock: 120, category: 'Pilsner', 'data-ai-hint': 'stella artois bottle' },
  { id: '5', name: 'Blue Moon', description: 'A Belgian-style witbier, brewed with Valencia orange peel for a subtle sweetness.', price: 6.99, imageUrl: '/products/bluemoon.png', stock: 90, category: 'Witbier', 'data-ai-hint': 'blue moon beer glass' },
  { id: '6', name: 'Lagunitas IPA', description: 'A well-rounded, highly drinkable IPA with a bit of caramel malt barley.', price: 6.50, imageUrl: '/products/lagunitas.png', stock: 80, category: 'IPA', 'data-ai-hint': 'lagunitas ipa bottle' },
  { id: '7', name: 'Sierra Nevada Pale Ale', description: 'A delightful example of a classic American pale ale with pine and citrus notes.', price: 6.00, imageUrl: '/products/sierranevada.png', stock: 85, category: 'Pale Ale', 'data-ai-hint': 'sierra nevada can' },
  { id: '8', name: 'Budweiser', description: 'An American-style pale lager, known for its crisp, clean taste.', price: 3.99, imageUrl: '/products/budweiser.png', stock: 250, category: 'Lager', 'data-ai-hint': 'budweiser beer bottle' },
];

export const mockUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@plutobrew.com', password: 'admin', role: 'admin'},
    { 
      id: '2', 
      name: 'Customer One', 
      email: 'customer1@example.com', 
      password: 'password', 
      role: 'customer',
      savedAddresses: [
        { id: 'addr_home_1', alias: 'Home', address: 'Karl-Wilhelm-Straße 1, 76131 Karlsruhe, Germany', lat: 49.0118, lng: 8.4063 },
        { id: 'addr_work_1', alias: 'Work', address: 'Hertzstraße 16, 76187 Karlsruhe, Germany', lat: 49.024, lng: 8.355 }
      ]
    },
    { id: '3', name: 'Customer Two', email: 'customer2@example.com', password: 'password', role: 'customer' },
];

export const mockOrders: Order[] = [
    { id: 'PB-1001', userId: '2', items: [{...mockProducts[0], quantity: 2}, {...mockProducts[2], quantity: 1}], total: 14.48, status: 'Delivered', orderDate: '2023-10-26', deliveryAddress: '123 Main St, Anytown USA', sourceStoreId: '1' },
    { id: 'PB-1002', userId: '3', items: [{...mockProducts[4], quantity: 4}], total: 27.96, status: 'Shipped', orderDate: '2023-10-28', deliveryAddress: '456 Oak Ave, Anytown USA', sourceStoreId: '2' },
    { id: 'PB-1003', userId: '2', items: [{...mockProducts[1], quantity: 1}, {...mockProducts[3], quantity: 2}], total: 15.99, status: 'Processing', orderDate: '2023-11-01', deliveryAddress: '123 Main St, Anytown USA', sourceStoreId: '1' },
    { id: 'PB-1004', userId: '3', items: [{...mockProducts[6], quantity: 2}], total: 12.00, status: 'Pending', orderDate: '2023-11-02', deliveryAddress: '456 Oak Ave, Anytown USA', sourceStoreId: '3' },
];

export const mockLocations: Location[] = [
    { id: '1', name: 'Pluto Brew - Innenstadt', lat: 49.0093, lng: 8.4044 },
    { id: '2', name: 'Pluto Brew - Weststadt', lat: 49.011, lng: 8.380 },
    { id: '3', name: 'Pluto Brew - Oststadt', lat: 49.010, lng: 8.425 },
    { id: '4', name: 'Pluto Brew - Südstadt', lat: 49.000, lng: 8.404 },
    { id: '5', name: 'Pluto Brew - Durlach', lat: 48.998, lng: 8.473 },
    { id: '6', name: 'Pluto Brew - KIT Campus', lat: 49.00937, lng: 8.41656 },
]
