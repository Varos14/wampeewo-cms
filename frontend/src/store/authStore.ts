import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

type StoredAuth = { user: User; token: string };

const loadStoredAuth = (): StoredAuth | null => {
  try {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;
    return JSON.parse(stored) as StoredAuth;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()((set) => {
  const stored = loadStoredAuth();

  return {
    user: stored?.user ?? null,
    token: stored?.token ?? null,
    setAuth: (user: User, token: string) => {
      set({ user, token });
      localStorage.setItem('auth', JSON.stringify({ user, token }));
    },
    logout: () => {
      set({ user: null, token: null });
      localStorage.removeItem('auth');
    },
  };
});
