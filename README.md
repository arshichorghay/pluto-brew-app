
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

## Deployment: Step-by-Step Guide

This application is pre-configured for deployment with **Firebase Hosting**. Follow these steps to get your site live on the internet.

### Prerequisites

*   A [Firebase](https://console.firebase.google.com/) account.
*   The Firebase CLI installed on your machine: `npm install -g firebase-tools`.
*   A Google Cloud account to get a Google Maps API Key.

### Step 1: Set Up Environment Variables

This project requires API keys to connect to Firebase and Google Maps.

1.  **Create the file:** In the root of the project, create a new file named `.env.local`.
2.  **Copy the template:** Copy the contents of the `.env.example` file and paste them into your new `.env.local` file.
3.  **Fill in the values:**
    *   Find your Firebase credentials in your **Firebase Project Settings** > **General**.
    *   Find your Google Maps API key in the **Google Cloud Console**. You will need to enable the "Maps JavaScript API" and "Places API" for your project.
    *   Fill in the placeholder values in `.env.local` with your actual keys. The `.gitignore` file is already configured to keep this file from being committed to your repository.

### Step 2: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give your project a name (e.g., `pluto-brew-app`).
3.  Continue through the setup steps. You can disable Google Analytics for this project if you don't need it.
4.  Once created, **upgrade your project to the "Blaze" (Pay-as-you-go) plan.** This is required to deploy server-side rendered apps like this Next.js project. You still benefit from a generous free tier.

### Step 3: Connect Your Local Project to Firebase

1.  **Login to Firebase:** In your project terminal, run the following command and follow the prompts to log in to your Google account:
    ```bash
    firebase login
    ```
2.  **Set the Project:** This project includes a `.firebaserc` file. Open it and change the `default` project ID from `pluto-brew-app` to your actual Firebase Project ID. You can find this in your Firebase Project Settings.
    ```json
    {
      "projects": {
        "default": "YOUR-FIREBASE-PROJECT-ID"
      }
    }
    ```

### Step 4: Deploy to Firebase Hosting

1.  **Run Locally (Optional):** To test before deploying, make sure you have your `.env.local` file set up, then run:
    ```bash
    npm install
    npm run dev
    ```
2.  **Build the Project:** Create a production build of your Next.js application:
    ```bash
    npm run build
    ```
3.  **Deploy:** Now, deploy the project to Firebase Hosting:
    ```bash
    firebase deploy --only hosting
    ```

That's it! The Firebase CLI will build and deploy your Next.js app. When it's finished, it will provide you with a live, public URL for your website. Every time you want to update your live site, just run `npm run build` and `firebase deploy --only hosting` again.

## Mobile Access

This is a responsive web application, not a native mobile app. It is designed to be accessed through a web browser on any device, including mobile phones.

- **Browser Access:** The primary way for mobile users to access the app is by navigating to your public website URL on their phone's browser. The user interface will adapt to the smaller screen size.

### Creating a Native-Like Mobile App (APK)

If you need to distribute your app as a native `.apk` file for Android, you can do so by "wrapping" this web application.

- **Wrapper Technology:** You would use a tool like [Capacitor](https://capacitorjs.com/). Capacitor takes your existing web app and bundles it inside a native mobile application shell. This allows you to submit it to app stores or distribute the APK directly.
- **Real-time Updates Will Work:** The wrapped app is still your web app. It connects to the exact same Firebase backend. This means that any data changes (like an order status update) will be pushed in real-time to all connected clients—whether they are using the website on a desktop, a mobile browser, or the wrapped native app. The experience is seamless across all platforms.

## Raspberry Pi Integration

You can connect this application to a Raspberry Pi to trigger real-world actions (e.g., lighting an LED when an order is shipped). For detailed instructions, please see the **[RASPBERRY_PI.md](./RASPBERRY_PI.md)** guide.
