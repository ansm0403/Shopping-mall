'use client'

import { User } from '@shopping-mall/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '../service/auth-storage';
import { getMe } from '../service/auth';

type UserType = Omit<User, 'password'>;

interface AuthContextType {
  user: UserType;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트에서만 토큰 확인
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if(e.key === 'accessToken' || e.key === 'auth:persist') {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      }

      window.addEventListener('storage', onStorage);

      return () => window.removeEventListener('storage', onStorage);
    }
  }, [queryClient]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await getMe();
        return response.data;
      } catch {
        // 토큰이 만료되었거나 유효하지 않으면 null 반환
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: isHydrated,
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated: !!user,
        isHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};