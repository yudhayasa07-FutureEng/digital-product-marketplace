'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role?: UserRole, name?: string) => Promise<boolean>;
  register: (name: string, email: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  quickLoginAs: (role: 'buyer' | 'seller') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        // Default to demo buyer for immediate interactive testing if no session
        const defaultBuyer: User = {
          id: 'user-buyer-1',
          name: 'Ahmad Pratama',
          email: 'buyer@digitalhub.id',
          role: 'buyer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          created_at: new Date().toISOString(),
        };
        // Auto set cookie for seamless out-of-the-box demo
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: defaultBuyer.email, role: 'buyer', name: defaultBuyer.name }),
        });
        setUser(defaultBuyer);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, role?: UserRole, name?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        success(`Selamat datang kembali, ${data.user.name}!`);
        return true;
      } else {
        error(data.error || 'Gagal login');
        return false;
      }
    } catch {
      error('Terjadi kesalahan jaringan');
      return false;
    }
  };

  const register = async (name: string, email: string, role: UserRole = 'buyer'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        success(`Pendaftaran berhasil! Halo, ${data.user.name}`);
        return true;
      } else {
        error(data.error || 'Pendaftaran gagal');
        return false;
      }
    } catch {
      error('Terjadi kesalahan jaringan');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      success('Berhasil keluar');
    } catch {
      setUser(null);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        success(`Beralih ke mode ${newRole === 'seller' ? 'Penjual (Seller)' : 'Pembeli (Buyer)'}`);
      }
    } catch {
      error('Gagal mengganti mode akun');
    }
  };

  const quickLoginAs = async (targetRole: 'buyer' | 'seller') => {
    if (targetRole === 'seller') {
      await login('seller@digitalhub.id', 'seller', 'DevCraft Studio');
    } else {
      await login('buyer@digitalhub.id', 'buyer', 'Ahmad Pratama');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchRole,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
