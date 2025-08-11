// Types for the bookstore application

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  wishlist: string[];
  cart: CartItem[];
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  isbn?: string;
  publishedYear?: number;
  rating?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
  addedAt: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  tax: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentInfo: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  shippingInfo: {
    method: string;
    cost: number;
    estimatedDelivery?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  book: string;
  quantity: number;
  price: number;
  title: string;
  author: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface BookFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  author?: string;
  publisher?: string;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'price-low' | 'price-high' | 'rating' | 'newest' | 'oldest' | 'title' | 'author';
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BooksResponse {
  books: Book[];
  pagination: PaginationInfo;
  filters: Partial<BookFilters>;
}
