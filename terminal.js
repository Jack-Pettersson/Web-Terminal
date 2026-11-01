// ---------------------------------------------------------------------------
//  Virtual filesystem
// ---------------------------------------------------------------------------

function defaultFs() {
  return {
    "/": {
      type: "dir",
      children: {
        home: {
          type: "dir",
          children: {
            guest: {
              type: "dir",
              children: {
                "about.txt": {
                  type: "file",
                  content: "Welcome to the web terminal!\nThis is a fun little browser-based terminal.\nType 'help' to see what you can do.\nP.S. A plain 'ls' doesn't show everything.",
                },
                projects: {
                  type: "dir",
                  children: {
                    "readme.md": {
                      type: "file",
                      content: "# Projects\nNothing here yet - go build something!",
                    },
                  },
                },
                ".clue1": {
                  type: "file",
                  content: "You found the first clue!\nThe first word is: cosmic\nThe next clue is hiding where the config files live.",
                },
              },
            },
          },
        },
        etc: {
          type: "dir",
          children: {
            "hostname": {
              type: "file",
              content: "web-terminal",
            },
            ".clue2": {
              type: "file",
              content: "Nice work.\nThe second word is: goose\nThe last clue is somewhere temporary.",
            },
          },
        },
        tmp: {
          type: "dir",
          children: {
            ".clue3": {
              type: "file",
              content: "Almost there.\nThe third word is: honks\nNow run: unlock <first> <second> <third>",
            },
          },
        },
      },
    },
  };
}

const FS_VERSION = "2";

function addMissing(saved, defaults) {
  for (const [name, node] of Object.entries(defaults.children)) {
    const existing = saved.children[name];
    if (!existing) saved.children[name] = node;
    else if (existing.type === "dir" && node.type === "dir") addMissing(existing, node);
  }
}

function upgradeFs(saved) {
  addMissing(saved["/"], defaultFs()["/"]);
  const guest = saved["/"].children.home?.children?.guest;
  if (guest?.children?.["notes.txt"]?.content === "Don't forget to have fun.") {
    delete guest.children["notes.txt"];
  }
}

function loadFs() {
  try {
    const saved = localStorage.getItem("webterm_fs");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (localStorage.getItem("webterm_fs_version") !== FS_VERSION) {
        upgradeFs(parsed);
        localStorage.setItem("webterm_fs", JSON.stringify(parsed));
        localStorage.setItem("webterm_fs_version", FS_VERSION);
      }
      return parsed;
    }
  } catch (e) { /* ignore */ }
  return defaultFs();
}

function saveFs() {
  try {
    localStorage.setItem("webterm_fs", JSON.stringify(fs));
    localStorage.setItem("webterm_fs_version", FS_VERSION);
  } catch (e) { /* ignore */ }
}

let fs = loadFs();

// ---------------------------------------------------------------------------
//  State
// ---------------------------------------------------------------------------

let cwd = "/home/guest"; // current working directory

function loadHistory() {
  try {
    const saved = localStorage.getItem("webterm_history");
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return [];
}

function saveHistory() {
  try {
    localStorage.setItem("webterm_history", JSON.stringify(history));
  } catch (e) { /* ignore */ }
}

const history = loadHistory();
let historyIndex = history.length;

// ---------------------------------------------------------------------------
//  DOM refs
// ---------------------------------------------------------------------------

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("input");
const promptEl = document.getElementById("prompt");

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

/** Resolve a path string (may be relative) into an absolute path array */
function resolvePath(pathStr) {
  const parts =
    pathStr.startsWith("/")
      ? pathStr.split("/")
      : [...cwd.split("/"), ...pathStr.split("/")];

  const resolved = [];
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") {
      resolved.pop();
    } else {
      resolved.push(p);
    }
  }
  return resolved; // e.g. ["home","guest"]
}

