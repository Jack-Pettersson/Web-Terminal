commands.vim = (args) => {
  const fileName = args[0] || "[No Name]";
  const quitHint = "Type  :qa!  and press <Enter> to abandon all changes and exit Vim";
  const failedQuits = {
    "q": "E37: No write since last change (add ! to override)",
    "q!": "E666: Nice try",
    "wq": "E212: Can't open file for writing",
    "x": "E212: Can't open file for writing",
    "quit": "E37: No write since last change (add ! to override)",
    "exit": "E492: There is no exit, only vim",
  };

  let mode = "normal";
  let text = "";
  let command = "";
  let status = `"${fileName}" [New]`;
  let attempts = 0;

  const current = startProgram("vim", {
    onKey: (e) => {
      if (e.ctrlKey && e.key === "c") {
        mode = "normal";
        status = quitHint;
      } else if (mode === "insert") {
        if (e.key === "Escape") {
          mode = "normal";
          status = "";
        } else if (e.key === "Enter") {
          text += "\n";
        } else if (e.key === "Backspace") {
          text = text.slice(0, -1);
        } else if (e.key.length === 1) {
          text += e.key;
        }
      } else if (mode === "command") {
        if (e.key === "Escape") {
          mode = "normal";
          status = "";
        } else if (e.key === "Enter") {
          mode = "normal";
          if (command === "qa!") return current.exit();
          attempts++;
          status = attempts >= 4 ? quitHint : failedQuits[command] || `E492: Not an editor command: ${command}`;
        } else if (e.key === "Backspace") {
          command = command.slice(0, -1);
        } else if (e.key.length === 1) {
          command += e.key;
        }
      } else if (e.key === "i") {
        mode = "insert";
      } else if (e.key === ":") {
        mode = "command";
        command = "";
      }
      render();
    },
  });
  if (!current) return;

  const screen = document.createElement("pre");
  screen.className = "program-screen";
  current.el.appendChild(screen);

  function render() {
    const rows = Math.floor(current.el.clientHeight / 16.5) - 2;
    const lines = text.split("\n");
    while (lines.length < rows) lines.push("~");
    const bottom = mode === "insert" ? "-- INSERT --" : mode === "command" ? ":" + command : status;
    screen.textContent = lines.slice(-rows).join("\n") + "\n" + bottom;
  }
  render();
};

commands.vi = commands.vim;
