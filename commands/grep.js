commands.grep = (args, stdin) => {
  const flags = args.filter((a) => a.startsWith("-")).join("");
  const [pattern, file] = args.filter((a) => !a.startsWith("-"));
  if (pattern === undefined) return print("usage: grep [-i] [-v] <pattern> [file]", "error");

  let text = stdin;
  if (file) {
    const node = getNode(resolvePath(file));
    if (!node) return print(`grep: ${file}: No such file or directory`, "error");
    if (node.type === "dir") return print(`grep: ${file}: Is a directory`, "error");
    text = node.content;
  }
  if (text === undefined) return print("grep: nothing to search. Try: ls | grep <pattern>", "error");
  if (!text) return;

  let regex;
  try {
    regex = new RegExp(pattern, flags.includes("i") ? "i" : "");
  } catch (e) {
    return print(`grep: invalid pattern: ${pattern}`, "error");
  }

  const invert = flags.includes("v");
  for (const line of text.split("\n")) {
    if (regex.test(line) !== invert) print(line);
  }
};
