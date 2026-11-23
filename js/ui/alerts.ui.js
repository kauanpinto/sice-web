import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { db } from "../services/firebase.js";
import { apiFetch } from "../services/api.service.js";

const TEXT = {
  absence: "Equipamento ligado sem presença detectada.",
  dark: "Equipamento ligado no escuro.",
  outsideSchedule: "Equipamento ligado fora do horário.",
  highUsage: "Consumo alto hoje.",
};

export function initAlerts(deviceId) {
  const list = document.querySelector('[data-role="alerts-list"]');

  onValue(ref(db, `devices/${deviceId}/alerts`), (snap) => {
    const alerts = snap.val() ?? {};

    list.replaceChildren(
      ...Object.entries(alerts)
        .filter(([, a]) => a.state === "alert")
        .map(([rule, a]) => {
          const div = document.createElement("div");
          div.className = "alert-banner";
          div.setAttribute("role", "alert");
          const span = document.createElement("span");
          span.textContent = TEXT[rule];

          div.append(span);

          if (!a.acknowledged) {
            const btn = document.createElement("button");
            btn.className = "btn";
            btn.textContent = "OK";

            btn.addEventListener("click", async () => {
              btn.disabled = true;
              await apiFetch(`/devices/${deviceId}/alerts/${rule}/ack`, {
                method: "POST",
              }).catch(() => {});
            });
            div.append(btn);
          } else {
            const s = document.createElement("span");
            s.textContent = "confirmado";
            div.append(s);
          }

          return div;
        }),
    );
  });
}
