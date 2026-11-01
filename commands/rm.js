function meltdown() {
  const screen = document.createElement("pre");
  const current = startProgram("rm", {
    onExit: () => print("Just kidding. Your files are fine.", "info"),
  });
  if (!current) return;

  screen.className = "program-screen";
  current.el.appendChild(screen);
  const addLine = (text) => {
    screen.textContent += text + "\n";
    screen.scrollTop = screen.scrollHeight;
  };

  const paths = [];
  const walk = (node, path) => {
    for (const [name, child] of Object.entries(node.children)) {
      paths.push(path + name);
      if (child.type === "dir") walk(child, path + name + "/");
    }
  };
  walk(fs["/"], "/");
  paths.push("/bin/bash", "/usr/lib/libc.so", "/boot/vmlinuz", "/etc/passwd", "/your/homework", "/dev/coffee", "/sys/will/to/live");

  const steps = [];
  for (const path of paths) steps.push([70, () => addLine(`removed '${path}'`)]);
  steps.push(
    [500, () => {
      current.el.classList.add("meltdown");
      addLine("");
      addLine("Kernel panic - not syncing: guest deleted everything");
    }],
    [1800, () => {
      current.el.classList.remove("meltdown");
      screen.textContent = "";
    }],
    [900, () => addLine("Rebooting...")],
    [600, () => addLine("[  OK  ] Found a backup under the couch")],
    [600, () => addLine("[  OK  ] Restored /home/guest")],
    [600, () => addLine("[  OK  ] Pretended nothing happened")],
    [800, () => current.exit()],
  );

  const run = (i) => {
    if (i === steps.length) return;
    setTimeout(() => {
      steps[i][1]();
      run(i + 1);
    }, steps[i][0]);
  };
  run(0);
}

commands.rm = (args) => {
  const flags = args.filter((a) => a.startsWith("-")).join("");
  const targets = args.filter((a) => !a.startsWith("-"));
  const recursive = /r/i.test(flags);
  const force = flags.includes("f");

  if (targets.length === 0) return print("rm: missing operand", "error");
  if (recursive && targets.some((t) => t === "/*" || resolvePath(t).length === 0)) return meltdown();

  for (const arg of targets) {
    const parts = resolvePath(arg);
    const path = partsToPath(parts);
    const name = parts.pop();
    const parentNode = getNode(parts);

    if (!parentNode || !parentNode.children || !parentNode.children[name]) {
      if (!force) print(`rm: ${arg}: No such file or directory`, "error");
      continue;
    }

    const target = parentNode.children[name];
    if (target.type === "dir" && !recursive && Object.keys(target.children).length > 0) {
      print(`rm: ${arg}: Directory not empty`, "error");
      continue;
    }
    if (cwd === path || cwd.startsWith(path + "/")) {
      print(`rm: ${arg}: You're standing in that directory`, "error");
      continue;
    }

    delete parentNode.children[name];
    saveFs();
  }
};
