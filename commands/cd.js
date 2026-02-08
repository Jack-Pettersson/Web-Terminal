commands.cd = (args) => {
  if (!args[0] || args[0] === "~") {
    cwd = "/home/guest";
    updatePrompt();
    return;
  }

  let target = args[0];
  if (target.startsWith("~")) target = "/home/guest" + target.slice(1);

  const parts = resolvePath(target);
  const node = getNode(parts);

  if (!node) return print(`cd: ${args[0]}: No such file or directory`, "error");
  if (node.type !== "dir") return print(`cd: ${args[0]}: Not a directory`, "error");

  cwd = partsToPath(parts) || "/";
  updatePrompt();
};
