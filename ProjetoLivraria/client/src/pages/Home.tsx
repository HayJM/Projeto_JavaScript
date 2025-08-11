import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types';
import { bookService } from '../services/bookService';
import BookCard from '../components/BookCard';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({ limit: 8 });
        // Simulando livros em destaque (primeiros 4)
        setFeaturedBooks(response.books.slice(0, 4));
        // Simulando novos lançamentos (últimos 4)
        setNewBooks(response.books.slice(-4));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar livros');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleAddToCart = (book: Book) => {
    // TODO: Implementar lógica do carrinho
    console.log('Adicionando ao carrinho:', book.title);
  };

  const handleViewDetails = (book: Book) => {
    navigate(`/books/${book._id}`);
  };

  const handleViewAllBooks = () => {
    navigate('/books');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white py-20 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Bem-vindo à BookStore
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Descubra milhares de livros incríveis com os melhores preços e entrega rápida
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewAllBooks}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-100 hover:text-purple-600 transition-colors text-lg"
              >
                Explorar Livros
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/register')}
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition-colors text-lg shadow-md"
                >
                  Criar Conta
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 bg-white/80 shadow-sm rounded-xl mt-8 mx-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Input */}
              <input
                type="text"
                placeholder="O que você está procurando?"
                className="w-full px-6 py-4 pl-12 text-lg border-2 border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/90 shadow-sm"
              />
              {/* Ícone de lupa fixado à esquerda */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4a7 7 0 105.196 12.196l4.853 4.854a1 1 0 001.414-1.414l-4.854-4.853A7 7 0 0011 4z"
                  />
                </svg>
              </div>
              {/* Botão de busca */}
              <button className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold shadow hover:from-blue-600 hover:to-pink-500 transition-colors">
                  Buscar
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-blue-700 mb-4 drop-shadow">
              Livros em Destaque
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto opacity-90">
              Descubra os livros mais populares e bem avaliados pelos nossos leitores
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {featuredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={handleViewAllBooks}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow hover:from-blue-600 hover:to-pink-500 transition-colors"
            >
              Ver Todos os Livros
            </button>
          </div>
        </div>
      </section>

      {/* New Releases */}
      <section className="py-16 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl mx-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-purple-700 mb-4 drop-shadow">
              Novos Lançamentos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto opacity-90">
              Seja o primeiro a descobrir os livros que acabaram de chegar
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-pink-600 mb-4 drop-shadow">
              Explore por Categorias
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              { name: 'Ficção', icon: '📚' },
              { name: 'Romance', icon: '💕' },
              { name: 'Tecnologia', icon: '💻' },
              { name: 'História', icon: '🏛️' },
              { name: 'Biografia', icon: '👤' },
              { name: 'Ciência', icon: '🔬' },
              { name: 'Autoajuda', icon: '🌟' },
              { name: 'Infantil', icon: '🧸' },
              { name: 'Suspense', icon: '🔍' },
              { name: 'Educação', icon: '🎓' }
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/books?category=${category.name}`)}
                className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center group border-2 border-blue-100 hover:border-purple-300"
              >
                <div className="text-3xl leading-none mb-2 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl mx-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold mb-4 drop-shadow">
              Fique por Dentro das Novidades
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Receba em primeira mão informações sobre lançamentos, promoções e eventos especiais
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white border-2 border-white/40 bg-white/80"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition-colors shadow">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
