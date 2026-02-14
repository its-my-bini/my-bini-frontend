'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function useSocket() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address) return;

    // Only connect if backend supports WebSocket
    try {
      // Connect to backend WebSocket with error handling
      socket = io(API_URL, {
        auth: { walletAddress: address },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        socket!.emit('join', address); // Join user-specific room
      });

      // Listen for balance updates (docs: balance:update)
      socket.on('balance:update', (data: { balance: number; timestamp: string }) => {
        console.log('Balance updated:', data.balance);
        queryClient.setQueryData(['balance', address], data.balance);
        toast.success(`Balance updated: ${data.balance} tokens`);
      });

      // Listen for notifications
      socket.on('notification', (data: { title: string; message: string; type: string; timestamp: string }) => {
        const toastFn = data.type === 'error' ? toast.error : data.type === 'warning' ? toast.warning : toast.success;
        toastFn(data.message);
      });

      socket.on('connect_error', (error) => {
        console.log('WebSocket connection error (will use polling instead):', error.message);
        // Don't show error to user, just fallback to polling
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      return () => {
        socket?.disconnect();
        socket = null;
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      // Gracefully fail - app will use regular polling instead
    }
  }, [address, queryClient]);

  return socket;
}
