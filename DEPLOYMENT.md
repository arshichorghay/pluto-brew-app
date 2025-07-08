
# Deployment Guide: Pluto Brew

This guide provides step-by-step instructions to deploy your Pluto Brew application to the web using Firebase Hosting. Because this app is configured as a "static" site, it can be hosted entirely within Firebase's free tier.

## Prerequisites

- You have a [Firebase](https://console.firebase.google.com/) account.
- You have the Firebase CLI installed on your machine: `npm install -g firebase-tools`.
- You have a Google Cloud account to get a Google Maps API Key.

---

### Step 1: Set Up Environment Variables

This is the most important step to ensure your app can connect to Firebase and Google Maps.

1.  **Create `.env.local` file:** In the root directory of your project, create a new file and name it exactly `.env.local`.

2.  **Copy from the example:** Copy the entire contents of the `.env.example` file and paste it into your new `.env.local` file.

3.  **Fill in your keys:**
    -   **Firebase Keys:** Go to your **Firebase Project Settings** > **General**. Scroll down to "Your apps" and find your web app. Select "Config" to see your keys (apiKey, authDomain, etc.). Copy and paste these values into `.env.local`.
    -   **Google Maps Key:** Go to the [Google Cloud Console](https://console.cloud.google.com/). Make sure your project is selected, then search for and enable the "Maps JavaScript API" and "Places API". Go to "Credentials" to find or create your API key. Paste this key into `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

    > **Note:** The `.gitignore` file is already configured to keep your `.env.local` file private and secure.

---

### Step 2: Configure Your Firebase Project

1.  **Create a Firebase Project:** If you haven't already, go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

    > **⚠️ IMPORTANT: Firebase Project ID Rules**
    > When you create your project, Firebase assigns it a unique **Project ID**. This ID has strict rules:
    > - It must be **all lowercase**.
    > - It can only contain letters, numbers, and hyphens (`-`).
    > The error `Invalid project id: Pluto_V1` happens because an ID contains uppercase letters, which is not allowed.

2.  **Connect Your Local Project to Firebase:**
    -   **Log in:** Open your terminal and run this command. A browser window will open to complete the login.
        ```bash
        firebase login
        ```
    -   **Set Your Project ID:** Open the `.firebaserc` file in your project. You will see a line with `"default": "pluto-brew-app"`. Replace `pluto-brew-app` with your actual **Firebase Project ID** (the all-lowercase one from your Firebase Project Settings).

---

### Step 3: Build and Deploy

You're ready for takeoff!

1.  **Build the app:** This command creates an optimized, static version of your app in a folder named `out`.
    ```bash
    npm run build
    ```
2.  **Deploy to Hosting:** This command sends your built app to Firebase Hosting and makes it live on the internet.
    ```bash
    firebase deploy --only hosting
    ```

After the `deploy` command finishes, it will give you the public URL for your live website. That's it! Your Pluto Brew marketplace is now live on the web.
