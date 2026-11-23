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

async function enablePush(onForeground) {
  if (!(await isSupported())) {
    throw new Error("unsupported");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("denied");
  }
  
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const messaging = getMessaging(auth.app);
  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });

  await apiFetch("/me/push-tokens", { method: "PUT", body: { token } });

  onMessage(messaging, (payload) => onForeground?.(payload.notification));

  return token;
}
async function disablePush() {
  const messaging = getMessaging(auth.app);
  const token = await getToken(messaging, { vapidKey: config.vapidKey });

  if (token) {
    await apiFetch("/me/push-tokens", { method: "DELETE", body: { token } });
    await deleteToken(messaging);
  }
}

export const pushService = { enablePush, disablePush };
