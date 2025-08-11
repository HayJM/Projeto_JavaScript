export const APP_NAME = 'BookStore';
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Currency formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const BOOK_CATEGORIES = [
  'Ficção',
  'Romance',
  'Suspense',
  'Tecnologia',
  'Ciência',
  'História',
  'Biografia',
  'Autoajuda',
  'Infantil',
  'Educação'
];

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;
