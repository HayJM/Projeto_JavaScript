// Sistema de Banco de Dados SQLite para o Snake Game
class DatabaseManager {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Iniciando carregamento do SQL.js...');
        
        // Verificar se initSqlJs está disponível
        if (typeof initSqlJs === 'undefined') {
          throw new Error('SQL.js não está carregado. Verifique se o script está incluído.');
        }

        // Carregar SQL.js
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });

        console.log('SQL.js carregado com sucesso!');

        // Tentar carregar banco existente do localStorage
        const savedDb = localStorage.getItem('snakeGameDB');
        let dbData = null;
        
        if (savedDb) {
          try {
            // Converter base64 de volta para Uint8Array
            const binaryString = atob(savedDb);
            dbData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              dbData[i] = binaryString.charCodeAt(i);
            }
            console.log('Banco existente carregado do localStorage');
          } catch (err) {
            console.warn('Erro ao carregar banco do localStorage, criando novo:', err);
            dbData = null;
          }
        }

        // Criar ou abrir banco
        this.db = new SQL.Database(dbData);
        
        // Criar tabelas se não existirem
        this.createTables();
        
        console.log('Banco de dados inicializado com sucesso!');
        resolve();
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        // Fallback: usar localStorage simples
        this.useFallbackStorage();
        resolve();
      }
    });

    return this.initPromise;
  }

  useFallbackStorage() {
    console.log('Usando sistema de fallback (localStorage simples)');
    this.db = 'fallback';
  }

  createTables() {
    if (this.db === 'fallback') {
      // No fallback mode, tables are simulated in localStorage
      return;
    }
    
    try {
      // Tabela de usuários
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de estatísticas dos jogadores
      this.db.run(`
        CREATE TABLE IF NOT EXISTS player_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          best_score INTEGER DEFAULT 0,
          max_level_reached INTEGER DEFAULT 1,
          total_games_played INTEGER DEFAULT 0,
          total_points_scored INTEGER DEFAULT 0,
          total_play_time INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de histórico de jogos
      this.db.run(`
        CREATE TABLE IF NOT EXISTS game_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          max_level_reached INTEGER NOT NULL,
          play_time INTEGER NOT NULL,
          game_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Tabela de rankings
      this.db.run(`
        CREATE TABLE IF NOT EXISTS rankings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          level_reached INTEGER NOT NULL,
          achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      this.saveDatabase();
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
    }
  }

  saveDatabase() {
    try {
      // Exportar banco para Uint8Array
      const data = this.db.export();
      
      // Converter para base64 para armazenar no localStorage
      let binary = '';
      for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      
      // Salvar no localStorage
      localStorage.setItem('snakeGameDB', base64);
    } catch (error) {
      console.error('Erro ao salvar banco de dados:', error);
    }
  }

  async createUser(username, password) {
    if (!this.db) {
      await this.initialize();
    }
    
    // Fallback mode
    if (this.db === 'fallback') {
      return this.createUserFallback(username, password);
    }
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, password) 
        VALUES (?, ?)
      `);
      
      const result = stmt.run([username, password]);
      const userId = result.lastInsertRowid;
      
      // Criar estatísticas iniciais para o usuário
      const statsStmt = this.db.prepare(`
        INSERT INTO player_stats (user_id) 
        VALUES (?)
      `);
      statsStmt.run([userId]);
      
      stmt.free();
      statsStmt.free();
      this.saveDatabase();
      
      return { success: true, userId };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      if (error && error.message && error.message.includes('UNIQUE constraint failed')) {
        return { success: false, error: 'Usuário já existe!' };
      }
      return { success: false, error: 'Erro ao criar usuário: ' + (error?.message || 'Erro desconhecido') };
    }
  }

  createUserFallback(username, password) {
    try {
      const users = JSON.parse(localStorage.getItem('snakeUsers') || '{}');
      
      if (users[username]) {
        return { success: false, error: 'Usuário já existe!' };
      }
      
      const userId = Date.now(); // ID simples baseado em timestamp
      
      users[username] = {
        id: userId,
        password: password,
        stats: {
          best_score: 0,
          max_level_reached: 1,
          total_games_played: 0,
          total_points_scored: 0,
          total_play_time: 0
        },
        history: []
      };
      
      localStorage.setItem('snakeUsers', JSON.stringify(users));
      return { success: true, userId };
    } catch (error) {
      return { success: false, error: 'Erro ao criar usuário: ' + (error?.message || 'Erro desconhecido') };
    }
  }

  async authenticateUser(username, password) {
    if (!this.db) {
      await this.initialize();
    }
    
    // Fallback mode
    if (this.db === 'fallback') {
      return this.authenticateUserFallback(username, password);
    }
    
    try {
      const stmt = this.db.prepare(`
        SELECT id, username FROM users 
        WHERE username = ? AND password = ?
      `);
      
      const result = stmt.getAsObject([username, password]);
      stmt.free();
      
      if (result.id) {
        return { success: true, user: result };
      } else {
        return { success: false, error: 'Usuário ou senha incorretos!' };
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, error: 'Erro na autenticação: ' + (error?.message || 'Erro desconhecido') };
    }
  }

  authenticateUserFallback(username, password) {
    try {
      const users = JSON.parse(localStorage.getItem('snakeUsers') || '{}');
      
      if (users[username] && users[username].password === password) {
        return { 
          success: true, 
          user: { 
            id: users[username].id, 
            username: username 
          } 
        };
      } else {
        return { success: false, error: 'Usuário ou senha incorretos!' };
      }
    } catch (error) {
      return { success: false, error: 'Erro na autenticação: ' + (error?.message || 'Erro desconhecido') };
    }
  }

  async getUserStats(userId) {
    if (!this.db) {
      await this.initialize();
    }
    
    // Fallback mode
    if (this.db === 'fallback') {
      return this.getUserStatsFallback(userId);
    }
    
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM player_stats 
        WHERE user_id = ?
      `);
      
      const result = stmt.getAsObject([userId]);
      stmt.free();
      
      return result || {
        best_score: 0,
        max_level_reached: 1,
        total_games_played: 0,
        total_points_scored: 0,
        total_play_time: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        best_score: 0,
        max_level_reached: 1,
        total_games_played: 0,
        total_points_scored: 0,
        total_play_time: 0
      };
    }
  }

  getUserStatsFallback(userId) {
    try {
      const users = JSON.parse(localStorage.getItem('snakeUsers') || '{}');
      
      // Encontrar usuário pelo ID
      for (let username in users) {
        if (users[username].id === userId) {
          return users[username].stats || {
            best_score: 0,
            max_level_reached: 1,
            total_games_played: 0,
            total_points_scored: 0,
            total_play_time: 0
          };
        }
      }
      
      return {
        best_score: 0,
        max_level_reached: 1,
        total_games_played: 0,
        total_points_scored: 0,
        total_play_time: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas (fallback):', error);
      return {
        best_score: 0,
        max_level_reached: 1,
        total_games_played: 0,
        total_points_scored: 0,
        total_play_time: 0
      };
    }
  }

  async updateUserStats(userId, gameData) {
    // Fallback mode
    if (this.db === 'fallback') {
      return this.updateUserStatsFallback(userId, gameData);
    }
    
    try {
      const currentStats = await this.getUserStats(userId);
      
      const newBestScore = Math.max(currentStats.best_score || 0, gameData.score);
      const newMaxLevel = Math.max(currentStats.max_level_reached || 1, gameData.maxLevel);
      const newTotalGames = (currentStats.total_games_played || 0) + 1;
      const newTotalPoints = (currentStats.total_points_scored || 0) + gameData.score;
      const newTotalTime = (currentStats.total_play_time || 0) + (gameData.playTime || 0);
      
      const stmt = this.db.prepare(`
        UPDATE player_stats 
        SET best_score = ?, 
            max_level_reached = ?, 
            total_games_played = ?, 
            total_points_scored = ?,
            total_play_time = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      
      stmt.run([newBestScore, newMaxLevel, newTotalGames, newTotalPoints, newTotalTime, userId]);
      stmt.free();
      
      // Registrar o jogo no histórico
      await this.addGameToHistory(userId, gameData);
      
      // Atualizar rankings se necessário
      if (gameData.score > (currentStats.best_score || 0)) {
        await this.updateRanking(userId, gameData.score, gameData.maxLevel);
      }
      
      this.saveDatabase();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  updateUserStatsFallback(userId, gameData) {
    try {
      const users = JSON.parse(localStorage.getItem('snakeUsers') || '{}');
      
      // Encontrar usuário pelo ID
      for (let username in users) {
        if (users[username].id === userId) {
          const stats = users[username].stats || {
            best_score: 0,
            max_level_reached: 1,
            total_games_played: 0,
            total_points_scored: 0,
            total_play_time: 0
          };
          
          // Atualizar estatísticas
          stats.best_score = Math.max(stats.best_score, gameData.score);
          stats.max_level_reached = Math.max(stats.max_level_reached, gameData.maxLevel);
          stats.total_games_played = (stats.total_games_played || 0) + 1;
          stats.total_points_scored = (stats.total_points_scored || 0) + gameData.score;
          stats.total_play_time = (stats.total_play_time || 0) + (gameData.playTime || 0);
          
          // Adicionar ao histórico
          if (!users[username].history) {
            users[username].history = [];
          }
          
          users[username].history.unshift({
            score: gameData.score,
            max_level_reached: gameData.maxLevel,
            play_time: gameData.playTime || 0,
            game_date: new Date().toISOString()
          });
          
          // Manter apenas os últimos 10 jogos
          if (users[username].history.length > 10) {
            users[username].history = users[username].history.slice(0, 10);
          }
          
          users[username].stats = stats;
          localStorage.setItem('snakeUsers', JSON.stringify(users));
          break;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar estatísticas (fallback):', error);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  }

  async addGameToHistory(userId, gameData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO game_history (user_id, score, max_level_reached, play_time) 
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([userId, gameData.score, gameData.maxLevel, gameData.playTime || 0]);
      stmt.free();
    } catch (error) {
      console.error('Erro ao adicionar jogo ao histórico:', error);
    }
  }

  async updateRanking(userId, score, level) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO rankings (user_id, score, level_reached) 
        VALUES (?, ?, ?)
      `);
      
      stmt.run([userId, score, level]);
      stmt.free();
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
    }
  }

  async getTopPlayers(limit = 10) {
    try {
      const stmt = this.db.prepare(`
        SELECT u.username, ps.best_score, ps.max_level_reached, ps.total_games_played
        FROM users u
        JOIN player_stats ps ON u.id = ps.user_id
        ORDER BY ps.best_score DESC, ps.max_level_reached DESC
        LIMIT ?
      `);
      
      const results = [];
      stmt.bind([limit]);
      
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Erro ao buscar top players:', error);
      return [];
    }
  }

  async getUserGameHistory(userId, limit = 10) {
    try {
      const stmt = this.db.prepare(`
        SELECT score, max_level_reached, play_time, game_date
        FROM game_history
        WHERE user_id = ?
        ORDER BY game_date DESC
        LIMIT ?
      `);
      
      const results = [];
      stmt.bind([userId, limit]);
      
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }
}

// Instância global do gerenciador de banco
const dbManager = new DatabaseManager();
