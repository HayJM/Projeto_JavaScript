import api from './api';
import { ApiResponse, LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
      
      if (response.data.status === 'success' && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store token and user in localStorage
        localStorage.setItem('bookstore_token', token);
        localStorage.setItem('bookstore_user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
      
      if (response.data.status === 'success' && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store token and user in localStorage
        localStorage.setItem('bookstore_token', token);
        localStorage.setItem('bookstore_user', JSON.stringify(user));
        
        return { user, token };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      
      if (response.data.status === 'success' && response.data.data) {
        const user = response.data.data.user;
        localStorage.setItem('bookstore_user', JSON.stringify(user));
        return user;
      }
      
      throw new Error(response.data.message || 'Failed to get profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', userData);
      
      if (response.data.status === 'success' && response.data.data) {
        const user = response.data.data.user;
        localStorage.setItem('bookstore_user', JSON.stringify(user));
        return user;
      }
      
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await api.put<ApiResponse<any>>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Add to wishlist
  async addToWishlist(bookId: string): Promise<string[]> {
    try {
      const response = await api.post<ApiResponse<{ wishlist: string[] }>>(`/auth/wishlist/${bookId}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.wishlist;
      }
      
      throw new Error(response.data.message || 'Failed to add to wishlist');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  },

  // Remove from wishlist
  async removeFromWishlist(bookId: string): Promise<string[]> {
    try {
      const response = await api.delete<ApiResponse<{ wishlist: string[] }>>(`/auth/wishlist/${bookId}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.wishlist;
      }
      
      throw new Error(response.data.message || 'Failed to remove from wishlist');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  },

  // Add to cart
  async addToCart(bookId: string, quantity: number = 1): Promise<{ cart: any[]; cartTotal: number; cartItemsCount: number }> {
    try {
      const response = await api.post<ApiResponse<{ cart: any[]; cartTotal: number; cartItemsCount: number }>>('/auth/cart', {
        bookId,
        quantity
      });
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to add to cart');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add to cart');
    }
  },

  // Remove from cart
  async removeFromCart(bookId: string): Promise<{ cart: any[]; cartTotal: number; cartItemsCount: number }> {
    try {
      const response = await api.delete<ApiResponse<{ cart: any[]; cartTotal: number; cartItemsCount: number }>>(`/auth/cart/${bookId}`);
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to remove from cart');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove from cart');
    }
  },

  // Clear cart
  async clearCart(): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<any>>('/auth/cart');
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to clear cart');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('bookstore_token');
    localStorage.removeItem('bookstore_user');
  },

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('bookstore_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('bookstore_token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  }
};
