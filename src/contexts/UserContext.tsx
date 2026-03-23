import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../hooks/api';

export interface DemoPersona {
  id: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
  portfolioValue: number;
}

interface UserContextValue {
  userId: string;
  personas: DemoPersona[];
  activePersona: DemoPersona | null;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  switchUser: (id: string) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'ada-active-user-id';
const DEFAULT_USER_ID = 'user-aisha';

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID;
    } catch {
      return DEFAULT_USER_ID;
    }
  });
  const [personas, setPersonas] = useState<DemoPersona[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<DemoPersona[]>('/api/users')
      .then((data) => {
        setPersonas(data);
        setIsLoading(false);
        const valid = data.some(p => p.id === userId);
        if (!valid && data.length > 0) {
          const fallbackId = data[0].id;
          setUserId(fallbackId);
          try { localStorage.setItem(STORAGE_KEY, fallbackId); } catch {}
        }
      })
      .catch(() => setIsLoading(false));
  }, []);

  const activePersona = personas.find(p => p.id === userId) ?? null;

  const switchUser = useCallback((newId: string) => {
    setUserId(newId);
    try {
      localStorage.setItem(STORAGE_KEY, newId);
    } catch {}
    setIsPickerOpen(false);
    queryClient.removeQueries();
  }, [queryClient]);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  return (
    <UserContext.Provider value={{
      userId,
      personas,
      activePersona,
      isPickerOpen,
      openPicker,
      closePicker,
      switchUser,
      isLoading,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
