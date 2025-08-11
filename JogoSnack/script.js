const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tamanho da grade
const grid = 20;
let count = 0;

// Estado inicial
let snake = [{ x: 160, y: 160 }];
let dx = grid;
let dy = 0;
let apple = { x: 320, y: 320 };
let score = 0;

function getRandomPosition() {
  return Math.floor(Math.random() * (canvas.width / grid)) * grid;
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  // Controla a velocidade
  if (++count < 5) return;
  count = 0;

  // Movimento
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Fim de jogo (bater na parede)
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    alert("Game Over! Pontuação: " + score);
    document.location.reload();
    return;
  }

  snake.unshift(head);

  // Comer maçã
  if (head.x === apple.x && head.y === apple.y) {
    apple.x = getRandomPosition();
    apple.y = getRandomPosition();
    score++;
  } else {
    snake.pop();
  }

  // Desenhar fundo
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar maçã
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid, grid);

  // Desenhar cobra
  ctx.fillStyle = "lime";
  snake.forEach(segment => ctx.fillRect(segment.x, segment.y, grid, grid));
}

// Controles de teclado
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowLeft":
      if (dx === 0) {
        dx = -grid;
        dy = 0;
      }
      break;
    case "ArrowRight":
      if (dx === 0) {
        dx = grid;
        dy = 0;
      }
      break;
    case "ArrowUp":
      if (dy === 0) {
        dy = -grid;
        dx = 0;
      }
      break;
    case "ArrowDown":
      if (dy === 0) {
        dy = grid;
        dx = 0;
      }
      break;
  }
});

requestAnimationFrame(gameLoop);
