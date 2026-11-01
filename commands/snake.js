commands.snake = () => {
  const size = 20;
  const directions = {
    ArrowUp: [0, -1], w: [0, -1],
    ArrowDown: [0, 1], s: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0],
  };

  let snake, food, direction, turns, score, gameOver, timer;
  let best = 0;
  try {
    best = Number(localStorage.getItem("webterm_snake_best")) || 0;
  } catch (e) { /* ignore */ }

  const turn = ([dx, dy]) => {
    const [lastX, lastY] = turns.length ? turns[turns.length - 1] : direction;
    const isSameAxis = dx === lastX || dy === lastY;
    if (!isSameAxis && turns.length < 2) turns.push([dx, dy]);
  };

  const current = startProgram("snake", {
    onKey: (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === "q" || key === "Escape" || (e.ctrlKey && key === "c")) return current.exit();
      if (gameOver && key === "r") return restart();
      if (directions[key]) turn(directions[key]);
    },
    onExit: () => {
      clearTimeout(timer);
      print(`Thanks for playing! Best score: ${best}`, "info");
    },
  });
  if (!current) return;

  const screen = document.createElement("pre");
  screen.className = "program-screen snake";
  current.el.appendChild(screen);

  let swipeStart = null;
  current.el.addEventListener("pointerdown", (e) => {
    swipeStart = [e.clientX, e.clientY];
  });
  current.el.addEventListener("pointerup", (e) => {
    if (!swipeStart) return;
    const dx = e.clientX - swipeStart[0];
    const dy = e.clientY - swipeStart[1];
    swipeStart = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      if (gameOver) restart();
    } else if (Math.abs(dx) > Math.abs(dy)) {
      turn([Math.sign(dx), 0]);
    } else {
      turn([0, Math.sign(dy)]);
    }
  });

  function placeFood() {
    const free = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!snake.some(([sx, sy]) => sx === x && sy === y)) free.push([x, y]);
      }
    }
    return free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }

  function endGame() {
    gameOver = true;
    if (score > best) {
      best = score;
      try {
        localStorage.setItem("webterm_snake_best", String(best));
      } catch (e) { /* ignore */ }
    }
  }

  function step() {
    if (turns.length) direction = turns.shift();
    const x = snake[0][0] + direction[0];
    const y = snake[0][1] + direction[1];
    const ateFood = x === food[0] && y === food[1];
    const body = ateFood ? snake : snake.slice(0, -1);

    if (x < 0 || y < 0 || x >= size || y >= size || body.some(([sx, sy]) => sx === x && sy === y)) {
      endGame();
      render();
      return;
    }

    snake.unshift([x, y]);
    if (ateFood) {
      score++;
      food = placeFood();
      if (!food) {
        endGame();
        render();
        return;
      }
    } else {
      snake.pop();
    }

    render();
    timer = setTimeout(step, Math.max(60, 140 - score * 3));
  }

  function restart() {
    snake = [[10, 10], [9, 10], [8, 10]];
    direction = [1, 0];
    turns = [];
    score = 0;
    gameOver = false;
    food = placeFood();
    render();
    timer = setTimeout(step, 400);
  }

  function render() {
    screen.textContent = "";
    const addText = (text, className) => {
      const span = document.createElement("span");
      if (className) span.className = className;
      span.textContent = text;
      screen.appendChild(span);
    };

    addText(`Score: ${score}   Best: ${Math.max(best, score)}\n`);
    addText("+" + "--".repeat(size) + "+\n");
    for (let y = 0; y < size; y++) {
      addText("|");
      for (let x = 0; x < size; x++) {
        if (snake.some(([sx, sy]) => sx === x && sy === y)) addText("██", "snake-body");
        else if (food && food[0] === x && food[1] === y) addText("██", "snake-food");
        else addText("  ");
      }
      addText("|\n");
    }
    addText("+" + "--".repeat(size) + "+\n");
    addText(gameOver ? "Game over! r or tap: retry   q: quit" : "Arrows, WASD or swipe   q: quit");
  }

  restart();
};
