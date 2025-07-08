
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  writeBatch,
  setDoc,
} from 'firebase/firestore';

import type { User, Order, Location, OrderStatus, NewUser, NewOrder } from './types';
import { mockUsers as defaultUsers, mockOrders as defaultOrders, mockLocations as defaultLocations } from './mock-data-defaults';

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';
const LOCATIONS_COLLECTION = 'locations';

// Helper function to seed data if a collection is empty
const seedCollection = async <T extends {id: string}>(collectionName: string, defaultData: T[]) => {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty && defaultData.length > 0) {
        console.log(`Seeding ${collectionName}...`);
        const batch = writeBatch(db);
        defaultData.forEach((item) => {
            const docRef = doc(db, collectionName, item.id); // Use the mock data ID
            batch.set(docRef, item);
        });
        await batch.commit();
        console.log(`${collectionName} seeded.`);
    }
};


// Seed all necessary collections
const seedDatabase = async () => {
    try {
        await Promise.all([
            seedCollection<User>(USERS_COLLECTION, defaultUsers),
            seedCollection<Location>(LOCATIONS_COLLECTION, defaultLocations),
            seedCollection<Order>(ORDERS_COLLECTION, defaultOrders)
        ]);
    } catch (e) {
        console.error("Error seeding database: ", e);
    }
};

seedDatabase();

// --- Users ---
export const getUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, USERS_COLLECTION);
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
};

export const addUser = async (user: NewUser): Promise<User> => {
    const usersCol = collection(db, USERS_COLLECTION);
     // Check if user already exists
    const q = query(usersCol, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error("User with this email already exists.");
    }
    const docRef = await addDoc(usersCol, user);
    return { ...user, id: docRef.id };
};

export const findUserByCredentials = async (email: string, password?: string): Promise<User | undefined> => {
    const usersCol = collection(db, USERS_COLLECTION);
    const q = query(usersCol, where("email", "==", email), where("password", "==", password));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return undefined;
    }
    const userDoc = userSnapshot.docs[0];
    return { ...userDoc.data(), id: userDoc.id } as User;
}

// --- Orders ---
export const getOrders = async (): Promise<Order[]> => {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const orderSnapshot = await getDocs(ordersCol);
    const orders = orderSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const addOrder = async (order: NewOrder): Promise<Order> => {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(ordersCol, order);
    return { ...order, id: docRef.id };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | undefined> => {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status: status });
    
    fetch('/api/webhook/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus: status }),
    }).catch(error => console.error('Failed to call webhook', error));

    const orders = await getOrders();
    return orders.find(o => o.id === orderId);
};


// --- Locations ---
export const getLocations = async (): Promise<Location[]> => {
    const locationsCol = collection(db, LOCATIONS_COLLECTION);
    const locationSnapshot = await getDocs(locationsCol);
    return locationSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Location));
};
