# Web Terminal

A silly little terminal simulator that runs in your browser, just for fun.

**[Try it here](https://jack-pettersson.github.io/Web-Terminal/)**

## Things to try

```
help
neofetch
cat about.txt
echo "hello there" > hi.txt
fortune | cowsay
snake
```

Nothing here touches your real computer. The files are make-believe and live in your browser's local storage, so they stick around between visits. Made a mess? Type `reset`.

## What it can do

- The basics: `ls`, `cd`, `pwd`, `cat`, `echo`, `mkdir`, `touch`, `rm`, `clear`, `whoami`, `date` and `history`
- `neofetch` with ASCII art for the browser you're using
- Tab completion, arrow-key history and `Ctrl+L` to clear
- Pipes and redirection with `|`, `>`, `>>` and `grep`
- `cowsay`, `fortune` and `matrix`
- `snake`, a playable game with your best score saved
- Default, Dracula and Solarized themes
- A few secrets. Go poking around!

## Running it locally

There's nothing to build or install. Just open `index.html` in a browser.
