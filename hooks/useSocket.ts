'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

// Proactive message event payload (from Smart Routine System)
export interface ProactiveMessage {
  id: string;
  content: string;
  sender: 'ai';
  persona_id: string;
  timestamp: string;
}

// Custom event name for inter-component communication
export const PROACTIVE_MSG_EVENT = 'mybini:proactive-message';

export function useSocket() {
  const { address } = useConnection();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address) return;

    try {
      socket = io(API_URL, {
        auth: { walletAddress: address },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        socket!.emit('join', address);
      });

      // Balance updates
      socket.on('balance:update', (data: { balance: number; timestamp: string }) => {
        queryClient.setQueryData(['balance', address], data.balance);
      });

      // System notifications (rewards, errors, etc.)
      socket.on('notification', (data: { title: string; message: string; type: string; timestamp: string }) => {
        const toastFn = data.type === 'error' ? toast.error : data.type === 'warning' ? toast.warning : toast.success;
        toastFn(data.message);
      });

      // Proactive AI messages (Smart Routine: morning, lunch, night check-ins)
      socket.on('message:receive', (data: ProactiveMessage) => {
        // Invalidate chat history so it refetches when user opens chat
        queryClient.invalidateQueries({ queryKey: ['chat-history', address, data.persona_id] });

        // Show toast notification
        const personaName = data.persona_id.charAt(0).toUpperCase() + data.persona_id.slice(1);
        toast.message(`${personaName} sent you a message`, {
          description: data.content.length > 80 ? data.content.slice(0, 80) + '…' : data.content,
        });

        // Dispatch custom event so ChatInterface can pick it up in real-time
        window.dispatchEvent(new CustomEvent(PROACTIVE_MSG_EVENT, { detail: data }));
      });

      socket.on('connect_error', (error) => {
        console.log('WebSocket connection error (will use polling instead):', error.message);
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
    }
  }, [address, queryClient]);

  return socket;
}
