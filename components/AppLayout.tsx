'use client';

import { MessageCircle, Wallet, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from '@/lib/theme';
import { useSocket } from '@/hooks/useSocket';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInChat = pathname.startsWith('/dashboard/chat/');
  const { bgPattern } = useTheme();
  useSocket(); // Global WebSocket connection for notifications & proactive messages

  return (
    <div className="flex h-screen w-full bg-(--c-bg) text-white">
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-80 flex-col border-r border-(--c-border-light) bg-[var(--c-secondary)]">
        <div className="p-4 border-b border-(--c-border-light) flex justify-between items-center">
          <h1 className="font-bold text-xl ml-2">My Bini</h1>
          <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <SidebarItem href="/dashboard" icon={<MessageCircle />} label="Chats" />
          <SidebarItem href="/wallet" icon={<Wallet />} label="Wallet" />
          <SidebarItem href="/profile" icon={<User />} label="Profile" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full w-full overflow-hidden">
        {/* Mobile Header (Hidden on Desktop, hidden in chat) */}
        {!isInChat && (
          <header className="md:hidden h-14 bg-[var(--c-secondary)] flex items-center justify-between px-4 border-b border-(--c-border-light) shrink-0 z-10">
            <span className="font-bold">My Bini</span>
            <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          </header>
        )}

        {/* SVG Pattern Background - fixed so it doesn't scroll */}
        {bgPattern.src && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundColor: 'var(--c-svg-fill)',
              maskImage: `url('${bgPattern.src}')`,
              maskRepeat: 'repeat',
              maskSize: bgPattern.size,
              WebkitMaskImage: `url('${bgPattern.src}')`,
              WebkitMaskRepeat: 'repeat',
              WebkitMaskSize: bgPattern.size,
            }}
          />
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>

        {/* MOBILE BOTTOM NAV (Hidden on Desktop, hidden in chat) */}
        {!isInChat && (
          <nav className="md:hidden h-16 bg-[var(--c-secondary)] border-t border-(--c-border-light) flex items-center justify-around shrink-0 z-10 pb-safe">
            <MobileNavItem href="/dashboard" icon={<MessageCircle />} label="Chats" />
            <MobileNavItem href="/wallet" icon={<Wallet />} label="Wallet" />
            <MobileNavItem href="/profile" icon={<User />} label="Settings" />
          </nav>
        )}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 hover:bg-[var(--c-hover-bg)] transition ${
        isActive ? 'bg-[var(--c-hover-bg)] border-l-4 border-[var(--c-primary)]' : ''
      }`}
    >
      <div className={isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]'}>{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function MobileNavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-full h-full">
      <div className={`${isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]'}`}>{icon}</div>
      <span className={`text-[10px] mt-1 ${isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted-dim)]'}`}>{label}</span>
    </Link>
  );
}
