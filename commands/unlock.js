commands.unlock = (args) => {
  if (args.join(" ").toLowerCase() !== "cosmic goose honks") {
    return print("unlock: the lock doesn't budge.", "error");
  }

  print("*click*", "info");
  print("");
  print("     ___________");
  print("    '._==_==_=_.'");
  print("    .-\\:      /-.");
  print("   | (|:.     |) |");
  print("    '-|:.     |-'");
  print("      \\::.    /");
  print("       '::. .'");
  print("         ) (");
  print("       _.' '._");
  print("      '-------'");
  print("");
  print("You did it! The cosmic goose honks in your honor.", "info");
};
