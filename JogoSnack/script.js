// Sistema de Autenticação e Progressão
class GameManager {
  constructor() {
    this.currentUser = null;
    this.currentUserId = null;
    this.currentLevel = 1;
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameStartTime = null;
    this.canvas = null;
    this.ctx = null;
    this.grid = 20;
    this.count = 0;
    this.snake = [];
    this.dx = 0;
    this.dy = 0;
    this.apple = {};
    this.score = 0;
    this.snakeHead = new Image();
    this.snakeHead.src = './imagens/ChatGPT Image 11 de ago. de 2025, 18_34_40.png';
    
    this.initializeScreens();
  }

  async initializeScreens() {
    try {
      // Inicializar banco de dados
      await dbManager.initialize();
      
      // Verificar se há usuário logado
      const savedUser = localStorage.getItem('currentUser');
      const savedUserId = localStorage.getItem('currentUserId');
      
      if (savedUser && savedUserId) {
        this.currentUser = JSON.parse(savedUser);
        this.currentUserId = JSON.parse(savedUserId);
        this.showMenuScreen();
      } else {
        this.showAuthScreen();
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error);
      alert('Erro ao inicializar o banco de dados. Usando modo offline.');
      this.showAuthScreen();
    }
  }

  // Gestão de Telas
  showAuthScreen() {
    this.hideAllScreens();
    document.getElementById('auth-screen').classList.remove('hidden');
  }

  showMenuScreen() {
    this.hideAllScreens();
    document.getElementById('menu-screen').classList.remove('hidden');
    this.updateMenuInfo();
  }

  showStatsScreen() {
    this.hideAllScreens();
    document.getElementById('stats-screen').classList.remove('hidden');
    this.loadUserStats();
  }

  showRankingScreen() {
    this.hideAllScreens();
    document.getElementById('ranking-screen').classList.remove('hidden');
    this.loadRanking();
  }

  showGameScreen() {
    this.hideAllScreens();
    document.getElementById('game-screen').classList.remove('hidden');
    this.initializeGame();
  }

  showGameOverScreen(levelCompleted = false) {
    this.hideAllScreens();
    document.getElementById('gameover-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = this.score;
    
    // Mostrar o nível máximo alcançado nesta partida
    const maxLevelReached = Math.min(Math.floor(this.score / 10) + 1, 20);
    document.getElementById('final-level').textContent = maxLevelReached;
    
    // No modo contínuo, não há "conclusão de nível" específica
    // Mas podemos mostrar se alcançou um novo nível máximo
    const userData = this.getUserData();
    if (maxLevelReached > (userData.unlockedLevel || 1)) {
      document.getElementById('level-completion').classList.remove('hidden');
      document.querySelector('#level-completion h3').textContent = '🎉 Novo Nível Máximo Alcançado!';
      document.querySelector('#level-completion p').textContent = `Você chegou ao nível ${maxLevelReached}!`;
    } else {
      document.getElementById('level-completion').classList.add('hidden');
    }
  }

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
  }

