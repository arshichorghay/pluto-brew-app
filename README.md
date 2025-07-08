# Pluto Brew - A Firebase Studio Project

This is a Next.js starter project for a craft beer marketplace called "Pluto Brew", created in Firebase Studio. It features a customer-facing marketplace and an admin dashboard for managing products, orders, users, and locations.

## Key Features

- **Marketplace:** Browse and search for products.
- **Shopping Cart:** Add/remove items and update quantities.
- **User Authentication:** Login/registration for customers and admins.
- **Admin Dashboard:** A separate, protected area for store management.
- **Firestore Integration:** Uses Firestore for data storage, with initial data seeding.
- **File Uploads:** Local file uploads for product images to the `/public` directory.
- **Responsive Design:** Works on desktop and mobile browsers.

## Getting Started

To get started with development:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js app on [http://localhost:3000](http://localhost:3000).

## Deployment

This application is pre-configured for deployment with **Firebase App Hosting**.

1.  **Connect to GitHub:** Create a repository on GitHub and push your code to it.
2.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
3.  **Set up App Hosting:** In your Firebase project, go to the "App Hosting" section and follow the setup wizard to connect your GitHub repository.
4.  **Deploy:** Once connected, every push to your main branch will automatically trigger a build and deploy your application. You will be given a public URL to access your live website.

## Mobile Access

This is a responsive web application, not a native mobile app. It is designed to be accessed through a web browser on any device, including mobile phones.

- **No APK/App Store:** You do not need to create an `.apk` or go through the app store submission process.
- **Browser Access:** Users can simply navigate to your public website URL on their phone's browser. The user interface will adapt to the smaller screen size.

## Raspberry Pi Integration

You can connect this application to a Raspberry Pi to trigger real-world actions (e.g., lighting an LED when an order is shipped). For detailed instructions, please see the **[RASPBERRY_PI.md](./RASPBERRY_PI.md)** guide.
