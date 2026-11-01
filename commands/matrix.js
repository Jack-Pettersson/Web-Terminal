commands.matrix = () => {
  let timer;
  const current = startProgram("matrix", {
    onKey: (e) => {
      if (!e.repeat) current.exit();
    },
    onExit: () => clearInterval(timer),
  });
  if (!current) return;

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  current.el.appendChild(canvas);
  current.el.addEventListener("pointerdown", current.exit);

  const ctx = canvas.getContext("2d");
  const fontSize = 16;
  const columns = Math.ceil(canvas.width / fontSize);
  const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));
  const randomChar = () => {
    return Math.random() < 0.8
      ? String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))
      : String(Math.floor(Math.random() * 10));
  };

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px Consolas, monospace`;

  timer = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22ff66";
    drops.forEach((row, col) => {
      ctx.fillText(randomChar(), col * fontSize, row * fontSize);
      drops[col] = row * fontSize > canvas.height && Math.random() > 0.97 ? 0 : row + 1;
    });
  }, 50);
};
