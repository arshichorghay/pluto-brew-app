
# Deployment Guide: Pluto Brew

This guide provides step-by-step instructions to deploy your Pluto Brew application to the web using Firebase Hosting. Because this app is configured as a "static" site, it can be hosted entirely within Firebase's free tier.

## Prerequisites

- You have a [Firebase](https://console.firebase.google.com/) account.
- You have the Firebase CLI installed on your machine: `npm install -g firebase-tools`.

> **Note:** The Firebase connection details are hardcoded in `/src/lib/firebase.ts`. If you want to connect to a different Firebase project in the future, you will need to update the `firebaseConfig` object in that file with your own project's credentials from the Firebase Console.

---

### Step 1: Configure Your Firebase Project

1.  **Create a Firebase Project:** If you haven't already, go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

    > **⚠️ IMPORTANT: Firebase Project ID Rules**
    > When you create your project, Firebase assigns it a unique **Project ID**. This ID has strict rules:
    > - It must be **all lowercase**.
    > - It can only contain letters, numbers, and hyphens (`-`).
    > The error `Invalid project id: Pluto_V1` happens because an ID contains uppercase letters, which is not allowed.

2.  **Connect Your Local Project to Firebase:**
    -   **Find Your Project ID:** Go to your [Firebase Project Settings](https://console.firebase.google.com/project/_/settings/general) by clicking the gear icon next to "Project Overview". Your correct, all-lowercase **Project ID** will be listed there.
    -   **Set Your Project ID:** Open the `.firebaserc` file in your project. You will see a line with `"default": "pluto-brew-app"`. Replace `pluto-brew-app` with your actual **Firebase Project ID** (the all-lowercase one from your Firebase Project Settings).
    -   **Log in:** Open your terminal and run this command. A browser window will open to complete the login.
        ```bash
        firebase login
        ```

---

### Step 2: Build Your App

Before you can deploy, you must first build the static version of your site. This command packages everything into the `out` directory that Firebase needs.

> **⚠️ Important:** You must run this command before you deploy.

```bash
npm run build
```

---

### Step 3: Deploy to Firebase

Now that your app is built, you can deploy it to Firebase Hosting.

```bash
firebase deploy --only hosting
```

After the `deploy` command finishes, it will give you the public URL for your live website. That's it! Your Pluto Brew marketplace is now live on the web.
