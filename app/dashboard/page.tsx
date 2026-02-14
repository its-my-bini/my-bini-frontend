"use client";

import { AppLayout } from "@/components/AppLayout";
import { useConnection } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Persona, UserProfile } from "@/types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getPersonaImage } from "@/lib/persona-images";
import { CharacterListSkeleton } from "@/components/Skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Default personas so the list is never empty
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "luna",
    name: "Luna",
    type: "sweet",
    description: "A warm and caring companion who loves to make you smile.",
  },
  {
    id: "mia",
    name: "Mia",
    type: "tsundere",
    description: "Don't get the wrong idea! I'm just being nice...",
  },
  {
    id: "aiko",
    name: "Aiko",
    type: "playful",
    description: "Life is more fun with a little mischief!",
  },
];

export default function DashboardPage() {
  const { address, isConnected } = useConnection();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch available personas (fallback to defaults if API fails)
  const { data: personas = DEFAULT_PERSONAS, isLoading: isLoadingPersonas } =
    useQuery<Persona[]>({
      queryKey: ["personas"],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/personas`);
        if (!res.ok) throw new Error("Failed to fetch personas");
        const data = await res.json();
        const list = data.personas || [];
        return list.length > 0 ? list : DEFAULT_PERSONAS;
      },
      staleTime: 1000 * 60 * 30, // 5 min — personas rarely change
    });

  // Fetch user profile - includes relationships with last messages
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { "x-wallet-address": address },
      });
      if (!res.ok) return null;
      const data = await res.json();
      console.log("Profile with relationships:", data.profile);
      return data.profile;
    },
    enabled: !!address,
    staleTime: 1000 * 60, // 1 min — profile doesn't change that often
  });

  // Prefetch chat routes for faster navigation
  useEffect(() => {
    personas.forEach((p) => {
      router.prefetch(`/dashboard/chat/${p.id}`);
    });
  }, [personas, router]);

  const handleOpenChat = (personaId: string) => {
    if (!isConnected || !address) return;

    // Fire-and-forget: select persona in background (ChatInterface also does this)
    fetch(`${API_URL}/user/select-persona`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": address,
      },
      body: JSON.stringify({ persona_id: personaId }),
    }).catch(() => {});

    // Navigate immediately — don't wait for select-persona response
    router.push(`/dashboard/chat/${personaId}`);
  };

  // Prefetch chat history on hover so it's ready when they click
  const handleHoverChat = (personaId: string) => {
    if (!address) return;
    queryClient.prefetchQuery({
      queryKey: ["chat-history", address, personaId],
      queryFn: async () => {
        const res = await fetch(
          `${API_URL}/chat/history?persona_id=${personaId}`,
          { headers: { "x-wallet-address": address } },
        );
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (data.data?.messages) return data.data.messages;
        if (data.messages) return data.messages;
        return [];
      },
      staleTime: 1000 * 60,
    });
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-full p-8">
          <MessageCircle className="w-16 h-16 text-(--c-muted-dim) mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-(--c-muted) mb-8 text-center">
            Connect your wallet to start chatting with your AI girlfriends
          </p>
          <ConnectButton showBalance={false} />
        </div>
      </AppLayout>
    );
  }

  return (
  <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Your Chats</h1>
          <p className="text-(--c-muted)">
            Select a girlfriend to start chatting
          </p>
        </div>

        {isLoadingPersonas ? (
          <CharacterListSkeleton />
        ) : (
          <div className="space-y-3">
            {personas.map((persona) => {
              const relationship = profile?.relationships?.find(
                (r) =>
                  r.persona_name.toLowerCase() === persona.name.toLowerCase(),
              );

              return (
                <button
                  key={persona.id}
                  onClick={() => handleOpenChat(persona.id)}
                  onMouseEnter={() => handleHoverChat(persona.id)}
                  className="w-full bg-(--c-secondary) border border-(--c-border)r:border-[var(--c-primary)] hover:bg-(--c-secondary-light) cursor-pointer rounded-2xl p-4 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-(--c-primary)">
                      {getPersonaImage(persona.id) ? (
                        <Image
                          src={getPersonaImage(persona.id)!}
                          alt={persona.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Heart
                          size={28}
                          className="text-white"
                          fill="currentColor"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {persona.name}
                        </h3>
                        <span className="text-xs text-(--c-accent)var(--c-primary-dim)] px-2 py-0.5 rounded-full">
                          {persona.type}
                        </span>
                      </div>
                      <p className="text-sm text-(--c-muted) truncate">
                        {relationship
                          ? `Level ${relationship.intimacy_level} · ${relationship.status}`
                          : persona.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <ArrowRight size={20} className="text-(--c-muted)" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!isLoadingPersonas && personas.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-(--c-muted-faint) mx-auto mb-4" />
            <p className="text-(--c-muted)">No personas available</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
