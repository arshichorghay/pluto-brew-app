import type { Product, User, Order, Location } from './types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Cosmic IPA', description: 'A hoppy IPA with notes of citrus and pine, brewed with galaxy hops.', price: 5.99, imageUrl: 'https://placehold.co/600x600.png', stock: 100, category: 'IPA', 'data-ai-hint': 'beer can' },
  { id: '2', name: 'Stardust Stout', description: 'A rich and creamy stout with a hint of chocolate and coffee.', price: 6.49, imageUrl: 'https://placehold.co/600x600.png', stock: 80, category: 'Stout', 'data-ai-hint': 'beer can' },
  { id: '3', name: 'Meteor Mead', description: 'A light and refreshing mead, perfect for a summer evening.', price: 7.99, imageUrl: 'https://placehold.co/600x600.png', stock: 120, category: 'Mead', 'data-ai-hint': 'beer bottle' },
  { id: '4', name: 'Galaxy Gose', description: 'A tart and salty gose that is out of this world.', price: 4.99, imageUrl: 'https://placehold.co/600x600.png', stock: 60, category: 'Gose', 'data-ai-hint': 'beer can' },
  { id: '5', name: 'Nebula Nectar', description: 'A hazy New England IPA bursting with tropical fruit flavors.', price: 6.99, imageUrl: 'https://placehold.co/600x600.png', stock: 90, category: 'IPA', 'data-ai-hint': 'beer can' },
  { id: '6', name: 'Pulsar Pilsner', description: 'A crisp and clean pilsner with a noble hop character.', price: 4.50, imageUrl: 'https://placehold.co/600x600.png', stock: 150, category: 'Pilsner', 'data-ai-hint': 'beer bottle' },
  { id: '7', name: 'Quasar Kolsch', description: 'A light and easy-drinking Kolsch style ale.', price: 5.25, imageUrl: 'https://placehold.co/600x600.png', stock: 75, category: 'Kolsch', 'data-ai-hint': 'beer glass' },
  { id: '8', name: 'Solaris Saison', description: 'A spicy and fruity saison with a dry finish.', price: 6.00, imageUrl: 'https://placehold.co/600x600.png', stock: 85, category: 'Saison', 'data-ai-hint': 'beer bottle' },
];

export const mockUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@plutobrew.com', role: 'admin'},
    { id: '2', name: 'Customer One', email: 'customer1@example.com', role: 'customer' },
    { id: '3', name: 'Customer Two', email: 'customer2@example.com', role: 'customer' },
];

export const mockOrders: Order[] = [
    { id: 'PB-1001', userId: '2', items: [{...mockProducts[0], quantity: 2}, {...mockProducts[2], quantity: 1}], total: 19.97, status: 'Delivered', orderDate: '2023-10-26', deliveryAddress: '123 Space St, Moon City' },
    { id: 'PB-1002', userId: '3', items: [{...mockProducts[4], quantity: 4}], total: 27.96, status: 'Shipped', orderDate: '2023-10-28', deliveryAddress: '456 Star Ave, Jupiter Town' },
    { id: 'PB-1003', userId: '2', items: [{...mockProducts[1], quantity: 1}, {...mockProducts[3], quantity: 2}], total: 16.47, status: 'Processing', orderDate: '2023-11-01', deliveryAddress: '123 Space St, Moon City' },
    { id: 'PB-1004', userId: '3', items: [{...mockProducts[6], quantity: 6}], total: 31.50, status: 'Pending', orderDate: '2023-11-02', deliveryAddress: '456 Star Ave, Jupiter Town' },
];

export const mockLocations: Location[] = [
    { id: '1', name: 'Pluto Brew Karlsruhe', lat: 49.0069, lng: 8.4037 },
    { id: '2', name: 'Pluto Brew Berlin', lat: 52.5200, lng: 13.4050 },
    { id: '3', name: 'Pluto Brew Munich', lat: 48.1351, lng: 11.5820 },
    { id: '4', name: 'Pluto Brew Hamburg', lat: 53.5511, lng: 9.9937 },
    { id: '5', name: 'Pluto Brew Cologne', lat: 50.9375, lng: 6.9603 },
]
