const TEXT = {
  equipment: { on: "Ligado", off: "Desligado", unknown: "Sem dados" },
  presence: {
    detected: "Presença detectada",
    not_detected: "Sem presença",
    unknown: "Sem dados",
  },
  ambient: { dark: "Escuro", bright: "Claro", unknown: "Sem dados" },
};

export function renderStatus(status) {
  const fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
  document.querySelector(
    '[data-block="equipment"] [data-role="value"]',
  ).textContent = TEXT.equipment[status.equipment] ?? "--";
  document.querySelector(
    '[data-block="equipment"] [data-role="power"]',
  ).textContent = `${fmt.format(status.powerW ?? 0)} W`;
  document.querySelector('[data-block="equipment"]').dataset.state =
    status.equipment === "on" ? "on" : "off";
  document.querySelector(
    '[data-block="presence"] [data-role="value"]',
  ).textContent = TEXT.presence[status.presence] ?? "--";
  document.querySelector(
    '[data-block="ambient"] [data-role="value"]',
  ).textContent = TEXT.ambient[status.ambient] ?? "--";
  const badge = document.querySelector('[data-role="offline-badge"]');

  if (!status.online) {
    const min = Math.max(
      1,
      Math.round((Date.now() - status.lastSeenAt) / 60000),
    );

    badge.textContent = `offline há ${min} min`;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}
