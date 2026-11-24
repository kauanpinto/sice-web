import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { authService } from "../services/auth.service.js";
import { deviceService } from "../services/device.service.js";
import { pushService } from "../services/push.service.js";
import { db } from "../services/firebase.js";
import { renderStatus } from "../ui/status.ui.js";
import { initCommand } from "../ui/command.ui.js";
import { initSettings } from "../ui/settings.ui.js";
import { initEnergy } from "../ui/energy.ui.js";
import { initCost } from "../ui/cost.ui.js";
import { initAlerts } from "../ui/alerts.ui.js";

let unsub = null;
let pushEnabled = true;

const pushButton = document.querySelector('[data-role="push-btn"]');
const pushStatus = document.querySelector('[data-role="push-status"]');
const logoutButton = document.querySelector('[data-role="logout-btn"]');

pushButton.textContent = "Desativar alertas";
pushStatus.textContent = "Alertas ativados.";

pushButton.addEventListener("click", async () => {
  pushButton.disabled = true;

  try {
    if (pushEnabled) {
      await pushService.disablePush();

      pushEnabled = false;
      pushButton.textContent = "Ativar alertas";
      pushStatus.textContent = "Alertas desativados.";
    } else {
      await pushService.enablePush((notif) => {
        pushStatus.textContent = notif.body;
      });

      pushEnabled = true;
      pushButton.textContent = "Desativar alertas";
      pushStatus.textContent = "Alertas ativados.";
    }
  } catch (error) {
    const messages = {
      unsupported: "Seu navegador não suporta notificações.",
      denied: "Permissão de notificações negada no navegador.",
      "token-unavailable":
        "Não foi possível localizar sua inscrição de notificações.",
    };

    document.querySelector('[data-role="push-status"]').textContent =
      messages[error.message] ?? "Não foi possível alterar os alertas.";
  } finally {
    btn.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  if (unsub) {
    unsub();
    unsub = null;
  }

  await authService.logout();
});

authService.onUserChange(async (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  document.querySelector('[data-role="main"]').hidden = false;

  const deviceId = await deviceService.getDeviceId();
  const command = initCommand(deviceId);

  initSettings(deviceId);
  initEnergy(deviceId);
  initCost(deviceId);
  initAlerts(deviceId);

  if (unsub) unsub();

  unsub = onValue(ref(db, `devices/${deviceId}/status`), (snap) => {
    const status = snap.val();

    if (!status) return;

    renderStatus(status);
    command.update(status.command);
  });
});
