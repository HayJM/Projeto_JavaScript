import React, { useState, useEffect, useCallback } from 'react';
import { Book } from '../types';
import { BookFilters } from '../types';
import { bookService } from '../services/bookService';
import BookCard from '../components/BookCard';
import { BOOK_CATEGORIES } from '../utils/constants';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<BookFilters['sort']>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const booksPerPage = 12;

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        page: currentPage,
        limit: booksPerPage,
        sort: sortBy
      });
      setBooks(response.books);
    } catch (err: any) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, booksPerPage]);

    const filterBooks = useCallback(() => {
    let filtered = [...books];

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    if (sortOrder === 'desc') {
      filtered.reverse();
    }

    setFilteredBooks(filtered);
  }, [books, searchQuery, selectedCategory, sortOrder]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    filterBooks();
  }, [filterBooks]);

  const handleAddToCart = (book: Book) => {
    // TODO: Implement cart logic
    console.log('Adicionando ao carrinho:', book.title);
  };

  const handleViewDetails = (book: Book) => {
    // TODO: Navigate to book details
    console.log('Ver detalhes:', book.title);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy as BookFilters['sort']);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('title');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Carregando livros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center bg-white/80 p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-500 text-3xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Todos os Livros
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre o livro perfeito para você em nossa coleção incrível
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por título, autor ou descrição..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 pl-12 border-2 border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/90 text-gray-700 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  {/* Ícone de lupa dos filtros <------- verifique essa parte */}
                  <svg className="text-blue-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as BookFilters['sort']);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                className="px-4 py-3 border-2 border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 text-gray-700 font-medium"
              >
                <option value="title-asc">Título A-Z</option>
                <option value="title-desc">Título Z-A</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="author-asc">Autor A-Z</option>
                <option value="rating-desc">Melhor Avaliação</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-6 py-3 text-white bg-gradient-to-r from-pink-400 to-red-400 border-2 border-transparent rounded-full hover:from-pink-500 hover:to-red-500 transition-all duration-200 font-medium shadow-lg"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Categorias</h3>
            <div className="flex flex-wrap gap-3">
              {BOOK_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105'
                      : 'bg-white/70 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-600 bg-white/70 px-4 py-2 rounded-full border border-gray-200">
            {filteredBooks.length > 0 ? (
              <>
                <span className="font-semibold text-blue-600">{filteredBooks.length}</span> de <span className="font-semibold">{books.length}</span> livros
                {searchQuery && <span className="text-purple-600"> para "{searchQuery}"</span>}
                {selectedCategory && <span className="text-green-600"> na categoria "{selectedCategory}"</span>}
              </>
            ) : (
              <span className="text-red-500 font-medium">Nenhum livro encontrado</span>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-gray-200">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              Nenhum livro encontrado
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Tente ajustar seus filtros ou termo de busca para encontrar o que procura
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Ver Todos os Livros
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-white/80 p-3 rounded-2xl border border-gray-200 shadow-lg">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-600 border border-gray-200 shadow-sm'
                }`}
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-600 border border-gray-200 shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-600 border border-gray-200 shadow-sm'
                }`}
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
