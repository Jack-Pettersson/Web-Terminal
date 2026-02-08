commands.mkdir = (args) => {
  if (!args[0]) return print("mkdir: missing operand", "error");

  const parts = resolvePath(args[0]);
  const name = parts.pop();
  const parentNode = getNode(parts);

  if (!parentNode || parentNode.type !== "dir")
    return print(`mkdir: cannot create directory '${args[0]}': No such file or directory`, "error");
  if (parentNode.children[name])
    return print(`mkdir: cannot create directory '${args[0]}': File exists`, "error");

  parentNode.children[name] = { type: "dir", children: {} };
  saveFs();
};
