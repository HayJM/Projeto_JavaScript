// Sistema de Classes para o Snake Game

// Classe para gerenciar a cobra
class Snake {
  constructor(gridSize, startX = 160, startY = 160) {
    this.grid = gridSize;
    this.body = [{ x: startX, y: startY }];
    this.direction = { x: gridSize, y: 0 };
    this.head = new Image();
    this.head.src = './imagens/ChatGPT Image 11 de ago. de 2025, 18_34_40.png';
  }

  move() {
    const head = { 
      x: this.body[0].x + this.direction.x, 
      y: this.body[0].y + this.direction.y 
    };
    this.body.unshift(head);
  }

  grow() {
    // Não remove a cauda quando come uma maçã
  }

  removeTail() {
    this.body.pop();
  }

  changeDirection(newDirection) {
    // Impedir movimento na direção oposta
    if (this.direction.x === 0 && newDirection.x !== 0) {
      this.direction = newDirection;
    } else if (this.direction.y === 0 && newDirection.y !== 0) {
      this.direction = newDirection;
    }
  }

  checkSelfCollision() {
    const head = this.body[0];
    return this.body.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    );
  }

  checkWallCollision(canvasWidth, canvasHeight) {
    const head = this.body[0];
    return head.x < 0 || head.x >= canvasWidth || 
           head.y < 0 || head.y >= canvasHeight;
  }

  getHead() {
    return this.body[0];
  }

  getLength() {
    return this.body.length;
  }

  reset(startX = 160, startY = 160) {
    this.body = [{ x: startX, y: startY }];
    this.direction = { x: this.grid, y: 0 };
  }
}

// Classe para gerenciar a maçã
class Apple {
  constructor(gridSize, canvasWidth, canvasHeight) {
    this.grid = gridSize;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.position = this.generateRandomPosition();
  }

  generateRandomPosition() {
    return {
      x: Math.floor(Math.random() * (this.canvasWidth / this.grid)) * this.grid,
      y: Math.floor(Math.random() * (this.canvasHeight / this.grid)) * this.grid
    };
  }

  respawn() {
    this.position = this.generateRandomPosition();
  }

  getPosition() {
    return this.position;
  }

  checkCollision(snakeHead) {
    return snakeHead.x === this.position.x && snakeHead.y === this.position.y;
  }
}

// Classe para renderização
class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grid = 20;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSnake(snake) {
    // Desenhar corpo da cobra como linha contínua
    if (snake.body.length > 1) {
      this.ctx.strokeStyle = "lime";
      this.ctx.lineWidth = this.grid * 0.6; // Corpo 40% mais fino que a cabeça
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      
      this.ctx.beginPath();
      // Começar do centro do primeiro segmento do corpo
      const firstBody = snake.body[1];
      this.ctx.moveTo(firstBody.x + this.grid/2, firstBody.y + this.grid/2);
      
      // Desenhar linha conectando todos os segmentos do corpo
      for (let i = 2; i < snake.body.length; i++) {
        const segment = snake.body[i];
        this.ctx.lineTo(segment.x + this.grid/2, segment.y + this.grid/2);
      }
      this.ctx.stroke();
      
      // Desenhar círculo no primeiro segmento do corpo para conectar com a cabeça
      this.ctx.fillStyle = "lime";
      this.ctx.beginPath();
      this.ctx.arc(
        firstBody.x + this.grid/2, 
        firstBody.y + this.grid/2, 
        (this.grid * 0.6) / 2, 
        0, 
        2 * Math.PI
      );
      this.ctx.fill();
    }

    // Desenhar cabeça da cobra com imagem
    const head = snake.getHead();
    if (snake.head.complete) {
      this.ctx.drawImage(snake.head, head.x, head.y, this.grid, this.grid);
    } else {
      // Fallback se a imagem não carregar
      this.ctx.fillStyle = "darkgreen";
      this.ctx.beginPath();
      this.ctx.arc(
        head.x + this.grid/2, 
        head.y + this.grid/2, 
        this.grid/2, 
        0, 
        2 * Math.PI
      );
      this.ctx.fill();
    }
  }

  drawApple(apple) {
    const pos = apple.getPosition();
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(pos.x, pos.y, this.grid, this.grid);
  }

  drawGame(snake, apple) {
    this.clear();
    this.drawApple(apple);
    this.drawSnake(snake);
  }
}

// Classe para gerenciar input
class InputManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  handleKeyPress(e) {
    if (!this.gameEngine.isRunning() || this.gameEngine.isPaused()) {
      if (e.key === " ") {
        e.preventDefault();
        this.gameEngine.togglePause();
      }
      return;
    }

    const grid = this.gameEngine.getGrid();
    
