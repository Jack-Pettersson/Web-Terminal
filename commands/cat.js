commands.cat = (args, stdin) => {
  if (!args[0]) {
    if (stdin) return print(stdin);
    if (stdin === undefined) print("cat: missing operand", "error");
    return;
  }

  const parts = resolvePath(args[0]);
  const node = getNode(parts);

  if (!node) return print(`cat: ${args[0]}: No such file or directory`, "error");
  if (node.type === "dir") return print(`cat: ${args[0]}: Is a directory`, "error");

  print(node.content);
};
