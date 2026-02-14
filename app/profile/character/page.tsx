'use client';

import { AppLayout } from '@/components/AppLayout';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Heart, ArrowLeft, Sparkles, Star, Music, Gamepad2, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile, Persona } from '@/types';
import { getPersonaImage, getPersonaColor, getCharacterDetail } from '@/lib/persona-images';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CharacterPage() {
  const { address } = useAccount();

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
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="text-[var(--c-muted)] hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Characters</h1>
        </div>

        {/* Character List */}
        <div className="space-y-6">
          {personas.map((persona) => {
            const image = getPersonaImage(persona.id);
            const color = getPersonaColor(persona.id);
            const detail = getCharacterDetail(persona.id);
            const relationship = profile?.relationships?.find(
              (r) => r.persona_name.toLowerCase() === persona.name.toLowerCase()
            );

            return (
              <div
                key={persona.id}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-2xl overflow-hidden"
              >
                {/* Top: Image + Basic Info */}
                <div className="flex flex-col md:flex-row">
                  {/* Character Image */}
                  <div className={`relative w-full md:w-48 h-56 md:h-auto bg-gradient-to-br ${color} flex-shrink-0`}>
                    {image ? (
                      <Image
                        src={image}
                        alt={persona.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Heart size={48} className="text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-white">{persona.name}</h4>
                      <span className="bg-[var(--c-primary-dim)] text-[var(--c-accent)] text-xs px-2 py-0.5 rounded-full">
                        {persona.type}
                      </span>
                    </div>

                    {/* Greeting */}
                    {detail && (
                      <p className="text-sm text-[var(--c-muted)] italic mb-3 leading-relaxed">
                        &ldquo;{detail.greeting}&rdquo;
                      </p>
                    )}

                    <p className="text-sm text-[var(--c-muted-dim)] leading-relaxed mb-3">
                      {persona.description}
                    </p>

                    {/* Quick Stats */}
                    {detail && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <StatBadge label="Age" value={detail.age} />
                        <StatBadge label="Height" value={detail.height} />
                        <StatBadge label={detail.zodiac} value={detail.birthday} />
                      </div>
                    )}

                    {/* Relationship Status */}
                    {relationship && (
                      <div className="bg-[var(--c-secondary)] rounded-xl p-3 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-[var(--c-muted)] capitalize">{relationship.status}</span>
                            <span className="text-xs font-semibold text-[var(--c-accent)]">Lv. {relationship.intimacy_level}</span>
                          </div>
                          <div className="w-full bg-[var(--c-hover-bg)] rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-accent)] h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(relationship.intimacy_level, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Section */}
                {detail && (
                  <div className="border-t border-[var(--c-border)] p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personality */}
                    <DetailSection icon={<Sparkles size={14} />} title="Personality">
                      <div className="flex flex-wrap gap-1.5">
                        {detail.personality.map((trait) => (
                          <span key={trait} className="bg-[var(--c-primary-dim)] text-[var(--c-accent)] text-xs px-2 py-0.5 rounded-full">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </DetailSection>

                    {/* Hobbies */}
                    <DetailSection icon={<Music size={14} />} title="Hobbies">
                      <div className="flex flex-wrap gap-1.5">
                        {detail.hobbies.map((hobby) => (
                          <span key={hobby} className="bg-[var(--c-secondary)] text-[var(--c-muted)] text-xs px-2 py-0.5 rounded-full border border-[var(--c-border)]">
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </DetailSection>

                    {/* Likes */}
                    <DetailSection icon={<Heart size={14} />} title="Likes">
                      <p className="text-xs text-[var(--c-muted)]">{detail.likes.join(' · ')}</p>
                    </DetailSection>

                    {/* Dislikes */}
                    <DetailSection icon={<Star size={14} />} title="Dislikes">
                      <p className="text-xs text-[var(--c-muted)]">{detail.dislikes.join(' · ')}</p>
                    </DetailSection>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--c-secondary)] rounded-lg px-2.5 py-1 text-center">
      <span className="text-[10px] text-[var(--c-muted-dim)] block">{label}</span>
      <span className="text-xs text-white font-medium">{value}</span>
    </div>
  );
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[var(--c-accent)]">{icon}</span>
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}