/** Walk the virtual fs tree and return the node at the given parts array */
function getNode(parts) {
  let node = fs["/"];
  for (const p of parts) {
    if (!node || node.type !== "dir" || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

/** Turn parts array back into a path string */
function partsToPath(parts) {
  return "/" + parts.join("/");
}

/** Get the short display name for the cwd (~ for home) */
function cwdDisplay() {
  const home = "/home/guest";
  if (cwd === home) return "~";
  if (cwd.startsWith(home + "/")) return "~" + cwd.slice(home.length);
  return cwd;
}

function updatePrompt() {
  promptEl.textContent = `guest@web:${cwdDisplay()}$ \u00A0`;
}

let print = function(text, className) {
  const span = document.createElement("span");
  if (className) span.className = className;
  span.textContent = text + "\n";
  outputEl.appendChild(span);
};

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

let capturing = false;

function captureOutput(fn) {
  const captured = [];
  const origPrint = print;
  print = (text, className) => {
    if (className === "error") {
      origPrint(text, className); // errors still go to screen
    } else {
      captured.push(text);
    }
  };
  capturing = true;
  try {
    fn();
  } finally {
    print = origPrint;
    capturing = false;
  }
  return captured.join("\n");
}

// ---------------------------------------------------------------------------
//  Full-screen programs
// ---------------------------------------------------------------------------

let program = null;

function startProgram(name, { onKey, onExit } = {}) {
  if (capturing) {
    print(`${name}: can't run inside a pipe or redirect`, "error");
    return null;
  }

  const el = document.createElement("div");
  el.id = "program";
  document.body.appendChild(el);
  inputEl.blur();

  const current = {
    el,
    onKey,
    exit() {
      if (program !== current) return;
      program = null;
      el.remove();
      if (onExit) onExit();
      inputEl.focus();
      scrollToBottom();
    },
  };
  program = current;

  // Touch screens have no keyboard here, so anything that waits for keys needs a way out
  if (onKey && navigator.maxTouchPoints > 0) {
    const button = document.createElement("button");
    button.id = "program-exit";
    button.textContent = "exit";
    button.addEventListener("click", current.exit);
    el.appendChild(button);
  }

  return current;
}

document.addEventListener("keydown", (e) => {
  if (!program) return;
  if (["Shift", "Control", "Alt", "Meta"].includes(e.key) || /^F\d+$/.test(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && e.key !== "c") return;
  e.preventDefault();
  e.stopPropagation();
  if (program.onKey) program.onKey(e);
}, true);

// ---------------------------------------------------------------------------
//  Commands
// ---------------------------------------------------------------------------

const commands = {};

// ---------------------------------------------------------------------------
//  Input handling
// ---------------------------------------------------------------------------

function executeCommand(line) {
  // Echo the prompt + command
  const echo = document.createElement("span");
  echo.className = "prompt-echo";
  echo.textContent = `guest@web:${cwdDisplay()}$ `;
  outputEl.appendChild(echo);
  print(line);

  const trimmed = line.trim();
  if (!trimmed) return;

  history.push(trimmed);
  historyIndex = history.length;
  saveHistory();

  const segments = parsePipeline(tokenize(trimmed));
  if (!segments) {
    print("syntax error: incomplete pipe or redirect", "error");
    return;
  }

  let stdin;
  for (let i = 0; i < segments.length; i++) {
    const { tokens, redirectFile, redirectAppend } = segments[i];
    const [cmd, ...args] = tokens;

    if (!Object.hasOwn(commands, cmd)) {
      print(`${cmd}: command not found`, "error");
      return;
    }

    if (i === segments.length - 1 && !redirectFile) {
      commands[cmd](args, stdin);
      return;
    }

    const input = stdin;
    stdin = captureOutput(() => commands[cmd](args, input));

    if (redirectFile) {
      writeRedirect(redirectFile, redirectAppend, stdin);
      stdin = "";
    }
  }
}

/** Split a line into words and { op } tokens, respecting simple quoting */
function tokenize(line) {
  const tokens = [];
  let current = "";
  let inQuote = null;
  const flush = () => {
    if (current) tokens.push(current);
    current = "";
  };

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " ") {
      flush();
    } else if (ch === "|") {
      flush();
      tokens.push({ op: "|" });
    } else if (ch === ">") {
      flush();
      if (line[i + 1] === ">") {
        tokens.push({ op: ">>" });
        i++;
      } else {
        tokens.push({ op: ">" });
      }
    } else {
      current += ch;
    }
  }
  flush();
  return tokens;
}

/** Group tokens into pipeline segments, or return null if the syntax is broken */
function parsePipeline(tokens) {
  const segments = [{ tokens: [], redirectFile: null, redirectAppend: false }];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const segment = segments[segments.length - 1];
    if (token.op === "|") {
      segments.push({ tokens: [], redirectFile: null, redirectAppend: false });
    } else if (token.op) {
      const target = tokens[i + 1];
      if (typeof target !== "string") return null;
      segment.redirectFile = target;
      segment.redirectAppend = token.op === ">>";
      i++;
    } else {
      segment.tokens.push(token);
    }
  }

  return segments.every((s) => s.tokens.length > 0) ? segments : null;
}

function writeRedirect(redirectFile, redirectAppend, content) {
  const parts = resolvePath(redirectFile);
  const name = parts.pop();
  const parentNode = getNode(parts);

  if (!parentNode || parentNode.type !== "dir") {
    print(`redirect: ${redirectFile}: No such file or directory`, "error");
    return;
  }

  if (parentNode.children[name] && parentNode.children[name].type === "dir") {
    print(`redirect: ${redirectFile}: Is a directory`, "error");
  } else if (redirectAppend && parentNode.children[name]) {
    parentNode.children[name].content += (parentNode.children[name].content ? "\n" : "") + content;
    saveFs();
  } else {
    parentNode.children[name] = { type: "file", content };
    saveFs();
  }
}

// ---------------------------------------------------------------------------
//  Tab completion
// ---------------------------------------------------------------------------

function tabComplete() {
  const value = inputEl.value;
  const cursorPos = inputEl.selectionStart;
  const beforeCursor = value.slice(0, cursorPos);

  // Split into tokens, but keep track of the raw partial at the end
  const spaceIndex = beforeCursor.lastIndexOf(" ");
  const partial = spaceIndex === -1 ? beforeCursor : beforeCursor.slice(spaceIndex + 1);
  const prefix = beforeCursor.slice(0, beforeCursor.length - partial.length);
  const isCommand = prefix.trim() === "" || prefix.trimEnd().endsWith("|");

  if (isCommand) {
    // Complete command names
    const matches = Object.keys(commands).filter((c) => c.startsWith(partial));
    if (matches.length === 1) {
      inputEl.value = prefix + matches[0] + " " + value.slice(cursorPos);
      inputEl.selectionStart = inputEl.selectionEnd = prefix.length + matches[0].length + 1;
    } else if (matches.length > 1) {
      const common = longestCommonPrefix(matches);
      if (common.length > partial.length) {
        inputEl.value = prefix + common + value.slice(cursorPos);
        inputEl.selectionStart = inputEl.selectionEnd = prefix.length + common.length;
      } else {
        // Show all matches
        print(`\nguest@web:${cwdDisplay()}$ ${value}`);
        print(matches.join("  "));
      }
    }
    return;
  }

  // Complete file/directory names
  // Separate the path portion from the name prefix
  const lastSlash = partial.lastIndexOf("/");
  let dirPath, namePrefix;
  if (lastSlash === -1) {
    dirPath = ".";
    namePrefix = partial;
  } else {
    dirPath = partial.slice(0, lastSlash) || "/";
    namePrefix = partial.slice(lastSlash + 1);
  }

  const dirParts = resolvePath(dirPath);
  const dirNode = getNode(dirParts);
  if (!dirNode || dirNode.type !== "dir") return;

  const matches = Object.keys(dirNode.children).filter((n) => {
    return n.startsWith(namePrefix) && (namePrefix.startsWith(".") || !n.startsWith("."));
  });
  if (matches.length === 0) return;

  const buildCompletion = (name) => {
    const child = dirNode.children[name];
    const suffix = child.type === "dir" ? "/" : " ";
    const pathPrefix = lastSlash === -1 ? "" : partial.slice(0, lastSlash + 1);
    return pathPrefix + name + suffix;
  };

  if (matches.length === 1) {
    const completed = buildCompletion(matches[0]);
    const before = beforeCursor.slice(0, spaceIndex + 1);
    inputEl.value = before + completed + value.slice(cursorPos);
    inputEl.selectionStart = inputEl.selectionEnd = before.length + completed.length;
  } else {
    const common = longestCommonPrefix(matches);
    if (common.length > namePrefix.length) {
      const pathPrefix = lastSlash === -1 ? "" : partial.slice(0, lastSlash + 1);
      const before = beforeCursor.slice(0, spaceIndex + 1);
      inputEl.value = before + pathPrefix + common + value.slice(cursorPos);
      inputEl.selectionStart = inputEl.selectionEnd = before.length + pathPrefix.length + common.length;
    } else {
      // Show all matches, with directories marked
      const display = matches.map((n) => {
        return dirNode.children[n].type === "dir" ? n + "/" : n;
      });
      print(`\nguest@web:${cwdDisplay()}$ ${value}`);
      print(display.join("  "));
    }
  }
}

function longestCommonPrefix(strings) {
  if (strings.length === 0) return "";
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const line = inputEl.value;
    inputEl.value = "";
    executeCommand(line);
    scrollToBottom();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      inputEl.value = history[historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      inputEl.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      inputEl.value = "";
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    tabComplete();
    scrollToBottom();
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    commands.clear();
  }
});

// Keep focus on input when clicking, but allow text selection
document.addEventListener("click", (e) => {
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) return;
  if (e.target.closest("#header")) return;
  if (program) return;
  inputEl.focus();
});

// ---------------------------------------------------------------------------
//  Theme
// ---------------------------------------------------------------------------

const themeSelect = document.getElementById("theme-select");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("webterm_theme", theme); } catch (e) { /* ignore */ }
}

// Restore saved theme
try {
  const saved = localStorage.getItem("webterm_theme");
  if (saved) {
    applyTheme(saved);
    themeSelect.value = saved;
  }
} catch (e) { /* ignore */ }

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
  inputEl.focus();
});

// ---------------------------------------------------------------------------
//  Boot
// ---------------------------------------------------------------------------

updatePrompt();
