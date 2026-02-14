'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useConnection, useSignMessage, useDisconnect } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import WalletLoginModal from '@/components/WalletLoginModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const AUTH_USER_KEY = 'mybini_user';

export interface AuthUser {
  id: string;
  wallet_address: string;
  token_balance: number;
  created_at: string;
  name?: string;
  username?: string;
  timezone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: AuthUser | null;
  login: (name?: string) => Promise<boolean>;
  logout: () => void;
  address?: string;
  isConnected: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useConnection();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Generate sign message with timestamp
  const generateMessage = useCallback((walletAddress: string) => {
    const timestamp = new Date().toISOString();
    return `Welcome to My Bini!\n\nSign this message to verify your wallet ownership.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
  }, []);

  // Check if user exists in backend
  const checkUserExists = useCallback(async (walletAddress: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { 'x-wallet-address': walletAddress },
      });
      if (res.ok) {
        const data = await res.json();
        return data.profile || null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Login with signature
  const login = useCallback(async (name?: string): Promise<boolean> => {
    if (!address) return false;

    setIsAuthenticating(true);

    try {
      const message = generateMessage(address);
      const signature = await signMessageAsync({ message });

      // Auto-detect user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          signature,
          message,
          name: name || undefined,
          timezone,
        }),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const data = await res.json();
      const authUser = data.user as AuthUser;

      // Store auth state
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

      setUser(authUser);
      setIsAuthenticated(true);
      setShowModal(false);
      setIsAuthenticating(false);

      // Invalidate queries to refetch with new auth
      queryClient.invalidateQueries();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticating(false);
      return false;
    }
  }, [address, signMessageAsync, generateMessage, queryClient]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    disconnect();
    queryClient.clear();
  }, [disconnect, queryClient]);

  // Cancel modal
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    disconnect();
  }, [disconnect]);

  // Auto-check on wallet connect
  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      setIsAuthenticated(false);
      setShowModal(false);
      return;
    }

    // Check stored auth
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        if (parsedUser.wallet_address.toLowerCase() === address.toLowerCase()) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          return;
        }
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    // Check if user exists in backend
    checkUserExists(address).then(existingUser => {
      if (existingUser) {
        // User exists, prompt sign message to login
        setIsNewUser(false);
        setShowModal(true);
      } else {
        // New user, need registration with name
        setIsNewUser(true);
        setShowModal(true);
      }
    });
  }, [isConnected, address, checkUserExists]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        user,
        login,
        logout,
        address,
        isConnected,
      }}
    >
      {children}
      <WalletLoginModal
        isOpen={showModal}
        onClose={handleModalClose}
        isNewUser={isNewUser}
        onLogin={login}
        isAuthenticating={isAuthenticating}
      />
    </AuthContext.Provider>
  );
}
