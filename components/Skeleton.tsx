'use client';

export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--c-surface)] rounded-xl ${className}`} />
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="w-full bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[var(--c-surface)] animate-pulse flex-shrink-0" />
        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 bg-[var(--c-surface)] animate-pulse rounded-lg" />
          <div className="h-3 w-40 bg-[var(--c-surface)] animate-pulse rounded-lg" />
        </div>
        {/* Arrow */}
        <div className="w-5 h-5 bg-[var(--c-surface)] animate-pulse rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

export function ChatBubbleSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`animate-pulse rounded-2xl px-4 py-3 space-y-2 ${
          isUser
            ? 'bg-[var(--c-surface)] rounded-tr-none max-w-[60%]'
            : 'bg-[var(--c-secondary-50)] rounded-tl-none max-w-[70%] border border-[var(--c-border)]'
        }`}
      >
        <div className={`h-3 rounded-lg bg-[var(--c-surface)] ${isUser ? 'w-32' : 'w-48'}`} />
        <div className={`h-3 rounded-lg bg-[var(--c-surface)] ${isUser ? 'w-20' : 'w-36'}`} />
        {!isUser && <div className="h-3 w-24 rounded-lg bg-[var(--c-surface)]" />}
      </div>
    </div>
  );
}

export function ChatHistorySkeleton() {
  return (
    <div className="space-y-3 px-4 py-4">
      <ChatBubbleSkeleton isUser={false} />
      <ChatBubbleSkeleton isUser={true} />
      <ChatBubbleSkeleton isUser={false} />
      <ChatBubbleSkeleton isUser={true} />
      <ChatBubbleSkeleton isUser={false} />
    </div>
  );
}

export function CharacterListSkeleton() {
  return (
    <div className="space-y-3">
      <CharacterCardSkeleton />
      <CharacterCardSkeleton />
      <CharacterCardSkeleton />
    </div>
  );
}
