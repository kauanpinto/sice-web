import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging.js";
import { auth } from "./firebase.js";
import { config } from "../config/config.js";
import { apiFetch } from "./api.service.js";

async function getPushContext() {
  if (!(await isSupported())) {
    throw new Error("unsupported");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  const messaging = getMessaging(auth.app);

  return { registration, messaging };
}

async function enablePush(onForeground) {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("denied");
  }

  const { registration, messaging } = await getPushContext();

  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("token-unavailable");
  }

  await apiFetch("/me/push-tokens", {
    method: "PUT",
    body: { token },
  });

  onMessage(messaging, (payload) => {
    onForeground?.(payload.notification);
  });

  return token;
}

async function disablePush() {
  const { registration, messaging } = await getPushContext();

  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("token-unavailable");
  }

  await apiFetch("/me/push-tokens", {
    method: "DELETE",
    body: { token },
  });

  await deleteToken(messaging);
}

export const pushService = {
  enablePush,
  disablePush,
};
