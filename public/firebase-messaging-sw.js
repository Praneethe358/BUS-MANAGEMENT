importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;

const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

const hasValidConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0,
);

if (hasValidConfig) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Bus Update";
    const body = payload.notification?.body || "Your bus is near your stop.";

    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
    });
  });
} else {
  console.error("[fcm-sw] Firebase config missing for service worker.");
}
