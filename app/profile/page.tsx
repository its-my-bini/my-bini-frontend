'use client';

import { AppLayout } from '@/components/AppLayout';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { User, Heart, MessageCircle, Calendar, ChevronRight, Users, Palette, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile, Persona } from '@/types';
import { getPersonaImage } from '@/lib/persona-images';
import { useTheme, THEMES, BG_PATTERNS, type ThemeKey, type BgPatternKey } from '@/lib/theme';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProfilePage() {
  const { address } = useAccount();
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
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[var(--c-primary)] rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <p className="text-[var(--c-muted)] text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard icon={<MessageCircle />} label="Total Messages" value={profile?.relationships?.length || 0} />
            <InfoCard icon={<Heart />} label="Relationships" value={profile?.relationships?.length || 0} />
            <InfoCard icon={<Calendar />} label="Days Active" value="1" />
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} className="text-[var(--c-accent)]" />
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
                      ? 'border-[var(--c-primary)] bg-[var(--c-primary-dim)]'
                      : 'border-transparent hover:border-[var(--c-border)]'
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
        <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon size={20} className="text-[var(--c-accent)]" />
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
                      ? 'border-[var(--c-primary)] bg-[var(--c-primary-dim)]'
                      : 'border-transparent hover:border-[var(--c-border)]'
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
                      <span className="text-[var(--c-muted-dim)] text-lg">∅</span>
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
          <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-3xl p-5 flex items-center justify-between hover:border-[var(--c-border-accent)] transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--c-primary-dim)] rounded-full flex items-center justify-center">
                <Users size={24} className="text-[var(--c-accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Characters</h3>
                <p className="text-sm text-[var(--c-muted)]">{personas.length} personas available</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[var(--c-muted)]" />
          </div>
        </Link>

        {/* Relationships - Compact on mobile */}
        {profile?.relationships && profile.relationships.length > 0 && (
          <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-3xl p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Heart className="text-[var(--c-accent)]" size={20} />
              Relationships
            </h3>

            {/* Mobile: compact row with avatars */}
            <div className="md:hidden flex items-center gap-3 overflow-x-auto pb-2">
              {profile.relationships.map((rel, idx) => {
                const persona = personas.find(
                  (p) => p.name.toLowerCase() === rel.persona_name.toLowerCase()
                );
                const image = persona ? getPersonaImage(persona.id) : null;
                return (
                  <div key={idx} className="flex flex-col items-center flex-shrink-0 min-w-[72px]">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--c-primary)] mb-1">
                      {image ? (
                        <Image src={image} alt={rel.persona_name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Heart size={20} className="text-white" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white font-medium">{rel.persona_name}</span>
                    <span className="text-[10px] text-[var(--c-accent)]">Lv.{rel.intimacy_level}</span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: detailed list */}
            <div className="hidden md:block space-y-3">
              {profile.relationships.map((rel, idx) => {
                const persona = personas.find(
                  (p) => p.name.toLowerCase() === rel.persona_name.toLowerCase()
                );
                const image = persona ? getPersonaImage(persona.id) : null;
                return (
                  <div key={idx} className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[var(--c-primary)]">
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
                      <div className="text-sm text-[var(--c-muted)] capitalize">{rel.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--c-accent)] font-semibold">Level {rel.intimacy_level}</div>
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-2xl p-4 text-center">
      <div className="text-[var(--c-accent)] mb-2 flex justify-center">{icon}</div>
      <div className="text-sm text-[var(--c-muted)]">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