  // Sistema de Usuários
  async updateMenuInfo() {
    try {
      if (this.currentUserId) {
        const userData = await dbManager.getUserStats(this.currentUserId);
        document.getElementById('welcome-message').textContent = `Bem-vindo, ${this.currentUser}!`;
        document.getElementById('current-level').textContent = userData.max_level_reached || 1;
        document.getElementById('best-score').textContent = userData.best_score || 0;
        document.getElementById('games-completed').textContent = userData.total_games_played || 0;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  async loadUserStats() {
    try {
      if (this.currentUserId) {
        const userData = await dbManager.getUserStats(this.currentUserId);
        const history = await dbManager.getUserGameHistory(this.currentUserId, 10);
        
        // Atualizar estatísticas detalhadas
        document.getElementById('stat-best-score').textContent = userData.best_score || 0;
        document.getElementById('stat-max-level').textContent = userData.max_level_reached || 1;
        document.getElementById('stat-total-games').textContent = userData.total_games_played || 0;
        document.getElementById('stat-total-points').textContent = userData.total_points_scored || 0;
        
        // Carregar histórico
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (history.length === 0) {
          historyList.innerHTML = '<p>Nenhum jogo jogado ainda.</p>';
        } else {
          history.forEach(game => {
            const date = new Date(game.game_date).toLocaleDateString('pt-BR');
            const time = new Date(game.game_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
              <div>
                <strong>${game.score} pontos</strong> - Nível ${game.max_level_reached}
              </div>
              <div style="font-size: 0.8em; color: rgba(255,255,255,0.7);">
                ${date} ${time}
              </div>
            `;
            historyList.appendChild(item);
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async loadRanking() {
    try {
      const topPlayers = await dbManager.getTopPlayers(20);
      const rankingList = document.getElementById('ranking-list');
      rankingList.innerHTML = '';
      
      if (topPlayers.length === 0) {
        rankingList.innerHTML = '<p>Nenhum jogador no ranking ainda.</p>';
      } else {
        topPlayers.forEach((player, index) => {
          const item = document.createElement('div');
          item.className = 'ranking-item';
          item.innerHTML = `
            <div class="ranking-position">#${index + 1}</div>
            <div class="ranking-player">
              <strong>${player.username}</strong>
            </div>
            <div class="ranking-stats">
              <div>${player.best_score} pontos</div>
              <div>Nível ${player.max_level_reached}</div>
              <div>${player.total_games_played} jogos</div>
            </div>
          `;
          rankingList.appendChild(item);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    }
  }

  // Sistema de Níveis (modo contínuo - não precisa mais de seleção manual)
  saveGameResult() {
    const userData = this.getUserData();
    userData.gamesCompleted++;
    
    // Atualizar melhor pontuação
    if (this.score > userData.bestScore) {
      userData.bestScore = this.score;
    }
    
    // Calcular o nível máximo alcançado nesta partida
    const maxLevelReached = Math.min(Math.floor(this.score / 10) + 1, 20);
    
    // Atualizar nível desbloqueado se necessário
    if (maxLevelReached > userData.unlockedLevel) {
      userData.unlockedLevel = maxLevelReached;
    }
    
    this.saveUserData(userData);
  }

  // Cálculo de velocidade baseado na pontuação (aumenta a cada 10 pontos)
  getGameSpeed() {
    // Calcula o nível baseado na pontuação (nível = pontos ÷ 10 + 1)
    const dynamicLevel = Math.floor(this.score / 10) + 1;
    // Velocidade máxima no nível 20
    const currentLevel = Math.min(dynamicLevel, 20);
    
    // Atualiza o nível exibido na interface
    if (document.getElementById('game-level')) {
      document.getElementById('game-level').textContent = currentLevel;
    }
    
    // Velocidade: começa muito lenta (nível 1) e acelera progressivamente
    // Baseado na pontuação, não no nível selecionado
    const baseSpeed = 15; // Velocidade inicial muito mais lenta (dobrou de 8 para 15)
    const speedReduction = Math.floor(currentLevel * 0.7); // Redução mais gradual
    return Math.max(2, baseSpeed - speedReduction); // Mínimo de 2 para manter jogabilidade
  }

  getScoreTarget() {
    // No modo contínuo, não há meta específica - o jogo continua indefinidamente
    // Apenas para compatibilidade, mas não será usado
    return Infinity;
  }

  // Inicialização do Jogo
  initializeGame() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    
    // Reset do estado do jogo - sempre inicia no nível 1
    this.currentLevel = 1;
    this.snake = [{ x: 160, y: 160 }];
    this.dx = this.grid;
    this.dy = 0;
    this.apple = { x: 320, y: 320 };
    this.score = 0;
    this.count = 0;
    this.gameRunning = true;
    this.gamePaused = false;
    this.gameStartTime = Date.now(); // Registrar tempo de início
    
    // Atualizar UI
    document.getElementById('player-name').textContent = this.currentUser;
    document.getElementById('game-level').textContent = 1; // Sempre inicia no nível 1
    document.getElementById('score').textContent = this.score;
    
    this.gameLoop();
  }

  getRandomPosition() {
    return Math.floor(Math.random() * (this.canvas.width / this.grid)) * this.grid;
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) {
      if (this.gameRunning) {
        requestAnimationFrame(() => this.gameLoop());
      }
      return;
    }

    requestAnimationFrame(() => this.gameLoop());

    // Controla a velocidade baseada no nível
    const gameSpeed = this.getGameSpeed();
    if (++this.count < gameSpeed) return;
    this.count = 0;

    // Movimento
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Verificar colisões
    if (
      head.x < 0 ||
      head.x >= this.canvas.width ||
      head.y < 0 ||
      head.y >= this.canvas.height ||
      this.snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Comer maçã
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.apple.x = this.getRandomPosition();
      this.apple.y = this.getRandomPosition();
      this.score++;
      document.getElementById('score').textContent = this.score;
      
      // No modo contínuo, não há meta específica - jogo continua indefinidamente
      // A dificuldade aumenta automaticamente a cada 10 pontos através do getGameSpeed()
    } else {
      this.snake.pop();
    }

    // Desenhar
    this.draw();
  }

  draw() {
    // Limpar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar maçã
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(this.apple.x, this.apple.y, this.grid, this.grid);

    // Desenhar corpo da cobra como linha contínua
    if (this.snake.length > 1) {
      this.ctx.strokeStyle = "lime";
      this.ctx.lineWidth = this.grid * 0.6; // Corpo 40% mais fino que a cabeça
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      
      this.ctx.beginPath();
      // Começar do centro do primeiro segmento do corpo
      const firstBody = this.snake[1];
      this.ctx.moveTo(firstBody.x + this.grid/2, firstBody.y + this.grid/2);
      
      // Desenhar linha conectando todos os segmentos do corpo
      for (let i = 2; i < this.snake.length; i++) {
        const segment = this.snake[i];
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

    // Desenhar cabeça da cobra com imagem (tamanho normal)
    if (this.snakeHead.complete) {
      this.ctx.drawImage(this.snakeHead, this.snake[0].x, this.snake[0].y, this.grid, this.grid);
    } else {
      // Fallback se a imagem não carregar
      this.ctx.fillStyle = "darkgreen";
      this.ctx.beginPath();
      this.ctx.arc(
        this.snake[0].x + this.grid/2, 
        this.snake[0].y + this.grid/2, 
        this.grid/2, 
        0, 
        2 * Math.PI
      );
      this.ctx.fill();
    }
  }

  gameOver() {
    this.gameRunning = false;
    // Salvar a pontuação e atualizar estatísticas
    this.saveGameResult();
    this.showGameOverScreen(false);
  }

  async saveGameResult() {
    try {
      if (this.currentUserId) {
        const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000); // Tempo em segundos
        const maxLevelReached = Math.min(Math.floor(this.score / 10) + 1, 20);
        
        const gameData = {
          score: this.score,
          maxLevel: maxLevelReached,
          playTime: playTime
        };
        
        await dbManager.updateUserStats(this.currentUserId, gameData);
      }
    } catch (error) {
      console.error('Erro ao salvar resultado do jogo:', error);
    }
  }
}

// Instância global do gerenciador de jogo
const gameManager = new GameManager();

// Funções de Autenticação
function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  try {
    const result = await dbManager.authenticateUser(username, password);
    
    if (result.success) {
      gameManager.currentUser = result.user.username;
      gameManager.currentUserId = result.user.id;
      localStorage.setItem('currentUser', JSON.stringify(result.user.username));
      localStorage.setItem('currentUserId', JSON.stringify(result.user.id));
      gameManager.showMenuScreen();
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao fazer login. Tente novamente.');
  }
}

async function register() {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;

  if (!username || !password || !confirmPassword) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  if (password !== confirmPassword) {
    alert('As senhas não coincidem!');
    return;
  }

  if (username.length < 3) {
    alert('O nome de usuário deve ter pelo menos 3 caracteres!');
    return;
  }

  if (password.length < 4) {
    alert('A senha deve ter pelo menos 4 caracteres!');
    return;
  }

  try {
    const result = await dbManager.createUser(username, password);
    
    if (result.success) {
      alert('Cadastro realizado com sucesso!');
      showLogin();
      // Limpar campos
      document.getElementById('register-username').value = '';
      document.getElementById('register-password').value = '';
      document.getElementById('register-confirm').value = '';
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
    alert('Erro ao fazer cadastro. Tente novamente.');
  }
}

function logout() {
  gameManager.currentUser = null;
  gameManager.currentUserId = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentUserId');
  gameManager.showAuthScreen();
}

// Funções do Jogo
function startGame() {
  gameManager.showGameScreen();
}

function showStatsScreen() {
  gameManager.showStatsScreen();
}

function showRankingScreen() {
  gameManager.showRankingScreen();
}

function pauseGame() {
  gameManager.gamePaused = !gameManager.gamePaused;
  const btn = document.querySelector('.pause-btn');
  btn.textContent = gameManager.gamePaused ? 'Continuar' : 'Pausar';
}

function backToMenu() {
  gameManager.gameRunning = false;
  gameManager.showMenuScreen();
}

function playAgain() {
  gameManager.showGameScreen();
}

// Controles do teclado
document.addEventListener("keydown", e => {
  if (!gameManager.gameRunning || gameManager.gamePaused) return;

  switch (e.key) {
    case "ArrowLeft":
      if (gameManager.dx === 0) {
        gameManager.dx = -gameManager.grid;
        gameManager.dy = 0;
      }
      break;
    case "ArrowRight":
      if (gameManager.dx === 0) {
        gameManager.dx = gameManager.grid;
        gameManager.dy = 0;
      }
      break;
    case "ArrowUp":
      if (gameManager.dy === 0) {
        gameManager.dy = -gameManager.grid;
        gameManager.dx = 0;
      }
      break;
    case "ArrowDown":
      if (gameManager.dy === 0) {
        gameManager.dy = gameManager.grid;
        gameManager.dx = 0;
      }
      break;
    case " ": // Barra de espaço para pausar
      e.preventDefault();
      pauseGame();
      break;
  }
});
