commands.ls = (args) => {
  const target = args[0] || ".";
  const parts = resolvePath(target);
  const node = getNode(parts);

  if (!node) return print(`ls: ${target}: No such file or directory`, "error");
  if (node.type === "file") return print(target);

  const entries = Object.keys(node.children).sort();
  if (entries.length === 0) return;

  const line = entries.map((name) => {
    const child = node.children[name];
    return child.type === "dir" ? `\x1b[dir]${name}/` : name;
  });

  const div = document.createElement("span");
  for (let i = 0; i < line.length; i++) {
    const name = entries[i];
    const child = node.children[name];
    const span = document.createElement("span");
    if (child.type === "dir") {
      span.className = "dir";
      span.textContent = name + "/";
    } else {
      span.textContent = name;
    }
    div.appendChild(span);
    if (i < line.length - 1) div.appendChild(document.createTextNode("  "));
  }
  div.appendChild(document.createTextNode("\n"));
  outputEl.appendChild(div);
};
