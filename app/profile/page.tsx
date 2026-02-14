'use client';

import { AppLayout } from '@/components/AppLayout';
import { useConnection } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { User, Heart, MessageCircle, Calendar, ChevronRight, Users, Palette, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile, Persona } from '@/types';
import { getPersonaImage } from '@/lib/persona-images';
import { useTheme, THEMES, BG_PATTERNS, type ThemeKey, type BgPatternKey } from '@/lib/theme';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProfilePage() {
  const { address } = useConnection();
  const { theme, setTheme, bgPattern, setBgPattern } = useTheme();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { 'x-wallet-address': address },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      return data.profile;
    },
    enabled: !!address,
    staleTime: 1000 * 60, // 1 min
  });

  // Fetch all personas for images and details
  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/personas`);
      if (!res.ok) throw new Error('Failed to fetch personas');
      const data = await res.json();
      return data.personas || [];
    },
    staleTime: 1000 * 60 * 5, // 5 min — personas rarely change
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-(--c-primary) rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <p className="text-(--c-muted) text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>

          <div className="bg-(--c-bg) border border-(--c-border) rounded-2xl p-4 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <MessageCircle size={18} className="text-(--c-accent) mb-1" />
              <span className="text-lg font-bold text-white">{profile?.relationships?.length || 0}</span>
              <span className="text-[10px] text-(--c-muted)">Messages</span>
            </div>
            <div className="w-px h-10 bg-(--c-border)" />
            <div className="flex flex-col items-center">
              <Heart size={18} className="text-(--c-accent) mb-1" />
              <span className="text-lg font-bold text-white">{profile?.relationships?.length || 0}</span>
              <span className="text-[10px] text-(--c-muted)">Relationships</span>
            </div>
            <div className="w-px h-10 bg-(--c-border)" />
            <div className="flex flex-col items-center">
              <Calendar size={18} className="text-(--c-accent) mb-1" />
              <span className="text-lg font-bold text-white">1</span>
              <span className="text-[10px] text-(--c-muted)">Days Active</span>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} className="text-(--c-accent)" />
            <h3 className="text-lg font-bold text-white">Theme</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
              const t = THEMES[key];
              const isActive = theme.key === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition ${
                    isActive
                      ? 'border-(--c-primary) bg-(--c-primary-dim)'
                      : 'border-transparent hover:border-(--c-border)'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                    style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
                  />
                  <span className="text-xs text-white font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Pattern Selector */}
        <div className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon size={20} className="text-(--c-accent)" />
            <h3 className="text-lg font-bold text-white">Background</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(BG_PATTERNS) as BgPatternKey[]).map((key) => {
              const p = BG_PATTERNS[key];
              const isActive = bgPattern.key === key;
              return (
                <button
                  key={key}
                  onClick={() => setBgPattern(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition ${
                    isActive
                      ? 'border-(--c-primary) bg-(--c-primary-dim)'
                      : 'border-transparent hover:border-(--c-border)'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: 'var(--c-bg)' }}
                  >
                    {p.src ? (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: 'var(--c-svg-fill)',
                          maskImage: `url('${p.src}')`,
                          maskRepeat: 'repeat',
                          maskSize: key === 'food' ? '40px 40px' : key === 'bubbles' ? '30px 30px' : '24px 24px',
                          WebkitMaskImage: `url('${p.src}')`,
                          WebkitMaskRepeat: 'repeat',
                          WebkitMaskSize: key === 'food' ? '40px 40px' : key === 'bubbles' ? '30px 30px' : '24px 24px',
                        }}
                      />
                    ) : (
                      <span className="text-(--c-muted-dim) text-lg">∅</span>
                    )}
                  </div>
                  <span className="text-xs text-white font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Characters Link */}
        <Link href="/profile/character">
          <div className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-5 flex items-center justify-between hover:border-(--c-border-accent) transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-(--c-primary-dim) rounded-full flex items-center justify-center">
                <Users size={24} className="text-(--c-accent)" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Characters</h3>
                <p className="text-sm text-(--c-muted)">{personas.length} personas available</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-(--c-muted)" />
          </div>
        </Link>

        {/* Relationships - Compact on mobile */}
        {profile?.relationships && profile.relationships.length > 0 && (
          <div className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Heart className="text-(--c-accent)" size={20} />
              Relationships
            </h3>

            {/* Mobile: compact row with avatars */}
            <div className="md:hidden flex items-center gap-3 overflow-x-auto pb-2">
              {profile.relationships.map((rel, idx) => {
                const image = getPersonaImage(rel.persona_name);
                return (
                  <div key={idx} className="flex flex-col items-center shrink-0 min-w-18">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-(--c-primary) mb-1">
                      {image ? (
                        <Image src={image} alt={rel.persona_name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Heart size={20} className="text-white" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white font-medium">{rel.persona_name}</span>
                    <span className="text-[10px] text-(--c-accent)">Lv.{rel.intimacy_level}</span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: detailed list */}
            <div className="hidden md:block space-y-3">
              {profile.relationships.map((rel, idx) => {
                const image = getPersonaImage(rel.persona_name);
                return (
                  <div key={idx} className="bg-(--c-bg) border border-(--c-border) rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-(--c-primary)">
                      {image ? (
                        <Image src={image} alt={rel.persona_name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Heart size={20} className="text-white" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{rel.persona_name}</div>
                      <div className="text-sm text-(--c-muted) capitalize">{rel.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-(--c-accent) font-semibold">Level {rel.intimacy_level}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


