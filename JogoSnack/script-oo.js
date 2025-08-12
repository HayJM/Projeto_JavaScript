// Sistema de Autenticação e Progressão - Versão Orientada a Objetos
class GameManager {
  constructor() {
    this.currentUser = null;
    this.currentUserId = null;
    this.gameEngine = null;
    this.uiManager = new UIManager();
    
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
    this.uiManager.showScreen('auth-screen');
  }

  showMenuScreen() {
    this.uiManager.showScreen('menu-screen');
    this.updateMenuInfo();
  }

  showStatsScreen() {
    this.uiManager.showScreen('stats-screen');
    this.loadUserStats();
  }

  showRankingScreen() {
    this.uiManager.showScreen('ranking-screen');
    this.loadRanking();
  }

  showGameScreen() {
    this.uiManager.showScreen('game-screen');
    this.initializeGame();
  }

  showGameOverScreen(gameData, isNewRecord = false) {
    this.uiManager.showScreen('gameover-screen');
    this.uiManager.updateGameOverInfo(gameData.score, gameData.level, isNewRecord);
  }

  // Sistema de Usuários
  async updateMenuInfo() {
    try {
      if (this.currentUserId) {
        const userData = await dbManager.getUserStats(this.currentUserId);
        this.uiManager.updateMenuInfo(
          this.currentUser,
          userData.max_level_reached || 1,
          userData.best_score || 0,
          userData.total_games_played || 0
        );
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

  // Inicialização do Jogo
  initializeGame() {
    const canvas = document.getElementById('game');
    this.gameEngine = new GameEngine(canvas);
    
    // Configurar callbacks
    this.gameEngine.onScoreUpdate = (score) => {
      this.uiManager.updateElement('score', score);
    };
    
    this.gameEngine.onLevelUpdate = (level) => {
      this.uiManager.updateElement('game-level', level);
    };
    
    this.gameEngine.onGameOver = (gameData) => {
      this.handleGameOver(gameData);
    };
    
    // Atualizar UI inicial
    this.uiManager.updatePlayerInfo(this.currentUser, 1, 0);
    
    // Iniciar jogo
    this.gameEngine.start();
  }

  async handleGameOver(gameData) {
    try {
      if (this.currentUserId) {
        const currentStats = await dbManager.getUserStats(this.currentUserId);
        const isNewRecord = gameData.score > (currentStats.best_score || 0);
        
        await dbManager.updateUserStats(this.currentUserId, {
          score: gameData.score,
          maxLevel: gameData.level,
          playTime: gameData.playTime
        });
        
        this.showGameOverScreen(gameData, isNewRecord);
      }
    } catch (error) {
      console.error('Erro ao salvar resultado do jogo:', error);
      this.showGameOverScreen(gameData, false);
    }
  }

  // Controles do jogo
  pauseGame() {
    if (this.gameEngine) {
      this.gameEngine.togglePause();
      const btn = document.querySelector('.pause-btn');
      btn.textContent = this.gameEngine.isPaused() ? 'Continuar' : 'Pausar';
    }
  }

  getCurrentScreen() {
    return this.uiManager.getCurrentScreen();
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
  gameManager.pauseGame();
}

function backToMenu() {
  if (gameManager.gameEngine) {
    gameManager.gameEngine.stop();
  }
  gameManager.showMenuScreen();
}

function playAgain() {
  gameManager.showGameScreen();
}
