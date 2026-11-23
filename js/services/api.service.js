import { auth } from "./firebase.js";
import { config } from "../config/config.js";
import { authService } from "./auth.service.js";

export class ApiError extends Error {
  constructor(status, code, fields) {
    super(code);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = await auth.currentUser?.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${config.apiBaseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    if (res.status === 401) {
      await authService.logout();
      throw new ApiError(401, "unauthorized");
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(res.status, data.error || "error", data.fields);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(0, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}
