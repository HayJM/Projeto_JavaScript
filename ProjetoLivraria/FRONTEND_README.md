# Frontend React - BookStore

## Estrutura Criada

### Componentes
- **Header.tsx** - Cabeçalho com navegação, busca e menu do usuário
- **Footer.tsx** - Rodapé com links e informações
- **BookCard.tsx** - Card para exibir livros com preço, estoque e ações
- **ProtectedRoute.tsx** - Componente para proteger rotas autenticadas

### Páginas
- **Home.tsx** - Página inicial com livros em destaque e categorias
- **Login.tsx** - Página de login com validação
- **Register.tsx** - Página de cadastro com validação
- **Books.tsx** - Lista de livros com filtros e busca

### Serviços
- **api.ts** - Configuração do Axios
- **authService.ts** - Serviços de autenticação (login, register, profile)
- **bookService.ts** - Serviços para livros (CRUD)

### Hooks
- **useAuth.tsx** - Context e hooks para autenticação

### Tipos
- **types/index.ts** - Definições TypeScript (User, Book, Order, etc.)

### Utilitários
- **utils/constants.ts** - Constantes, formatação e validação

### Configuração
- **App.tsx** - Componente principal com roteamento
- **App.css** - Estilos customizados (preparado para Tailwind)

## Funcionalidades Implementadas

### Autenticação
- ✅ Sistema de login/logout
- ✅ Cadastro de usuários  
- ✅ Context para estado global
- ✅ Rotas protegidas
- ✅ Verificação de admin

### Interface
- ✅ Layout responsivo
- ✅ Header com navegação
- ✅ Footer informativo
- ✅ Cards de livros
- ✅ Páginas de auth

### Funcionalidades Básicas
- ✅ Listagem de livros
- ✅ Busca e filtros
- ✅ Categorias
- ✅ Formatação de preços
- ✅ Estados de loading

## Usuários de Teste

Para testar a aplicação, você pode usar os seguintes usuários criados automaticamente:

### Administrador
- **Email**: `admin@bookstore.com`
- **Senha**: `admin123`
- **Nome**: Admin User
- **Tipo**: Administrador (acesso total)
- **Funcionalidades**: 
  - Gerenciar livros (adicionar, editar, remover)
  - Visualizar todas as vendas
  - Gerenciar usuários
  - Acesso ao painel administrativo

### Usuários Regulares

#### João Silva
- **Email**: `joao.silva@email.com`
- **Senha**: `password123`
- **Tipo**: Cliente comum
- **Endereço**: Av. Paulista, 1000 - São Paulo, SP
- **Gêneros favoritos**: Ficção, Fantasy, História

#### Maria Santos
- **Email**: `maria.santos@email.com`
- **Senha**: `password123`
- **Tipo**: Cliente comum
- **Endereço**: Rua dos Três Irmãos, 456 - Rio de Janeiro, RJ
- **Gêneros favoritos**: Romance, Autoajuda, Biografia

#### Carlos Oliveira
- **Email**: `carlos.oliveira@email.com`
- **Senha**: `password123`
- **Tipo**: Cliente comum
- **Endereço**: Rua das Palmeiras, 789 - Belo Horizonte, MG
- **Gêneros favoritos**: Tecnologia, Ciência, Educação

#### Ana Costa
- **Email**: `ana.costa@email.com`
- **Senha**: `password123`
- **Tipo**: Cliente comum
- **Endereço**: Av. Beira Mar, 321 - Fortaleza, CE
- **Gêneros favoritos**: Infantil, Ficção, Fantasy

### Dados de Teste Inclusos
- **📚 12 livros** com diferentes categorias (Fantasy, Ficção, História, Tecnologia, etc.)
- **⭐ Reviews e avaliações** em todos os livros
- **🛒 10 pedidos de exemplo** com diferentes status
- **💝 Listas de desejos** pré-preenchidas
- **🛍️ Carrinhos** com produtos para teste

### Como Usar
1. Acesse a aplicação em `http://localhost:3001`
2. Clique em "Entrar" no header
3. Use um dos emails e senhas acima
4. Explore as funcionalidades disponíveis

### Como Popular o Banco de Dados
Para criar todos os dados de teste, execute no servidor:
```bash
cd server
node seedDatabase.js
```

**Nota**: Os usuários e dados são criados automaticamente quando o script de seed é executado.

## Próximos Passos

### 1. Instalar Dependências
```bash
cd client
npm install axios react-router-dom @types/node
npm install -D tailwindcss postcss autoprefixer
```

### 2. Configurar Tailwind CSS
```bash
npx tailwindcss init -p
```

### 3. Recriar Backend
Como o backend foi desfeito, precisa recriar:
- Models (User, Book, Order)
- Routes (auth, books, orders)  
- Middleware (auth)
- Server.js

### 4. Popular o Banco de Dados
```bash
cd server
node seedDatabase.js
```
Isso criará todos os usuários de teste, livros, reviews e pedidos automaticamente.

### 5. Conectar APIs
- Testar endpoints
- Ajustar responses
- Implementar error handling

### 6. Implementar Funcionalidades Restantes
- Carrinho de compras
- Detalhes do livro
- Perfil do usuário
- Histórico de pedidos
- Painel admin

## Observações

- Todos os componentes estão preparados para funcionar
- Existem alguns erros de lint por dependências não instaladas (react-router-dom)
- As APIs estão mockadas até o backend ser recriado
- O design está responsivo e moderno
- Sistema de tipos TypeScript completo

## Status Atual

**Frontend**: 🟢 Base completa
**Backend**: 🔴 Precisa recriar
**Database**: 🟢 MongoDB rodando
**Dependencies**: 🟡 Precisam ser instaladas
