commands.touch = (args) => {
  if (!args[0]) return print("touch: missing operand", "error");

  const parts = resolvePath(args[0]);
  const name = parts.pop();
  const parentNode = getNode(parts);

  if (!parentNode || parentNode.type !== "dir")
    return print(`touch: cannot create '${args[0]}': No such file or directory`, "error");

  if (!parentNode.children[name]) {
    parentNode.children[name] = { type: "file", content: "" };
    saveFs();
  }
};
