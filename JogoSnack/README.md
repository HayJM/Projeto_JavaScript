# 🐍 Snake Game Pro - Sistema Orientado a Objetos

Um jogo Snake moderno e completo desenvolvido em JavaScript ES6 com arquitetura orientada a objetos, sistema de autenticação, banco de dados SQL e progressão contínua de dificuldade.

## 🎮 Características do Jogo

### ✨ Funcionalidades Principais
- **Sistema de Autenticação Completo** - Login e cadastro de usuários
- **Banco de Dados SQL** - Armazenamento persistente com fallback localStorage
- **Progressão de Dificuldade** - Velocidade aumenta automaticamente a cada 10 pontos
- **Estatísticas Detalhadas** - Histórico de jogos e performance do jogador
- **Ranking Global** - Competição entre todos os jogadores
- **Interface Responsiva** - Design moderno e adaptável
- **Sistema de Pause/Resume** - Controle total do jogo

### 🎯 Mecânicas do Jogo
- Todos os jogadores começam no **Nível 1**
- Dificuldade aumenta **progressivamente a cada 10 pontos**
- Visual aprimorado: **cabeça da cobra mais grossa que o corpo**
- Colisão com paredes e próprio corpo resulta em Game Over
- Pontuação baseada em maçãs coletadas

## 🏗️ Arquitetura do Sistema

### 📦 Estrutura de Classes (Orientação a Objetos)

```
📁 JogoSnack/
├── 📄 index.html          # Interface principal
├── 🎨 style.css           # Estilos e design
├── 🔧 classes.js          # Sistema de classes modular
├── 🎮 script-oo.js        # GameManager orientado a objetos
├── 💾 database.js         # Gerenciamento de dados
└── 📖 README.md           # Documentação
```

### 🔧 Classes Implementadas

#### 1. **GameManager**
- **Responsabilidade**: Coordenação geral do jogo e autenticação
- **Funcionalidades**:
  - Gerenciamento de telas e navegação
  - Autenticação de usuários
  - Coordenação entre diferentes componentes
  - Persistência de dados do jogador

#### 2. **GameEngine**
- **Responsabilidade**: Lógica principal do jogo
- **Funcionalidades**:
  - Loop principal do jogo
  - Controle de velocidade e dificuldade
  - Detecção de colisões
  - Sistema de pause/resume
  - Callbacks para eventos do jogo

#### 3. **Snake**
- **Responsabilidade**: Comportamento da cobra
- **Funcionalidades**:
  - Movimento em todas as direções
  - Crescimento ao comer maçãs
  - Detecção de auto-colisão
  - Renderização diferenciada (cabeça/corpo)

#### 4. **Apple**
- **Responsabilidade**: Gerenciamento das maçãs
- **Funcionalidades**:
  - Geração aleatória de posições
  - Verificação de colisão com a cobra
  - Garantia de spawn em posições válidas

#### 5. **GameRenderer**
- **Responsabilidade**: Renderização visual
- **Funcionalidades**:
  - Desenho do canvas
  - Renderização da cobra (cabeça diferenciada)
  - Renderização das maçãs
  - Limpeza e atualização da tela

#### 6. **InputManager**
- **Responsabilidade**: Controle de entrada
- **Funcionalidades**:
  - Captura de eventos do teclado
  - Prevenção de movimentos inválidos
  - Suporte a múltiplas teclas por direção

#### 7. **UIManager**
- **Responsabilidade**: Interface do usuário
- **Funcionalidades**:
  - Navegação entre telas
  - Atualização de elementos da UI
  - Gerenciamento de estados visuais

#### 8. **DatabaseManager**
- **Responsabilidade**: Persistência de dados
- **Funcionalidades**:
  - Operações SQL com SQL.js
  - Sistema de fallback para localStorage
  - Gerenciamento de usuários e estatísticas

## 🚀 Como Executar

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (Python, Node.js, ou similar)

### Instalação e Execução

1. **Clone ou baixe o projeto**
```bash
git clone <url-do-repositorio>
cd JogoSnack
```

