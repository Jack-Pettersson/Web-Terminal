commands.reset = () => {
  fs = defaultFs();
  cwd = "/home/guest";
  history.length = 0;
  historyIndex = 0;
  saveFs();
  saveHistory();
  updatePrompt();
  print("Filesystem reset to defaults.", "info");
};
