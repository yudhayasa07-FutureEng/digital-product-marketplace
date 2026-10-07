'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { useToast } from './ToastContext';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: 'buyer' | 'seller') => Promise<void>;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const supabase = createClient();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { refreshUser(); }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=/dashboard' },
    });
    if (oauthError) {
      error(oauthError.message);
      setLoading(false);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    success('Berhasil keluar');
  };

  const switchRole = async (role: 'buyer' | 'seller') => {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_mode: role }),
    });
    const data = await res.json();
    if (!res.ok) { error(data.error || 'Gagal mengganti mode'); return; }
    setUser(data.user);
    success(role === 'seller' ? 'Mode Seller aktif' : 'Mode Buyer aktif');
  };

  return <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, switchRole, refreshUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
