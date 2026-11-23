import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { db } from "../services/firebase.js";

export function initEnergy(deviceId) {
  const chart = document.querySelector('[data-role="energy-chart"]');
  const totalEl = document.querySelector('[data-role="energy-total"]');
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "America/Bahia",
  });

  onValue(ref(db, `devices/${deviceId}/energy/hourly/${today}`), (snap) => {
    const data = snap.val() ?? {};
    const hours = Array.from(
      { length: 24 },
      (_, h) => data[String(h).padStart(2, "0")] ?? 0,
    );
    const max = Math.max(1, ...hours);

    chart.replaceChildren(
      ...hours.map((wh, h) => {
        const bar = document.createElement("div");

        bar.className = "bar";
        bar.style.height = `${(wh / max) * 100}%`;
        bar.title = `${String(h).padStart(2, "0")}h: ${wh} Wh`;

        return bar;
      }),
    );

    const totalWh = hours.reduce((a, b) => a + b, 0);

    totalEl.textContent = `${(totalWh / 1000).toFixed(2)} kWh hoje`;
  });
}
