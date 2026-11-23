import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { db } from "../services/firebase.js";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function initCost(deviceId) {
  const month = new Date()
    .toLocaleDateString("sv-SE", { timeZone: "America/Bahia" })
    .slice(0, 7);

  onValue(ref(db, `devices/${deviceId}/cost/${month}`), (snap) => {
    const cost = snap.val();

    if (!cost) return;

    const projection =
      cost.projectedBRL === null
        ? "sem dados suficientes"
        : brl.format(cost.projectedBRL);

    document.querySelector('[data-role="cost-value"]').textContent = brl.format(
      cost.costBRL,
    );
    document.querySelector('[data-role="cost-detail"]').textContent =
      `${cost.kwh.toFixed(2)} kWh • projeção ${projection}`;
  });
}
