"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseClientConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0,
);

function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseClientConfig) {
    throw new Error("Firebase client configuration is incomplete.");
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export async function requestFcmToken(
  serviceWorkerRegistration: ServiceWorkerRegistration,
): Promise<string | null> {
  if (!hasFirebaseClientConfig) {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  if (!("Notification" in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY.");
  }

  const messaging = getMessaging(getFirebaseApp());

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });
}

export async function subscribeToForegroundMessages(
  onPayload: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
  if (!hasFirebaseClientConfig) {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  const messaging = getMessaging(getFirebaseApp());
  return onMessage(messaging, onPayload);
}