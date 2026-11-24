const TEXT = {
  equipment: { on: "Ligado", off: "Desligado", unknown: "Sem dados" },
  presence: {
    detected: "Presença detectada",
    not_detected: "Sem presença",
    unknown: "Sem dados",
  },
  ambient: { dark: "Escuro", bright: "Claro", unknown: "Sem dados" },
};

const STATE = {
  equipment: { on: "on", off: "off" },
  presence: { detected: "on", not_detected: "off" },
  ambient: { dark: "dark", bright: "on" },
};

function renderBlock(name, status) {
  const block = document.querySelector(`[data-block="${name}"]`);

  block.querySelector('[data-role="value"]').textContent =
    TEXT[name][status[name]] ?? "--";
  block.dataset.state = status.online
    ? (STATE[name][status[name]] ?? "unknown")
    : "unknown";
}

export function renderStatus(status) {
  const fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  for (const name of ["equipment", "presence", "ambient"]) {
    renderBlock(name, status);
  }

  document.querySelector(
    '[data-block="equipment"] [data-role="power"]',
  ).textContent = `${fmt.format(status.powerW ?? 0)} W`;

  const badge = document.querySelector('[data-role="offline-badge"]');

  if (!status.online) {
    const totalMin = Math.max(
      1,
      Math.round((Date.now() - status.lastSeenAt) / 60000),
    );

    if (totalMin < 60) {
      badge.textContent = `offline há ${totalMin} min`;
    } else {
      const hours = Math.floor(totalMin / 60);
      badge.textContent = `offline há ${hours}h`;
    }
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}
