import { VAPID_PUBLIC_KEY } from "./config.js";
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "../data/api.js";

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const subscribeUser = async (token) => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to server
    const result = await subscribeToNotifications(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.options.applicationServerKey)
            )
          ),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(16))),
        },
      },
      token
    );

    if (!result.error) {
      console.log("User is subscribed.");
      return subscription;
    }
  }

  return subscription;
};

export const unsubscribeUser = async (token) => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const result = await unsubscribeFromNotifications(
      subscription.endpoint,
      token
    );

    if (!result.error) {
      await subscription.unsubscribe();
      console.log("User is unsubscribed.");
      return true;
    }
  }

  return false;
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
