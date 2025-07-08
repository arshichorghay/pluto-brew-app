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

## Deployment: Step-by-Step Guide

This application is pre-configured for deployment with **Firebase App Hosting**. Follow these steps to get your site live on the internet.

### Prerequisites

*   A [GitHub](https://github.com/) account.
*   A [Firebase](https://console.firebase.google.com/) account.
*   `git` installed on your local machine.

### Step 1: Create a GitHub Repository

1.  Go to [GitHub](https://github.com/new) and create a new repository. You can name it whatever you like (e.g., `pluto-brew-app`).
2.  Keep it public or private, your choice. Do **not** initialize it with a README, .gitignore, or license file, as this project already has them.

### Step 2: Push Your Code to GitHub

1.  On the GitHub repository page, copy the repository URL. It will look something like `https://github.com/your-username/pluto-brew-app.git`.
2.  In your local project terminal, initialize a git repository and push your code by running these commands one by one. **Replace the URL with your own repository URL.**

    ```bash
    git init -b main
    git add -A
    git commit -m "Initial commit"
    git remote add origin https://github.com/your-username/pluto-brew-app.git
    git push -u origin main
    ```

### Step 3: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give your project a name.
3.  Continue through the setup steps. You can disable Google Analytics for this project if you don't need it.

### Step 4: Set up Firebase App Hosting

1.  Once your Firebase project is created, navigate to the **Build** section in the left-hand menu and click on **App Hosting**.
2.  Click the **"Get started"** button. This will begin the process of creating a "backend" for your app.
3.  You will be prompted to connect to GitHub. Authorize Firebase to access your GitHub account.
4.  Select the GitHub repository you created in Step 1.
5.  Keep the default deployment branch as `main` and click **"Finish and deploy"**.

### Step 5: Go Live!

That's it! Firebase App Hosting will now:
*   Start building your Next.js application.
*   Deploy it to its global content delivery network (CDN).
*   Provide you with a live, public URL (e.g., `your-app.apphosting.dev` or `your-app.web.app`).

You can see the deployment progress on the App Hosting dashboard. Once it's complete, you can visit the URL to see your live website. Every time you push a new change to your `main` branch on GitHub, a new deployment will automatically begin.

## Mobile Access

This is a responsive web application, not a native mobile app. It is designed to be accessed through a web browser on any device, including mobile phones.

- **Browser Access:** The primary way for mobile users to access the app is by navigating to your public website URL on their phone's browser. The user interface will adapt to the smaller screen size.

### Creating a Native-Like Mobile App (APK)

If you need to distribute your app as a native `.apk` file for Android, you can do so by "wrapping" this web application.

- **Wrapper Technology:** You would use a tool like [Capacitor](https://capacitorjs.com/). Capacitor takes your existing web app and bundles it inside a native mobile application shell. This allows you to submit it to app stores or distribute the APK directly.
- **Real-time Updates Will Work:** The wrapped app is still your web app. It connects to the exact same Firebase backend. This means that any data changes (like an order status update) will be pushed in real-time to all connected clients—whether they are using the website on a desktop, a mobile browser, or the wrapped native app. The experience is seamless across all platforms.

## Raspberry Pi Integration

You can connect this application to a Raspberry Pi to trigger real-world actions (e.g., lighting an LED when an order is shipped). For detailed instructions, please see the **[RASPBERRY_PI.md](./RASPBERRY_PI.md)** guide.
