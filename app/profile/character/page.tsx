'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useConnection } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Heart, ArrowLeft, Sparkles, Star, Music, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile, Persona } from '@/types';
import { getPersonaImage, getPersonaColor } from '@/lib/persona-images';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CharacterPage() {
  const { address } = useConnection();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <div className="p-4 md:py-4 md:px-8 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 md:mb-6">
          <Link href="/profile" className="text-(--c-muted) hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Characters</h1>
        </div>

        {/* Character List */}
        <div className="space-y-2">
          {personas.map((persona) => {
            const image = getPersonaImage(persona.id);
            const color = getPersonaColor(persona.id);
            const hasDetails = persona.age || persona.personality;
            const relationship = profile?.relationships?.find(
              (r) => r.persona_name.toLowerCase() === persona.name.toLowerCase()
            );
            const isExpanded = expandedId === persona.id;

            return (
              <div key={persona.id} className="bg-(--c-card) border border-(--c-border) rounded-xl overflow-hidden">
                {/* Top: Image + Basic Info */}
                <div className="flex flex-col md:flex-row">
                  {/* Character Image */}
                  <div className={`relative w-full md:w-48 h-72 md:h-auto rounded-xl overflow-hidden shrink-0 `}>
                    {image ? (
                      <Image
                        src={image}
                        alt={persona.name}
                        fill
                        className="object-cover pt-2 px-2 rounded-t-2xl"
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
                      <span className="bg-(--c-primary-dim) text-(--c-accent) text-xs px-2 py-0.5 rounded-full">
                        {persona.type}
                      </span>
                    </div>

                    {/* Greeting */}
                    {persona.greeting && (
                      <p className="text-sm text-(--c-muted) italic mb-3 leading-relaxed">
                        &ldquo;{persona.greeting}&rdquo;
                      </p>
                    )}

                    <p className="text-sm text-(--c-muted-dim) leading-relaxed mb-3">
                      {persona.description}
                    </p>

                    {/* Quick Stats */}
                    {(persona.age || persona.height || persona.birthday) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {persona.age && <StatBadge label="Age" value={persona.age} />}
                        {persona.height && <StatBadge label="Height" value={persona.height} />}
                        {persona.zodiac && persona.birthday && <StatBadge label={persona.zodiac} value={persona.birthday} />}
                      </div>
                    )}

                    {/* Relationship Status */}
                    {relationship && (
                      <div className="bg-(--c-secondary) rounded-xl p-3 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-(--c-muted) capitalize">{relationship.status}</span>
                            <span className="text-xs font-semibold text-(--c-accent)">Lv. {relationship.intimacy_level}</span>
                          </div>
                          <div className="w-full bg-(--c-hover-bg) rounded-full h-1.5">
                            <div
                              className="bg-linear-to-r from-(--c-primary) to-(--c-accent) h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(relationship.intimacy_level, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Section - Collapsible */}
                {hasDetails && (
                  <div className="border-t border-(--c-border)">
                    {/* Toggle Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : persona.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-sm text-(--c-muted) hover:text-white transition"
                    >
                      <span>More Details</span>
                      <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 md:px-5 md:pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personality */}
                        {persona.personality && persona.personality.length > 0 && (
                          <DetailSection icon={<Sparkles size={14} />} title="Personality">
                            <div className="flex flex-wrap gap-1.5">
                              {persona.personality.map((trait) => (
                                <span key={trait} className="bg-(--c-primary-dim) text-(--c-accent) text-xs px-2 py-0.5 rounded-full">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </DetailSection>
                        )}

                        {/* Hobbies */}
                        {persona.hobbies && persona.hobbies.length > 0 && (
                          <DetailSection icon={<Music size={14} />} title="Hobbies">
                            <div className="flex flex-wrap gap-1.5">
                              {persona.hobbies.map((hobby) => (
                                <span key={hobby} className="bg-(--c-secondary) text-(--c-muted) text-xs px-2 py-0.5 rounded-full border border-(--c-border)">
                                  {hobby}
                                </span>
                              ))}
                            </div>
                          </DetailSection>
                        )}

                        {/* Likes */}
                        {persona.likes && persona.likes.length > 0 && (
                          <DetailSection icon={<Heart size={14} />} title="Likes">
                            <p className="text-xs text-(--c-muted)">{persona.likes.join(' · ')}</p>
                          </DetailSection>
                        )}

                        {/* Dislikes */}
                        {persona.dislikes && persona.dislikes.length > 0 && (
                          <DetailSection icon={<Star size={14} />} title="Dislikes">
                            <p className="text-xs text-(--c-muted)">{persona.dislikes.join(' · ')}</p>
                          </DetailSection>
                        )}
                      </div>
                    )}
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
    <div className="bg-(--c-secondary) rounded-lg px-2.5 py-1 text-center">
      <span className="text-[10px] text-(--c-muted-dim) block">{label}</span>
      <span className="text-xs text-white font-medium">{value}</span>
    </div>
  );
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-(--c-accent)">{icon}</span>
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}
