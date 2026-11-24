import { apiFetch, ApiError } from "../services/api.service.js";

function fill(form, settings) {
  form.name.value = settings.name ?? "";
  form.voltageV.value = settings.voltageV ?? 127;
  form.graceMinutes.value = settings.graceMinutes ?? 10;
  form.reminderMinutes.value = settings.reminderMinutes ?? 30;
  form.highUsageKwhDay.value = settings.highUsageKwhDay ?? 5;

  const mode = settings.schedule?.mode ?? "window";

  form.querySelector(`[name="scheduleMode"][value="${mode}"]`).checked = true;
  form.scheduleStart.value = settings.schedule?.start ?? "06:00";
  form.scheduleEnd.value = settings.schedule?.end ?? "22:00";
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
    voltageV: Number(d.get("voltageV")),
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

function getErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Não foi possível salvar as configurações. Tente novamente.";
  }

  if (error.status === 0) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }

  if (error.status === 401) {
    return "Sua sessão expirou. Entre novamente.";
  }

  if (error.status === 404) {
    return "Dispositivo não encontrado.";
  }

  if (error.status === 429) {
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }

  if (error.status >= 500) {
    return "Estamos com instabilidade no servidor. Tente novamente em instantes.";
  }

  if (error.fields) {
    const field = Object.keys(error.fields)[0];

    const messages = {
      name: "Informe um nome válido para o equipamento.",
      voltageV: "Informe uma tensão entre 100 e 240 volts.",
      "schedule.mode": "Selecione um modo de funcionamento.",
      "schedule.start": "Informe um horário de início válido.",
      "schedule.end": "Informe um horário de término válido.",
      schedule: "Configure um intervalo de horários válido.",
      "alerts.absence": "Revise a configuração do alerta de ausência.",
      "alerts.dark": "Revise a configuração do alerta de escuridão.",
      "alerts.outsideSchedule":
        "Revise a configuração do alerta fora do horário.",
      "alerts.highUsage": "Revise a configuração do alerta de consumo.",
      graceMinutes: "O tempo de tolerância deve estar entre 1 e 120 minutos.",
      reminderMinutes:
        "O intervalo do lembrete deve estar entre 5 e 240 minutos.",
      highUsageKwhDay: "Informe um limite de consumo maior que zero.",
    };

    return (
      messages[field] ?? "Verifique os dados informados e tente novamente."
    );
  }

  return "Não foi possível salvar as configurações. Verifique os dados e tente novamente.";
}

export async function initSettings(deviceId) {
  const form = document.querySelector('[data-role="settings-form"]');
  const settings = await apiFetch(`/devices/${deviceId}/settings`);

  fill(form, settings);

  form
    .querySelectorAll('[name="scheduleMode"]')
    .forEach((radio) =>
      radio.addEventListener("change", () => toggleWindow(form)),
    );

  const btn = form.querySelector('[data-role="settings-btn"]');
  const errorEl = form.querySelector('[data-role="settings-error"]');
  const okEl = form.querySelector('[data-role="settings-success"]');

  function clearFeedback() {
    errorEl.textContent = "";
    okEl.textContent = "";
  }

  form.addEventListener("input", clearFeedback);
  form.addEventListener("change", clearFeedback);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFeedback();
    btn.disabled = true;
    btn.textContent = "Salvando...";

    try {
      await apiFetch(`/devices/${deviceId}/settings`, {
        method: "PUT",
        body: toPayload(form),
      });

      okEl.textContent = "Configurações salvas com sucesso!";
    } catch (error) {
      errorEl.textContent = getErrorMessage(error);
    } finally {
      btn.disabled = false;
      btn.textContent = "Salvar configurações";
    }
  });
}
