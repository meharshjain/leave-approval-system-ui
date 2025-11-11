import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: {
    _id: string;
    name: string;
  };
  role: string;
  manager?: {
    _id: string;
    name: string;
    email: string;
  };
  position?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'phone' | 'position'>>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'auth_user';
  const loadStoredUser = (): User | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  };
  const saveUser = (u: User | null) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  };

  const shouldOfflineFallback = (error: any): boolean => {
    // No response or request timed out
    if (!error?.response) return true;
    if (error?.code === 'ECONNABORTED') return true;

    // Dev-server proxy often returns 5xx when backend is down
    const status = Number(error?.response?.status);
    if (status >= 500) return true;

    const message: string = String(error?.message || '').toLowerCase();
    if (message.includes('network error') || message.includes('econn') || message.includes('proxy')) {
      return true;
    }

    return false;
  };

  // Configure axios to include credentials for session-based auth
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      // Optimistically hydrate from localStorage for instant UX
      const stored = loadStoredUser();
      if (stored) {
        setUser(stored);
      }
      try {
        // Use a short timeout during development so the UI doesn't hang if API isn't running
        const response = await axios.get('/api/auth/me', { timeout: 3000 });
        setUser(response.data);
        saveUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Keep stored session if server is unreachable; otherwise clear
        if (!stored) {
          setUser(null);
          saveUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password }, { timeout: 5000 });
      const { user: userData } = response.data;
      setUser(userData);
      saveUser(userData);
    } catch (error: any) {
      if (shouldOfflineFallback(error)) {
        const offlineUser: User = {
          id: 'offline-user',
          name: email.split('@')[0] || 'Offline User',
          email,
          employeeId: 'TEMP-000',
          department: { _id: 'dept-temp', name: 'General' },
          role: 'employee',
        };
        setUser(offlineUser);
        saveUser(offlineUser);
        return;
      }

      const backendMessage = error?.response?.data?.message;
      throw new Error(backendMessage || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      saveUser(null);
    }
  };

  const value = {
    user,
    login,
    signup: async (name: string, email: string, password: string) => {
      try {
        const response = await axios.post('/api/auth/signup', { name, email, password }, { timeout: 5000 });
        const { user: userData } = response.data;
        setUser(userData);
        saveUser(userData);
      } catch (error: any) {
        if (shouldOfflineFallback(error)) {
          const offlineUser: User = {
            id: 'offline-user',
            name,
            email,
            employeeId: 'TEMP-000',
            department: { _id: 'dept-temp', name: 'General' },
            role: 'employee',
          };
          setUser(offlineUser);
          saveUser(offlineUser);
          return;
        }

        const backendMessage = error?.response?.data?.message;
        throw new Error(backendMessage || 'Signup failed');
      }
    },
    logout,
    updateProfile: async (updates: Partial<Pick<User, 'name' | 'phone' | 'position'>>) => {
      if (!user) return;
      try {
        await axios.put('/api/auth/profile', updates, { timeout: 5000 });
        const me = await axios.get('/api/auth/me', { timeout: 5000 });
        setUser(me.data);
        saveUser(me.data);
      } catch (error: any) {
        // Offline fallback: merge locally
        if (shouldOfflineFallback(error)) {
          const merged: User = { ...user, ...updates };
          setUser(merged);
          saveUser(merged);
          return;
        }
        const backendMessage = error?.response?.data?.message;
        throw new Error(backendMessage || 'Update profile failed');
      }
    },
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
