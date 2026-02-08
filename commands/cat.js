commands.cat = (args) => {
  if (!args[0]) return print("cat: missing operand", "error");

  const parts = resolvePath(args[0]);
  const node = getNode(parts);

  if (!node) return print(`cat: ${args[0]}: No such file or directory`, "error");
  if (node.type === "dir") return print(`cat: ${args[0]}: Is a directory`, "error");

  print(node.content);
};
