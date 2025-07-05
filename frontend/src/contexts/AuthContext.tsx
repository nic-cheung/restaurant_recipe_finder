import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = apiService.getToken();
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Token might be invalid, remove it
          apiService.removeToken();
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      setUser(response.user);
      setToken(response.token);
      apiService.setToken(response.token);
      
      toast.success('Login successful!');
      
      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(credentials);
      
      setUser(response.user);
      setToken(response.token);
      apiService.setToken(response.token);
      
      toast.success('Registration successful!');
      
      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server (if needed)
      if (token) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server call fails
    } finally {
      setUser(null);
      setToken(null);
      apiService.removeToken();
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 