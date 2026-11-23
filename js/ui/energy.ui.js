import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { db } from "../services/firebase.js";

export function initEnergy(deviceId) {
  const chart = document.querySelector('[data-role="energy-chart"]');
  const totalEl = document.querySelector('[data-role="energy-total"]');
  const today = new Date().toISOString().slice(0, 10);

  onValue(ref(db, `devices/${deviceId}/energy/hourly/${today}`), (snap) => {
    const data = snap.val() ?? {};
    const entries = Object.entries(data).sort();
    const max = Math.max(1, ...entries.map(([, v]) => v));

    chart.replaceChildren(
      ...entries.map(([h, v]) => {
        const bar = document.createElement("div");

        bar.className = "bar";
        bar.style.height = `${(v / max) * 100}%`;
        bar.title = `${h}h: ${v} Wh`;

        return bar;
      }),
    );

    const totalWh = entries.reduce((a, [, v]) => a + v, 0);

    totalEl.textContent = `${(totalWh / 1000).toFixed(2)} kWh hoje`;
  });
}
