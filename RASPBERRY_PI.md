
# Raspberry Pi Integration Guide

This guide explains how to connect your Pluto Brew web application to a Raspberry Pi to trigger actions in the real world when an order's status changes.

The best way to achieve this is to have your Raspberry Pi listen for realtime updates directly from your Firestore database. This is more efficient and reliable than constantly checking (polling) a web page.

## The Concept

1.  **Web App:** When an admin changes an order's status to "Shipped" in the dashboard, the app updates the order document in the Firestore database.
2.  **Raspberry Pi:** A script running on your Raspberry Pi is constantly listening for changes to the orders in Firestore.
3.  **Realtime Push:** Firestore automatically *pushes* the update to the Raspberry Pi script as soon as the change is saved.
4.  **Trigger Action:** Your script sees the status is now "Shipped" and runs a command to trigger a real-world action (e.g., turn on an LED, move a motor, etc.).

## Prerequisites

- Your Raspberry Pi is set up and connected to the internet.
- You have Python 3 and `pip` installed on your Raspberry Pi.

## Step 1: Create a Service Account in Firebase

Your Raspberry Pi script needs its own credentials to securely access your Firebase project.

1.  Go to your **Firebase Project Settings** in the Firebase Console.
2.  Navigate to the **Service accounts** tab.
3.  Click **Generate new private key**. A JSON file containing your credentials will be downloaded.
4.  **Important:** Rename this file to `service-account.json` and transfer it securely to your Raspberry Pi (e.g., into a new project directory `/home/pi/pluto-brew-listener`). Treat this file like a password; do not share it or commit it to GitHub.

## Step 2: Set Up the Python Script on Your Raspberry Pi

On your Raspberry Pi, create a new directory for your project and install the necessary Python libraries.

```bash
# SSH into your Raspberry Pi
mkdir ~/pluto-brew-listener
cd ~/pluto-brew-listener

# Create a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install the Firebase Admin SDK
pip install firebase-admin
```

Now, create a Python script named `listener.py` in this directory:

```bash
nano listener.py
```

Paste the following code into the editor. This script initializes a connection to your Firestore database and sets up a listener on the `orders` collection.

```python
import time
import firebase_admin
from firebase_admin import credentials, firestore

# --- Configuration ---
# IMPORTANT: Make sure the path to your service account JSON file is correct.
SERVICE_ACCOUNT_KEY_PATH = './service-account.json'
# The name of the collection your web app uses for orders.
ORDERS_COLLECTION = 'orders' 

# --- GPIO Setup (Example for an LED) ---
# Uncomment if you are using GPIO pins
# import RPi.GPIO as GPIO
# LED_PIN = 17 # Use the GPIO pin number you've connected your LED to
# GPIO.setmode(GPIO.BCM)
# GPIO.setup(LED_PIN, GPIO.OUT)
# GPIO.output(LED_PIN, GPIO.LOW) # Start with the LED off

# --- Firebase Initialization ---
try:
    print("Initializing Firebase...")
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    exit(1)


# This function is what gets called when a change is detected.
def on_snapshot(col_snapshot, changes, read_time):
    print("Change detected in orders collection.")
    for change in changes:
        if change.type.name == 'MODIFIED':
            order_id = change.document.id
            order_data = change.document.to_dict()
            status = order_data.get('status')
            
            print(f"Order {order_id} was modified. New status: {status}")

            if status == 'Shipped':
                print(f"--- ACTION: Order {order_id} has shipped! Triggering action. ---")
                #
                # YOUR CUSTOM ACTION GOES HERE!
                # Example: Blink an LED for 5 seconds
                #
                # GPIO.output(LED_PIN, GPIO.HIGH)
                # time.sleep(5)
                # GPIO.output(LED_PIN, GPIO.LOW)
                
# --- Main Program ---
# Set up the listener
orders_ref = db.collection(ORDERS_COLLECTION)
query_watch = orders_ref.on_snapshot(on_snapshot)

print(f"Listening for changes on the '{ORDERS_COLLECTION}' collection. Press Ctrl+C to exit.")

# Keep the script running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Stopping listener...")
    # GPIO.cleanup() # Uncomment to clean up GPIO pins on exit
finally:
    # It's good practice to stop the listener, but this part might not
    # be reached if the script is forcefully terminated.
    query_watch.unsubscribe()
    print("Listener stopped.")

```

## Step 3: Run the Listener

You are now ready to run the listener on your Pi.

1.  Make sure your `service-account.json` file is in the same directory as `listener.py`.
2.  Run the script:

    ```bash
    python3 listener.py
    ```

3.  Now, go to your Pluto Brew admin dashboard in a web browser and change an order's status to "Shipped". You should see log messages appear in your Raspberry Pi's terminal, indicating that the change was detected!

## Step 4: Run the Script on Boot (Optional)

To make this a permanent installation, you'll want the `listener.py` script to run automatically whenever your Raspberry Pi starts up. The most robust way to do this is with a `systemd` service.

1.  Create a service file:
    ```bash
    sudo nano /etc/systemd/system/pluto-brew.service
    ```
2.  Paste the following configuration. **Make sure to replace `/home/pi/pluto-brew-listener` with the actual path to your project directory.**

    ```ini
    [Unit]
    Description=Pluto Brew Firestore Listener
    After=network.target

    [Service]
    ExecStart=/home/pi/pluto-brew-listener/venv/bin/python3 /home/pi/pluto-brew-listener/listener.py
    WorkingDirectory=/home/pi/pluto-brew-listener
    StandardOutput=inherit
    StandardError=inherit
    Restart=always
    User=pi

    [Install]
    WantedBy=multi-user.target
    ```

3.  Enable and start the service:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable pluto-brew.service
    sudo systemctl start pluto-brew.service
    ```
4.  You can check its status with:
    ```bash
    sudo systemctl status pluto-brew.service
    ```

Your Raspberry Pi will now automatically listen for order updates whenever it's powered on.
