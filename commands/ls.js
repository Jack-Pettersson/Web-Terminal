commands.ls = (args) => {
  const flags = args.filter((a) => a.startsWith("-")).join("");
  const target = args.find((a) => !a.startsWith("-")) || ".";
  const parts = resolvePath(target);
  const node = getNode(parts);

  if (!node) return print(`ls: ${target}: No such file or directory`, "error");
  if (node.type === "file") return print(target);

  const entries = Object.keys(node.children)
    .filter((name) => flags.includes("a") || !name.startsWith("."))
    .sort();
  if (entries.length === 0) return;

  if (capturing) {
    for (const name of entries) {
      print(node.children[name].type === "dir" ? name + "/" : name);
    }
    return;
  }

  const div = document.createElement("span");
  for (let i = 0; i < entries.length; i++) {
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
    if (i < entries.length - 1) div.appendChild(document.createTextNode("  "));
  }
  div.appendChild(document.createTextNode("\n"));
  outputEl.appendChild(div);
};
