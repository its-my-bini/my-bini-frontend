'use client';

import { AppLayout } from '@/components/AppLayout';
import ChatInterface from '@/components/ChatInterface';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const personaId = params.personaId as string;

  return (
    <AppLayout>
      <ChatInterface personaId={personaId} />
    </AppLayout>
  );
}
