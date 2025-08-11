import api from './api';
import { ApiResponse, Book, BookFilters, BooksResponse } from '../types';

export const bookService = {
  // Get all books with filters
  async getBooks(filters: BookFilters = {}): Promise<BooksResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<ApiResponse<BooksResponse>>(`/books?${params.toString()}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch books');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
  },

  // Get single book by ID
  async getBook(id: string): Promise<Book> {
    try {
      const response = await api.get<ApiResponse<{ book: Book }>>(`/books/${id}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.book;
      }
      
      throw new Error(response.data.message || 'Failed to fetch book');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
  },

  // Get book categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<{ categories: string[] }>>('/books/categories/list');
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.categories;
      }
      
      throw new Error(response.data.message || 'Failed to fetch categories');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Get featured books
  async getFeaturedBooks(limit: number = 8): Promise<Book[]> {
    try {
      const response = await api.get<ApiResponse<{ books: Book[] }>>(`/books/featured/list?limit=${limit}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.books;
      }
      
      throw new Error(response.data.message || 'Failed to fetch featured books');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured books');
    }
  },

  // Add review to book
  async addReview(bookId: string, rating: number, comment?: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/books/${bookId}/reviews`, {
        rating,
        comment
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to add review');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },

  // Update review
  async updateReview(bookId: string, reviewId: string, rating: number, comment?: string): Promise<any> {
    try {
      const response = await api.put<ApiResponse<any>>(`/books/${bookId}/reviews/${reviewId}`, {
        rating,
        comment
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update review');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  },

  // Delete review
  async deleteReview(bookId: string, reviewId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<any>>(`/books/${bookId}/reviews/${reviewId}`);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  },

  // Admin methods
  admin: {
    // Create book
    async createBook(bookData: Partial<Book>): Promise<Book> {
      try {
        const response = await api.post<ApiResponse<{ book: Book }>>('/books', bookData);
        
        if (response.data.status === 'success' && response.data.data) {
          return response.data.data.book;
        }
        
        throw new Error(response.data.message || 'Failed to create book');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create book');
      }
    },

    // Update book
    async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
      try {
        const response = await api.put<ApiResponse<{ book: Book }>>(`/books/${id}`, bookData);
        
        if (response.data.status === 'success' && response.data.data) {
          return response.data.data.book;
        }
        
        throw new Error(response.data.message || 'Failed to update book');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update book');
      }
    },

    // Delete book
    async deleteBook(id: string): Promise<void> {
      try {
        const response = await api.delete<ApiResponse<any>>(`/books/${id}`);
        
        if (response.data.status !== 'success') {
          throw new Error(response.data.message || 'Failed to delete book');
        }
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete book');
      }
    },

    // Get book statistics
    async getBookStats(): Promise<any> {
      try {
        const response = await api.get<ApiResponse<any>>('/books/admin/stats');
        
        if (response.data.status === 'success' && response.data.data) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || 'Failed to fetch book statistics');
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch book statistics');
      }
    }
  }
};
