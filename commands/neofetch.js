// Each logo maps a point (x, y in -1..1, y pointing down) to a color, or null for empty
const neofetchLogos = {
  Chrome: (x, y, r, angle) => {
    if (r > 1) return null;
    if (r < 0.4) return "#4285f4";
    if (r < 0.55) return "#ffffff";
    if (angle >= -150 && angle < -30) return "#ea4335";
    if (angle >= -30 && angle < 90) return "#fbbc05";
    return "#34a853";
  },
  Firefox: (x, y, r, angle) => {
    if (r > 1) return null;
    if (r < 0.6) return "#7542e5";
    if (angle >= -80 && angle < -20) return null;
    return angle >= -20 && angle < 60 ? "#ffbd4f" : "#ff7139";
  },
  Edge: (x, y, r) => {
    if (r > 1) return null;
    if (Math.hypot(x - 0.2, y - 0.15) < 0.45) return null;
    return y + x * 0.4 > 0.1 ? "#4fd1a5" : "#0c7cd5";
  },
  Safari: (x, y, r) => {
    if (r > 1) return null;
    if (r > 0.85) return "#ffffff";
    const along = (x - y) / Math.SQRT2;
    const across = Math.abs(x + y) / Math.SQRT2;
    if (across < 0.28 * (1 - Math.abs(along) / 0.8)) return along > 0 ? "#ff3b30" : "#ffffff";
    return "#1a8cff";
  },
  Unknown: (x, y, r) => {
    if (r > 1) return null;
    const onLine = r > 0.85 || Math.abs(y) < 0.1 || Math.abs(x) < 0.08 || Math.abs(Math.hypot(x / 0.55, y) - 1) < 0.14;
    return onLine ? "#9ca3af" : null;
  },
};

function neofetchArt(logo) {
  const cols = 24;
  const rows = 12;
  const art = document.createElement("span");
  art.className = "neofetch-art";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col + 0.5 - cols / 2) / (cols / 2);
      const y = (row + 0.5 - rows / 2) / (rows / 2);
      const angle = Math.atan2(y, x) * 180 / Math.PI;
      const color = logo(x, y, Math.hypot(x, y), angle);
      const cell = document.createElement("span");
      if (color) cell.style.color = color;
      cell.textContent = color ? "█" : " ";
      art.appendChild(cell);
    }
    art.appendChild(document.createTextNode("\n"));
  }
  return art;
}

function neofetchOs(ua) {
  if (navigator.userAgentData?.platform) return navigator.userAgentData.platform;
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
}

commands.neofetch = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "";

  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    version = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Safari/")) {
    browser = "Safari";
    version = ua.match(/Version\/([\d.]+)/)?.[1] || "";
  }

  const lang = navigator.language || "en";
  const cores = navigator.hardwareConcurrency || "?";
  const res = window.screen.width + "x" + window.screen.height;
  const theme = document.documentElement.getAttribute("data-theme") || "default";
  const uptime = Math.floor(performance.now() / 1000);
  const uptimeStr = uptime >= 3600
    ? Math.floor(uptime / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m"
    : uptime >= 60
      ? Math.floor(uptime / 60) + "m " + (uptime % 60) + "s"
      : uptime + "s";

  const info = [
    { label: "OS", value: neofetchOs(ua) },
    { label: "Browser", value: (browser + " " + version).trim() },
    { label: "Resolution", value: res },
    { label: "Language", value: lang },
    { label: "CPU Cores", value: String(cores) },
    { label: "Terminal", value: "web-terminal" },
    { label: "Theme", value: theme },
    { label: "Uptime", value: uptimeStr },
  ];

  if (capturing) {
    print("guest@web");
    for (const entry of info) print(entry.label + ": " + entry.value);
    return;
  }

  const container = document.createElement("div");
  container.className = "neofetch";
  container.appendChild(neofetchArt(neofetchLogos[browser]));

  const infoEl = document.createElement("div");
  infoEl.className = "neofetch-info";

  const title = document.createElement("div");
  title.className = "info neofetch-title";
  title.textContent = "guest@web";
  infoEl.appendChild(title);

  const divider = document.createElement("div");
  divider.textContent = "-".repeat(title.textContent.length);
  infoEl.appendChild(divider);

  for (const entry of info) {
    const row = document.createElement("div");
    const label = document.createElement("span");
    label.className = "info";
    label.textContent = entry.label + ": ";
    row.appendChild(label);
    row.appendChild(document.createTextNode(entry.value));
    infoEl.appendChild(row);
  }

  container.appendChild(infoEl);
  outputEl.appendChild(container);
};
