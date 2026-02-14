'use client';

import { useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { useConnection, useDisconnect } from 'wagmi';

interface WalletLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNewUser: boolean;
  onLogin: (name?: string) => Promise<boolean>;
  isAuthenticating: boolean;
}

export default function WalletLoginModal({ 
  isOpen, 
  onClose, 
  isNewUser, 
  onLogin, 
  isAuthenticating 
}: WalletLoginModalProps) {
  const { address } = useConnection();
  const { disconnect } = useDisconnect();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isNewUser && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (isNewUser && name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const success = await onLogin(isNewUser ? name.trim() : undefined);
    if (!success) {
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleClose = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-(--c-card) rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-(--c-border)">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-(--c-muted) hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isNewUser ? 'Welcome to My Bini!' : 'Sign In'}
          </h2>
          <p className="text-(--c-muted) text-sm">
            {isNewUser 
              ? 'Create your account to get started'
              : 'Sign the message to verify your wallet'
            }
          </p>
          {address && (
            <p className="text-(--c-accent) text-xs mt-2 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input (only for new users) */}
          {isNewUser && (
            <div>
              <label className="block text-sm font-medium text-(--c-muted) mb-2">
                <User size={14} className="inline mr-2" />
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-(--c-bg) border border-(--c-border) rounded-xl px-4 py-3 text-white placeholder:text-(--c-muted) focus:outline-none focus:border-(--c-primary) transition"
                maxLength={50}
                autoFocus
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-(--c-primary) hover:bg-(--c-primary-hover) disabled:bg-(--c-secondary-light) disabled:cursor-not-allowed text-(--c-on-primary) font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Waiting for signature...
              </>
            ) : (
              <>Sign & {isNewUser ? 'Create Account' : 'Login'}</>
            )}
          </button>

          <p className="text-xs text-(--c-muted) text-center">
            By signing, you verify ownership of your wallet
          </p>
        </form>
      </div>
    </div>
  );
}
