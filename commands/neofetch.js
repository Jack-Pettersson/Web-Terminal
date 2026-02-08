commands.neofetch = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "";
  let art;

  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    art = [
      "          .--.          ",
      "     .--''   '--.       ",
      "   .'     .-.    '.     ",
      "  /      /   \\     \\    ",
      " |    __|     |     |   ",
      " |   '   \\   /  .   |   ",
      "  \\   '.  '-'  /   /    ",
      "   '.   '-----'  .'     ",
      "     '--..__.--''       ",
      "          ''            ",
    ];
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    version = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
    art = [
      "       .----.           ",
      "     .'      '.         ",
      "    /    .--.   \\        ",
      "   |   /    \\   |       ",
      "   |   |    '   |       ",
      "   |    \\      /        ",
      "    \\    '----'         ",
      "     \\        .---.     ",
      "      '------'     '    ",
      "                        ",
    ];
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
    art = [
      "        .----.          ",
      "      .'      '.        ",
      "     / .------. \\       ",
      "    | |   __   | |      ",
      "    | |  /  \\  | |      ",
      "    | |  \\__/  | |      ",
      "    | |        | |      ",
      "     \\ '------' /       ",
      "      '.      .'        ",
      "        '----'          ",
    ];
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
    version = ua.match(/Version\/([\d.]+)/)?.[1] || "";
    art = [
      "        .----.          ",
      "      .'  /\\  '.        ",
      "     /   /  \\   \\       ",
      "    |   / __ \\   |      ",
      "    |  | /  \\ |  |      ",
      "    |   \\    /   |      ",
      "     \\   \\  /   /       ",
      "      '.  \\/  .'        ",
      "        '----'          ",
      "                        ",
    ];
  } else {
    art = [
      "        .----.          ",
      "      .'      '.        ",
      "     /   .--.   \\       ",
      "    |   |    |   |      ",
      "    |   |  ? |   |      ",
      "    |   |    |   |      ",
      "     \\   '--'   /       ",
      "      '.      .'        ",
      "        '----'          ",
      "                        ",
    ];
  }

  const os = navigator.userAgentData?.platform || "Unknown";
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
    { label: "guest@web", value: "", isBold: true },
    { label: "", value: "------------" },
    { label: "OS", value: os },
    { label: "Browser", value: browser + " " + version },
    { label: "Resolution", value: res },
    { label: "Language", value: lang },
    { label: "CPU Cores", value: String(cores) },
    { label: "Terminal", value: "web-terminal" },
    { label: "Theme", value: theme },
    { label: "Uptime", value: uptimeStr },
  ];

  const maxLines = Math.max(art.length, info.length);
  const container = document.createElement("span");

  for (let i = 0; i < maxLines; i++) {
    const artLine = art[i] || "                        ";
    const artSpan = document.createElement("span");
    artSpan.className = "info";
    artSpan.textContent = artLine;
    container.appendChild(artSpan);

    if (i < info.length) {
      const entry = info[i];
      if (entry.isBold) {
        const bold = document.createElement("span");
        bold.className = "info";
        bold.textContent = entry.label;
        container.appendChild(bold);
      } else if (entry.label) {
        const label = document.createElement("span");
        label.className = "info";
        label.textContent = entry.label + ": ";
        container.appendChild(label);
        container.appendChild(document.createTextNode(entry.value));
      } else {
        container.appendChild(document.createTextNode(entry.value));
      }
    }

    container.appendChild(document.createTextNode("\n"));
  }

  outputEl.appendChild(container);
};
