"use client";

import type { MessagePayload } from "firebase/messaging";
import { requestFcmToken, subscribeToForegroundMessages } from "@/lib/firebaseClient";

function getFirebaseServiceWorkerUrl() {
  const url = new URL("/firebase-messaging-sw.js", window.location.origin);

  const values: Record<string, string | undefined> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function initializeBrowserNotifications(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(getFirebaseServiceWorkerUrl());
  return requestFcmToken(registration);
}

export async function subscribeToForegroundNotifications(
  onPayload: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
  return subscribeToForegroundMessages(onPayload);
}

export async function sendBusNearStopNotification(
  token: string,
  body = "Your bus is arriving in 2 minutes",
): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      title: "Bus Update",
      body,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to send notification.");
  }
}