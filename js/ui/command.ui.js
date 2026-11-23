import { apiFetch, ApiError } from "../services/api.service.js";

let isSending = false;
let pendingTimer = null;

export function initCommand(deviceId, onStatusChange) {
  const btn = document.querySelector('[data-role="switch"]');
  const label = document.querySelector('[data-role="command-status"]');

  btn.addEventListener("click", async () => {
    if (isSending) return;

    isSending = true;
    btn.disabled = true;

    const nextState = btn.getAttribute("aria-checked") !== "true";

    try {
      await apiFetch(`/devices/${deviceId}/command`, {
        method: "POST",
        body: { state: nextState },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        label.textContent = "Aguarde alguns segundos";
      } else if (err.status === 0) {
        label.textContent = "Sem conexão";
      } else {
        label.textContent = "Erro ao enviar comando";
      }
    } finally {
      isSending = false;
      btn.disabled = false;
    }
  });

  return {
    update(control) {
      btn.setAttribute("aria-checked", String(control.confirmed));
      btn.textContent = control.confirmed ? "Desligar" : "Ligar";
      const card = document.querySelector('[data-block="command"]');

      if (control.pending) {
        card.dataset.state = "pending";
        label.textContent = "Aguardando confirmação...";

        if (!pendingTimer) {
          pendingTimer = setTimeout(() => {
            label.textContent =
              "O equipamento não confirmou. Verifique se ele está online.";
          }, 15000);
        }
      } else {
        card.dataset.state = control.confirmed ? "on" : "off";
        label.textContent = `Comando: ${control.confirmed ? "ligado" : "desligado"}`;
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      onStatusChange?.(control);
    },
  };
}
