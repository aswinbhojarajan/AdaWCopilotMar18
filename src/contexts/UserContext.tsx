import React, { createContext, useContext } from 'react';
import { useSession, type AuthUser } from '../hooks/useAuth';

export interface DemoPersona {
  id: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
  portfolioValue: number;
}

interface UserContextValue {
  userId: string;
  authUser: AuthUser | null;
  activePersona: DemoPersona | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession();

  const userId = session?.persona || '';
  const authUser = session ?? null;

  const activePersona: DemoPersona | null = session ? {
    id: session.persona || session.id,
    firstName: session.displayName.split(' ')[0] || 'User',
    lastName: session.displayName.split(' ').slice(1).join(' ') || '',
    riskLevel: (session.mockConfig as any)?.risk_level || 'moderate',
    portfolioValue: (session.mockConfig as any)?.portfolio_value || 0,
  } : null;

  return (
    <UserContext.Provider value={{ userId, authUser, activePersona, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
