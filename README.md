
# Pluto Brew - A Firebase Studio Project

This is a Next.js starter project for a craft beer marketplace called "Pluto Brew", created in Firebase Studio. It features a customer-facing marketplace and an admin dashboard for managing products, orders, users, and locations.

This project is configured as a **static site**, which means it can be deployed entirely on the **Firebase Hosting free tier**.

## Key Features

- **Marketplace:** Browse and search for products.
- **Shopping Cart:** Add/remove items and update quantities.
- **User Authentication:** Login/registration for customers and admins.
- **Admin Dashboard:** A separate, protected area for store management.
- **Firestore Integration:** Uses Firestore for data storage, with initial data seeding.
- **File Uploads:** Local file uploads for product images to the `/public` directory.
- **Responsive Design:** Works on desktop and mobile browsers.

## Deployment

This application is pre-configured for deployment with **Firebase Hosting**. For a complete step-by-step guide, please see the **[DEPLOYMENT.md](./DEPLOYMENT.md)** file.

## Mobile Access

This is a responsive web application, not a native mobile app. It is designed to be accessed through a web browser on any device, including mobile phones.

- **Browser Access:** The primary way for mobile users to access the app is by navigating to your public website URL on their phone's browser. The user interface will adapt to the smaller screen size.

### Creating a Native-Like Mobile App (APK)

If you need to distribute your app as a native `.apk` file for Android, you can do so by "wrapping" this web application.

- **Wrapper Technology:** You would use a tool like [Capacitor](https://capacitorjs.com/). Capacitor takes your existing web app and bundles it inside a native mobile application shell. This allows you to submit it to app stores or distribute the APK directly.
- **Real-time Updates Will Work:** The wrapped app is still your web app. It connects to the exact same Firebase backend. This means that any data changes (like an order status update) will be pushed in real-time to all connected clients—whether they are using the website on a desktop, a mobile browser, or the wrapped native app. The experience is seamless across all platforms.

## Raspberry Pi Integration

You can connect this application to a Raspberry Pi to trigger real-world actions (e.g., lighting an LED when an order is shipped). For detailed instructions, please see the **[RASPBERRY_PI.md](./RASPBERRY_PI.md)** guide.
