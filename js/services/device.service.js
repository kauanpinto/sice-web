import { apiFetch } from "./api.service.js";

let cachedId = null;

async function getDeviceId() {
  if (cachedId) return cachedId;

  const me = await apiFetch("/me");

  cachedId = me.deviceId;

  return cachedId;
}

export const deviceService = { getDeviceId };
