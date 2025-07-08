import type { Product, User, Order, Location } from './types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Heineken', description: 'A classic pale lager with a mild, slightly bitter taste.', price: 4.99, imageUrl: 'https://placehold.co/600x600.png', stock: 150, category: 'Lager', 'data-ai-hint': 'heineken bottle' },
  { id: '2', name: 'Guinness Draught', description: 'A legendary Irish dry stout, rich and creamy with a smooth finish.', price: 5.49, imageUrl: 'https://placehold.co/600x600.png', stock: 100, category: 'Stout', 'data-ai-hint': 'guinness glass' },
  { id: '3', name: 'Corona Extra', description: 'A refreshing Mexican lager, perfect with a slice of lime.', price: 4.50, imageUrl: 'https://placehold.co/600x600.png', stock: 200, category: 'Lager', 'data-ai-hint': 'corona bottle' },
  { id: '4', name: 'Stella Artois', description: 'A classic Belgian pilsner with a well-balanced, floral hop aroma.', price: 5.25, imageUrl: 'https://placehold.co/600x600.png', stock: 120, category: 'Pilsner', 'data-ai-hint': 'stella bottle' },
  { id: '5', name: 'Blue Moon', description: 'A Belgian-style witbier, brewed with Valencia orange peel for a subtle sweetness.', price: 6.99, imageUrl: 'https://placehold.co/600x600.png', stock: 90, category: 'Witbier', 'data-ai-hint': 'blue moon glass' },
  { id: '6', name: 'Lagunitas IPA', description: 'A well-rounded, highly drinkable IPA with a bit of caramel malt barley.', price: 6.50, imageUrl: 'https://placehold.co/600x600.png', stock: 80, category: 'IPA', 'data-ai-hint': 'ipa beer' },
  { id: '7', name: 'Sierra Nevada Pale Ale', description: 'A delightful example of a classic American pale ale with pine and citrus notes.', price: 6.00, imageUrl: 'https://placehold.co/600x600.png', stock: 85, category: 'Pale Ale', 'data-ai-hint': 'pale ale can' },
  { id: '8', name: 'Budweiser', description: 'An American-style pale lager, known for its crisp, clean taste.', price: 3.99, imageUrl: 'https://placehold.co/600x600.png', stock: 250, category: 'Lager', 'data-ai-hint': 'budweiser bottle' },
];

export let mockUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@plutobrew.com', password: 'admin', role: 'admin'},
    { id: '2', name: 'Customer One', email: 'customer1@example.com', password: 'password', role: 'customer' },
    { id: '3', name: 'Customer Two', email: 'customer2@example.com', password: 'password', role: 'customer' },
];

export const mockOrders: Order[] = [
    { id: 'PB-1001', userId: '2', items: [{...mockProducts[0], quantity: 2}, {...mockProducts[2], quantity: 1}], total: 14.48, status: 'Delivered', orderDate: '2023-10-26', deliveryAddress: '123 Main St, Anytown USA' },
    { id: 'PB-1002', userId: '3', items: [{...mockProducts[4], quantity: 4}], total: 27.96, status: 'Shipped', orderDate: '2023-10-28', deliveryAddress: '456 Oak Ave, Anytown USA' },
    { id: 'PB-1003', userId: '2', items: [{...mockProducts[1], quantity: 1}, {...mockProducts[3], quantity: 2}], total: 15.99, status: 'Processing', orderDate: '2023-11-01', deliveryAddress: '123 Main St, Anytown USA' },
    { id: 'PB-1004', userId: '3', items: [{...mockProducts[6], quantity: 2}], total: 12.00, status: 'Pending', orderDate: '2023-11-02', deliveryAddress: '456 Oak Ave, Anytown USA' },
];

export const mockLocations: Location[] = [
    { id: '1', name: 'Pluto Brew Karlsruhe', lat: 49.0069, lng: 8.4037 },
    { id: '2', name: 'Pluto Brew Berlin', lat: 52.5200, lng: 13.4050 },
    { id: '3', name: 'Pluto Brew Munich', lat: 48.1351, lng: 11.5820 },
    { id: '4', name: 'Pluto Brew Hamburg', lat: 53.5511, lng: 9.9937 },
    { id: '5', name: 'Pluto Brew Cologne', lat: 50.9375, lng: 6.9603 },
]
