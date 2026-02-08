commands.history = () => {
  history.forEach((cmd, i) => {
    print(`  ${i + 1}  ${cmd}`);
  });
};