2. **Inicie um servidor local**
```bash
# Usando Python 3
python3 -m http.server 8000

# Usando Python 2
python -m SimpleHTTPServer 8000

# Usando Node.js (se tiver http-server instalado)
npx http-server

# Usando PHP
php -S localhost:8000
```

3. **Acesse no navegador**
```
http://localhost:8000
```

## 🎮 Como Jogar

### 1. **Autenticação**
- Faça login com uma conta existente
- Ou crie uma nova conta no sistema de cadastro

### 2. **Controles**
- **↑** - Mover para cima
- **↓** - Mover para baixo
- **←** - Mover para esquerda
- **→** - Mover para direita
- **Espaço** - Pausar/Continuar (durante o jogo)

### 3. **Objetivo**
- Colete maçãs para aumentar sua pontuação
- Evite colidir com as paredes ou com o próprio corpo
- Alcance a maior pontuação possível
- Compete no ranking global!

## 📊 Sistema de Progressão

### 🎯 Níveis de Dificuldade
- **Nível 1**: Velocidade inicial (todos começam aqui)
- **A cada 10 pontos**: Velocidade aumenta automaticamente
- **Progressão contínua**: Não há limite máximo de nível

### 📈 Sistema de Pontuação
- **+1 ponto** por cada maçã coletada
- **Bônus de velocidade** conforme o nível aumenta
- **Recordes pessoais** salvos automaticamente

### 🏆 Estatísticas Rastreadas
- Melhor pontuação
- Nível máximo alcançado
- Total de jogos jogados
- Total de pontos acumulados
- Histórico detalhado de partidas

## 💾 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura e Canvas API
- **CSS3** - Estilos modernos com Grid/Flexbox
- **JavaScript ES6+** - Lógica do jogo com classes

### Banco de Dados
- **SQL.js** - SQLite no navegador
- **localStorage** - Sistema de fallback
- **Estrutura relacional** - Usuários, estatísticas e histórico

### Arquitetura
- **Orientação a Objetos** - Classes bem definidas
- **Padrão MVC** - Separação de responsabilidades
- **Event-driven** - Sistema baseado em eventos
- **Responsive Design** - Interface adaptável

## 🔧 Estrutura do Banco de Dados

### Tabela: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: user_stats
```sql
CREATE TABLE user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    best_score INTEGER DEFAULT 0,
    max_level_reached INTEGER DEFAULT 1,
    total_games_played INTEGER DEFAULT 0,
    total_points_scored INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Tabela: game_history
```sql
CREATE TABLE game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    max_level_reached INTEGER,
    game_duration INTEGER,
    game_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🛠️ Customização e Expansão

### Adicionando Novas Funcionalidades

1. **Novos Power-ups**
```javascript
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'speed', 'points', 'invincible'
    }
}
```

2. **Diferentes Modos de Jogo**
```javascript
class GameMode {
    constructor(name, rules) {
        this.name = name;
        this.rules = rules;
    }
}
```

3. **Customização Visual**
- Edite `style.css` para alterar cores e estilos
- Modifique `GameRenderer` para novos efeitos visuais

## 🐛 Solução de Problemas

### Problemas Comuns

**Erro: "SQL.js não carregou"**
- O jogo automaticamente usa localStorage como fallback
- Verifique a conexão com a internet para carregar SQL.js

**Jogo não responde aos controles**
- Clique no canvas antes de jogar
- Verifique se o navegador suporta JavaScript ES6

**Dados não são salvos**
- Verifique se o localStorage está habilitado
- Para dados SQL, verifique o console para erros

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use **camelCase** para variáveis e métodos
- Use **PascalCase** para classes
- Comente código complexo
- Mantenha funções pequenas e focadas

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Snake Game Pro** - Desenvolvido com ❤️ usando JavaScript ES6 e arquitetura orientada a objetos.

---

### 🎯 Próximas Funcionalidades
- [ ] Multiplayer online
- [ ] Diferentes skins para a cobra
- [ ] Sistema de conquistas/achievements
- [ ] Modo infinito
- [ ] Power-ups especiais
- [ ] Sons e efeitos sonoros
- [ ] Animações avançadas

---

**Divirta-se jogando Snake Game Pro!** 🐍🎮
