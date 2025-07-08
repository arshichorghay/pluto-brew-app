
'use client';

import type { User, Order, Location, OrderStatus } from './types';
import { mockUsers as defaultUsers, mockOrders as defaultOrders, mockLocations as defaultLocations } from './mock-data-defaults';

const USERS_KEY = 'pluto-brew-users';
const ORDERS_KEY = 'pluto-brew-orders';
const LOCATIONS_KEY = 'pluto-brew-locations';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        } else {
            setToStorage(key, defaultValue);
            return defaultValue;
        }
    } catch (error) {
        console.warn(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setToStorage = <T>(key: string, value: T) => {
    if (typeof window === 'undefined') {
        console.warn(`Tried to set localStorage key “${key}” on the server.`);
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// --- Users ---
export const getUsers = (): User[] => getFromStorage(USERS_KEY, defaultUsers);
export const saveUsers = (users: User[]) => setToStorage(USERS_KEY, users);

export const addUser = (user: User): User => {
    const users = getUsers();
    if (users.some(u => u.email === user.email)) {
        throw new Error("User with this email already exists.");
    }
    const updatedUsers = [...users, user];
    saveUsers(updatedUsers);
    return user;
};

export const findUserByCredentials = (email: string, password?: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.email === email && u.password === password);
}


// --- Orders ---
export const getOrders = (): Order[] => getFromStorage(ORDERS_KEY, defaultOrders);
export const saveOrders = (orders: Order[]) => setToStorage(ORDERS_KEY, orders);

export const addOrder = (order: Order): Order => {
    const orders = getOrders();
    const updatedOrders = [order, ...orders];
    saveOrders(updatedOrders);
    return order;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): Order | undefined => {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = status;
        saveOrders(orders);
        
        fetch('/api/webhook/order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, newStatus: status }),
        }).catch(error => console.error('Failed to call webhook', error));

        return orders[orderIndex];
    }
    return undefined;
};


// --- Locations ---
export const getLocations = (): Location[] => getFromStorage(LOCATIONS_KEY, defaultLocations);
