commands.cowsay = (args, stdin) => {
  const message = args.join(" ") || (stdin || "").trim();
  if (!message) return print("usage: cowsay <text>", "error");

  const maxWidth = 30;
  const lines = [];
  for (const paragraph of message.split("\n")) {
    let line = "";
    for (let word of paragraph.split(" ")) {
      while (word.length > maxWidth) {
        if (line) lines.push(line);
        line = "";
        lines.push(word.slice(0, maxWidth));
        word = word.slice(maxWidth);
      }
      if (line && line.length + word.length + 1 > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = line ? line + " " + word : word;
      }
    }
    lines.push(line);
  }

  const width = Math.max(...lines.map((l) => l.length));
  print(" " + "_".repeat(width + 2));
  lines.forEach((line, i) => {
    const [open, close] = lines.length === 1
      ? ["<", ">"]
      : i === 0
        ? ["/", "\\"]
        : i === lines.length - 1
          ? ["\\", "/"]
          : ["|", "|"];
    print(`${open} ${line.padEnd(width)} ${close}`);
  });
  print(" " + "-".repeat(width + 2));
  print("        \\   ^__^");
  print("         \\  (oo)\\_______");
  print("            (__)\\       )\\/\\");
  print("                ||----w |");
  print("                ||     ||");
};
