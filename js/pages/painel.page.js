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

  unsub = onValue(ref(db, `devices/${deviceId}/status`), (snap) => {
    const status = snap.val();

    if (!status) return;

    renderStatus(status);
    command.update(status.command);
  });

  document
    .querySelector('[data-role="logout-btn"]')
    .addEventListener("click", async () => {
      if (unsub) unsub();
      await authService.logout();
    });
  document
    .querySelector('[data-role="push-btn"]')
    .addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;

      try {
        await pushService.enablePush((notif) => {
          document.querySelector('[data-role="push-status"]').textContent =
            notif.body;
        });

        btn.textContent = "Alertas ativados";
      } catch {
        document.querySelector('[data-role="push-status"]').textContent =
          "Alertas desativados. Ative nas configurações do navegador.";
      } finally {
        btn.disabled = false;
      }
    });
});
