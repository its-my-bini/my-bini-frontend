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

export function WalletSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-full h-full bg-[var(--c-secondary)] mx-auto space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-24 bg-[var(--c-surface)] rounded-lg" />
        <div className="h-10 w-36 bg-[var(--c-surface)] rounded-xl" />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-card)] rounded-2xl p-4">
          <div className="h-4 w-20 bg-[var(--c-surface)] rounded mb-3" />
          <div className="h-9 w-24 bg-[var(--c-surface)] rounded-lg mb-1" />
          <div className="h-3 w-10 bg-[var(--c-surface)] rounded" />
        </div>
        <div className="bg-[var(--c-card)] rounded-2xl p-4">
          <div className="h-4 w-24 bg-[var(--c-surface)] rounded mb-3" />
          <div className="h-9 w-16 bg-[var(--c-surface)] rounded-lg mb-1" />
          <div className="h-3 w-14 bg-[var(--c-surface)] rounded" />
        </div>
      </div>

      {/* Daily Reward Button */}
      <div className="h-12 w-full bg-[var(--c-surface)] rounded-xl" />

      {/* Deposit Section */}
      <div className="bg-[var(--c-card)] rounded-2xl p-4">
        <div className="h-6 w-28 bg-[var(--c-surface)] rounded-lg mb-3" />
        <div className="h-24 w-full bg-[var(--c-surface)] rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-card)] rounded-xl p-3">
          <div className="h-4 w-16 bg-[var(--c-surface)] rounded mx-auto mb-2" />
          <div className="h-6 w-8 bg-[var(--c-surface)] rounded mx-auto" />
        </div>
        <div className="bg-[var(--c-card)] rounded-xl p-3">
          <div className="h-4 w-20 bg-[var(--c-surface)] rounded mx-auto mb-2" />
          <div className="h-6 w-8 bg-[var(--c-surface)] rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-full bg-[var(--c-secondary)] mx-auto space-y-4 animate-pulse">
      {/* Profile Card */}
      <div className="bg-[var(--c-card)] rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[var(--c-surface)] rounded-full" />
          <div>
            <div className="h-7 w-20 bg-[var(--c-surface)] rounded-lg mb-2" />
            <div className="h-4 w-32 bg-[var(--c-surface)] rounded" />
          </div>
        </div>
        <div className="bg-[var(--c-bg)] rounded-xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-6 w-6 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-3 w-14 bg-[var(--c-surface)] rounded" />
          </div>
          <div className="w-px h-10 bg-[var(--c-border)]" />
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-6 w-6 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-3 w-16 bg-[var(--c-surface)] rounded" />
          </div>
          <div className="w-px h-10 bg-[var(--c-border)]" />
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-6 w-6 bg-[var(--c-surface)] rounded mb-1" />
            <div className="h-3 w-16 bg-[var(--c-surface)] rounded" />
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-[var(--c-card)] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 bg-[var(--c-surface)] rounded" />
          <div className="h-6 w-16 bg-[var(--c-surface)] rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[var(--c-surface)] rounded-full" />
              <div className="h-3 w-10 bg-[var(--c-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Background Selector */}
      <div className="bg-[var(--c-card)] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 bg-[var(--c-surface)] rounded" />
          <div className="h-6 w-24 bg-[var(--c-surface)] rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[var(--c-surface)] rounded-full" />
              <div className="h-3 w-10 bg-[var(--c-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Characters Link */}
      <div className="bg-[var(--c-card)] rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--c-surface)] rounded-full" />
          <div>
            <div className="h-6 w-24 bg-[var(--c-surface)] rounded-lg mb-1" />
            <div className="h-4 w-32 bg-[var(--c-surface)] rounded" />
          </div>
        </div>
        <div className="w-6 h-6 bg-[var(--c-surface)] rounded" />
      </div>
    </div>
  );
}
