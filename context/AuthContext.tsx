import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { dispatchCartUpdated, syncAnonymousCartToUser } from '../lib/cart';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: 'student' | 'instructor' | 'admin' | string;
  phone?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: 'student' | 'instructor',
    phone?: string,
    bio?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isInstructor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const saveToken = (token: string | null) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  };

  const getToken = () => localStorage.getItem('token');

  const parseUserFromResponse = (data: any): User | null => {
    if (!data) return null;
    const u = data.user || data;
    const firstName = (u.firstName || '').toString().trim();
    const lastName = (u.lastName || '').toString().trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    return {
      id: (u.id || u._id || '').toString(),
      firstName,
      lastName,
      name: fullName || u.name || firstName || u.email,
      email: u.email,
      role: u.role,
      phone: u.phone ?? null,
      bio: u.bio ?? null
    };
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }

    const json = await res.json();
    const token = json?.data?.token || json?.token;
    saveToken(token);
    const userObj = parseUserFromResponse(json?.data || json);
    setUser(userObj);
    if (userObj?.id) {
      syncAnonymousCartToUser(userObj.id);
      dispatchCartUpdated('Cart synced');
    }
    return userObj;
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'student' | 'instructor' = 'student',
    phone = '',
    bio = ''
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email: normalizedEmail, password, role, phone, bio })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }

    const json = await res.json();
    const token = json?.data?.token || json?.token;
    saveToken(token);
    const userObj = parseUserFromResponse(json?.data || json);
    setUser(userObj);
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const loadMe = async () => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        // Only clear session for actual auth failures.
        if (res.status === 401 || res.status === 403) {
          logout();
        }
        return;
      }
      const json = await res.json();
      const userObj = parseUserFromResponse(json?.data || json);
      setUser(userObj);
      if (userObj?.id) {
        syncAnonymousCartToUser(userObj.id);
        dispatchCartUpdated('Cart synced');
      }
    } catch (e) {
      console.error('Failed to load user', e);
      // Keep token intact on transient network/server errors.
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    user,
    authLoading,
    login,
    register,
    logout,
    refreshUser: loadMe,
    isAuthenticated: !!user,
    isInstructor: user?.role === 'instructor' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
