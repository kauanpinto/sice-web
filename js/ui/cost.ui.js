import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { db } from "../services/firebase.js";

export function initCost(deviceId) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  onValue(ref(db, `devices/${deviceId}/cost/${month}`), (snap) => {
    const cost = snap.val();

    if (!cost) return;

    const fmt = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    document.querySelector('[data-role="cost-value"]').textContent = fmt.format(
      cost.costBRL,
    );
    document.querySelector('[data-role="cost-detail"]').textContent =
      `${cost.kwh.toFixed(2)} kWh • projeção ${fmt.format(cost.projectedBRL ?? 0)}`;
  });
}
