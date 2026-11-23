import { apiFetch, ApiError } from "../services/api.service.js";

function fill(form, settings) {
  form.name.value = settings.name ?? "";
  form.timezone.value = settings.timezone ?? "America/Bahia";
  form.voltageV.value = settings.voltageV ?? 127;
  form.onCurrentA.value = settings.onCurrentA ?? 0.1;
  form.lightThreshold.value = settings.lightThreshold ?? 2048;
  form.darkWhen.value = settings.darkWhen ?? "high";
  form.graceMinutes.value = settings.graceMinutes ?? 10;
  form.reminderMinutes.value = settings.reminderMinutes ?? 30;
  form.highUsageKwhDay.value = settings.highUsageKwhDay ?? 5;

  const mode = settings.schedule?.mode ?? "window";

  form.querySelector(`[name="scheduleMode"][value="${mode}"]`).checked = true;
  form.scheduleStart.value = settings.schedule?.start ?? "22:00";
  form.scheduleEnd.value = settings.schedule?.end ?? "06:00";
  form.alertAbsence.checked = settings.alerts?.absence ?? true;
  form.alertDark.checked = settings.alerts?.dark ?? true;
  form.alertOutsideSchedule.checked = settings.alerts?.outsideSchedule ?? true;
  form.alertHighUsage.checked = settings.alerts?.highUsage ?? true;
  toggleWindow(form);
}

function toggleWindow(form) {
  const isAlways =
    form.querySelector('[name="scheduleMode"]:checked')?.value === "always";

  form.querySelector('[data-role="window-fields"]').hidden = isAlways;
  form.alertAbsence.disabled = isAlways;
  form.alertDark.disabled = isAlways;

  if (isAlways) {
    form.alertAbsence.checked = false;
    form.alertDark.checked = false;
  }
}

function toPayload(form) {
  const d = new FormData(form);

  return {
    name: d.get("name"),
    timezone: d.get("timezone"),
    voltageV: Number(d.get("voltageV")),
    onCurrentA: Number(d.get("onCurrentA")),
    lightThreshold: Number(d.get("lightThreshold")),
    darkWhen: d.get("darkWhen"),
    schedule: {
      mode: d.get("scheduleMode"),
      start: d.get("scheduleStart"),
      end: d.get("scheduleEnd"),
    },
    alerts: {
      absence: form.alertAbsence.checked,
      dark: form.alertDark.checked,
      outsideSchedule: form.alertOutsideSchedule.checked,
      highUsage: form.alertHighUsage.checked,
    },
    graceMinutes: Number(d.get("graceMinutes")),
    reminderMinutes: Number(d.get("reminderMinutes")),
    highUsageKwhDay: Number(d.get("highUsageKwhDay")),
  };
}

export async function initSettings(deviceId) {
  const form = document.querySelector('[data-role="settings-form"]');
  const settings = await apiFetch(`/devices/${deviceId}/settings`);

  fill(form, settings);
  form
    .querySelectorAll('[name="scheduleMode"]')
    .forEach((r) => r.addEventListener("change", () => toggleWindow(form)));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('[data-role="settings-btn"]');
    const errorEl = form.querySelector('[data-role="settings-error"]');
    const okEl = form.querySelector('[data-role="settings-success"]');

    errorEl.textContent = "";
    okEl.textContent = "";
    btn.disabled = true;

    try {
      await apiFetch(`/devices/${deviceId}/settings`, {
        method: "PUT",
        body: toPayload(form),
      });

      okEl.textContent = "Salvo!";
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        const first = Object.values(err.fields)[0];
        errorEl.textContent = first;
      } else errorEl.textContent = "Erro ao salvar. Tente de novo.";
    } finally {
      btn.disabled = false;
    }
  });
}
