commands.sl = () => {
  let timer;
  const current = startProgram("sl", { onExit: () => clearInterval(timer) });
  if (!current) return;

  const smoke = [
    ["                 ( )   (  )    ( )", "             (@@)    ( )   (@)", "           ( )  (@)"],
    ["                (  )   ( )   (@@)", "              ( )  (@@)   ( )", "            (@)   ( )"],
  ];
  const train = [
    "           ||        ________",
    "     ______||_______|  __    |      ______________      ______________",
    "    /               | |__|   |     |  []  []  []  |    |  []  []  []  |",
    "   |  CHOO CHOO     |        |=====|              |====|              |",
    "   |________________|________|     |______________|    |______________|",
  ];
  const wheels = [
    "     (+)  (+)  (+)    (+)  (+)        (+)    (+)          (+)    (+)",
    "     (x)  (x)  (x)    (x)  (x)        (x)    (x)          (x)    (x)",
  ];

  const screen = document.createElement("pre");
  screen.className = "program-screen sl";
  current.el.appendChild(screen);

  const draw = (frame) => {
    const i = Math.floor(frame / 6) % 2;
    screen.textContent = [...smoke[i], ...train, wheels[i]].join("\n");
  };
  draw(0);

  const start = window.innerWidth;
  const end = -screen.scrollWidth;
  const totalFrames = 170;
  let frame = 0;

  screen.style.transform = `translateX(${start}px)`;
  timer = setInterval(() => {
    frame++;
    draw(frame);
    screen.style.transform = `translateX(${start + (end - start) * frame / totalFrames}px)`;
    if (frame >= totalFrames) current.exit();
  }, 30);
};