    switch (e.key) {
      case "ArrowLeft":
        this.gameEngine.changeSnakeDirection({ x: -grid, y: 0 });
        break;
      case "ArrowRight":
        this.gameEngine.changeSnakeDirection({ x: grid, y: 0 });
        break;
      case "ArrowUp":
        this.gameEngine.changeSnakeDirection({ x: 0, y: -grid });
        break;
      case "ArrowDown":
        this.gameEngine.changeSnakeDirection({ x: 0, y: grid });
        break;
      case " ": // Barra de espaço para pausar
        e.preventDefault();
        this.gameEngine.togglePause();
        break;
    }
  }
}

// Classe para o motor do jogo
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.grid = 20;
    this.snake = new Snake(this.grid);
    this.apple = new Apple(this.grid, canvas.width, canvas.height);
    this.renderer = new GameRenderer(canvas);
    this.inputManager = new InputManager(this);
    
    this.score = 0;
    this.level = 1;
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameStartTime = null;
    this.frameCount = 0;
    
    this.onScoreUpdate = null;
    this.onLevelUpdate = null;
    this.onGameOver = null;
  }

  start() {
    this.reset();
    this.gameRunning = true;
    this.gamePaused = false;
    this.gameStartTime = Date.now();
    this.gameLoop();
  }

  stop() {
    this.gameRunning = false;
  }

  pause() {
    this.gamePaused = true;
  }

  resume() {
    this.gamePaused = false;
    this.gameLoop();
  }

  togglePause() {
    if (this.gamePaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  reset() {
    this.snake.reset();
    this.apple.respawn();
    this.score = 0;
    this.level = 1;
    this.frameCount = 0;
  }

  changeSnakeDirection(direction) {
    this.snake.changeDirection(direction);
  }

  getGameSpeed() {
    // Calcula o nível baseado na pontuação (nível = pontos ÷ 10 + 1)
    const dynamicLevel = Math.floor(this.score / 10) + 1;
    const currentLevel = Math.min(dynamicLevel, 20);
    
    // Atualizar nível se mudou
    if (currentLevel !== this.level) {
      this.level = currentLevel;
      if (this.onLevelUpdate) {
        this.onLevelUpdate(this.level);
      }
    }
    
    // Velocidade: começa muito lenta (nível 1) e acelera progressivamente
    const baseSpeed = 15; // Velocidade inicial muito mais lenta
    const speedReduction = Math.floor(currentLevel * 0.7); // Redução mais gradual
    return Math.max(2, baseSpeed - speedReduction); // Mínimo de 2
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) {
      if (this.gameRunning && !this.gamePaused) {
        requestAnimationFrame(() => this.gameLoop());
      }
      return;
    }

    requestAnimationFrame(() => this.gameLoop());

    // Controla a velocidade baseada no nível
    const gameSpeed = this.getGameSpeed();
    if (++this.frameCount < gameSpeed) return;
    this.frameCount = 0;

    // Mover cobra
    this.snake.move();

    // Verificar colisões
    if (this.snake.checkWallCollision(this.canvas.width, this.canvas.height) ||
        this.snake.checkSelfCollision()) {
      this.gameOver();
      return;
    }

    // Verificar se comeu maçã
    if (this.apple.checkCollision(this.snake.getHead())) {
      this.apple.respawn();
      this.snake.grow(); // Não remove cauda
      this.score++;
      
      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score);
      }
    } else {
      this.snake.removeTail();
    }

    // Renderizar
    this.renderer.drawGame(this.snake, this.apple);
  }

  gameOver() {
    this.gameRunning = false;
    const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        level: this.level,
        playTime: playTime
      });
    }
  }

  getScore() {
    return this.score;
  }

  getLevel() {
    return this.level;
  }

  getGrid() {
    return this.grid;
  }

  isRunning() {
    return this.gameRunning;
  }

  isPaused() {
    return this.gamePaused;
  }

  getPlayTime() {
    if (!this.gameStartTime) return 0;
    return Math.floor((Date.now() - this.gameStartTime) / 1000);
  }
}

// Classe para gerenciar UI
class UIManager {
  constructor() {
    this.currentScreen = null;
  }

  showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Mostrar tela específica
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
      this.currentScreen = screenId;
    }
  }

  updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  updatePlayerInfo(playerName, level, score) {
    this.updateElement('player-name', playerName);
    this.updateElement('game-level', level);
    this.updateElement('score', score);
  }

  updateMenuInfo(username, maxLevel, bestScore, totalGames) {
    this.updateElement('welcome-message', `Bem-vindo, ${username}!`);
    this.updateElement('current-level', maxLevel);
    this.updateElement('best-score', bestScore);
    this.updateElement('games-completed', totalGames);
  }

  updateGameOverInfo(score, level, isNewRecord = false) {
    this.updateElement('final-score', score);
    this.updateElement('final-level', level);
    
    const completion = document.getElementById('level-completion');
    if (isNewRecord) {
      completion.classList.remove('hidden');
    } else {
      completion.classList.add('hidden');
    }
  }

  getCurrentScreen() {
    return this.currentScreen;
  }
}

// Exportar classes (se usando módulos)
// export { Snake, Apple, GameRenderer, InputManager, GameEngine, UIManager };
