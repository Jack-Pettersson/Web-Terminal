const fortunes = [
  "You will soon close a browser tab you needed.",
  "A semicolon stands between you and greatness.",
  "It works on your machine. This is not your machine.",
  "Today is a good day to rename a variable.",
  "Beware of the goose. It knows what it did.",
  "You will find what you are looking for in the last place you grep.",
  "A stranger will ask you to fix their printer.",
  "Your next commit message will say 'fix' and nothing else.",
  "There are hidden things in this terminal. Look closer.",
  "The cloud is just someone else's computer, and it is tired.",
  "Great fortune awaits you, but it is stuck in a merge conflict.",
  "Have you tried turning it off and on again?",
  "Someday you will exit vim. Today is not that day.",
  "You have 47 unread tabs. They are judging you.",
];

commands.fortune = () => {
  print(fortunes[Math.floor(Math.random() * fortunes.length)]);
};
