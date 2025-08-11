import React from 'react';
import { Book } from '../types';
import { formatPrice } from '../utils/constants';

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
  onViewDetails?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onAddToCart, onViewDetails }) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Book Cover */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
        <div className="text-white text-center p-4">
          <div className="text-xl mb-2" style={{fontSize:'20px'}}>📚</div>
          <div className="text-sm font-medium">{book.title}</div>
        </div>
      </div>
        )}
        
        {/* Stock Badge */}
        {book.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Esgotado
          </div>
        )}
        
        {book.stock > 0 && book.stock <= 5 && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Últimas unidades
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          por {book.author}
        </p>
        
        <p className="text-xs text-gray-500 mb-3">
          {book.category}
        </p>
        
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {book.description}
        </p>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-600" style={{fontSize:'20px'}}>
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(book.originalPrice)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={book.stock === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              book.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {book.stock === 0 ? 'Esgotado' : <span style={{fontSize:'20px'}} role="img" aria-label="Carrinho">🛒</span>}
            {book.stock !== 0 && <span style={{fontSize:'20px'}} role="img" aria-label="Carrinho">🛒</span>}
            {book.stock !== 0 && 'Adicionar'}
          </button>
        </div>

        {/* Rating */}
        {book.rating && (
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={star <= Math.floor(book.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{width:'20px',height:'20px',minWidth:'20px',minHeight:'20px',maxWidth:'20px',maxHeight:'20px'}}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              ({book.rating.toFixed(1)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
