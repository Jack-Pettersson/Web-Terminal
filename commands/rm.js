commands.rm = (args) => {
  if (!args[0]) return print("rm: missing operand", "error");

  const parts = resolvePath(args[0]);
  const name = parts.pop();
  const parentNode = getNode(parts);

  if (!parentNode || !parentNode.children[name])
    return print(`rm: ${args[0]}: No such file or directory`, "error");

  const target = parentNode.children[name];
  if (target.type === "dir" && Object.keys(target.children).length > 0)
    return print(`rm: ${args[0]}: Directory not empty`, "error");

  delete parentNode.children[name];
  saveFs();
};
