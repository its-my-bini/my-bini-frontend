"use client";

import { AppLayout } from "@/components/AppLayout";
import { useConnection } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Search, SlidersHorizontal } from "lucide-react";
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
  const [search, setSearch] = useState("");

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
      staleTime: 1000 * 60 * 30, // 30 min — personas rarely change
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

  const filteredPersonas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return personas;
    return personas.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [personas, search]);

  const formatLastInteraction = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-full p-8 bg-(--c-bg)">
          <MessageCircle className="w-16 h-16 text-(--c-muted-dim) mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-(--c-muted) mb-8 text-center">
            Connect your wallet to start chatting
          </p>
          <ConnectButton showBalance={false} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-(--c-secondary)">
        {/* WhatsApp-like header */}
        <div className="px-4 py-3 flex items-center justify-between mx-auto w-full shrink-0">
          <h1 className="text-xl font-bold text-white">Chats</h1>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-3 flex items-center gap-3 mx-auto w-full shrink-0 border-b border-(--c-divider)">
          <div className="flex-1 border rounded-xl border-(--c-divider) relative ">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--c-muted-dim) "
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-(--c-secondary) text-white placeholder:text-(--c-muted-faint) pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-(--c-border-accent) transition"
            />
          </div>
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-(--c-secondary) flex items-center justify-center hover:bg-(--c-secondary-light) transition"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} className="text-(--c-muted)" />
          </button>
        </div>

        <div className="flex-1 mx-auto w-full overflow-y-auto bg-(--c-secondary)">
        {isLoadingPersonas ? (
          <CharacterListSkeleton />
        ) : (
          <div>
            {filteredPersonas.map((persona, idx) => {
              const relationship = profile?.relationships?.find(
                (r) => r.persona_name.toLowerCase() === persona.name.toLowerCase(),
              );

              // Show last message if has relationship, otherwise show description
              const subtitle = relationship
                ? `Level ${relationship.intimacy_level} · ${relationship.status}`
                : persona.description;

              const timeText = formatLastInteraction(relationship?.last_interaction);

              return (
                <button
                  key={persona.id}
                  onClick={() => handleOpenChat(persona.id)}
                  onMouseEnter={() => handleHoverChat(persona.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-(--c-hover-bg) active:bg-(--c-secondary-light) transition border-b border-(--c-divider)"
                >
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
                      <Heart size={24} className="text-white" fill="currentColor" />
                    )}
                  </div>

                  {/* Middle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-base font-semibold text-white truncate">
                          {persona.name}
                        </div>
                        <span className="text-[10px] text-(--c-accent) bg-(--c-primary-dim) px-2 py-0.5 rounded-full shrink-0">
                          {persona.type}
                        </span>
                      </div>
                      {timeText && (
                        <div className="text-[11px] text-(--c-muted-dim) shrink-0">
                          {timeText}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-(--c-muted) truncate mt-0.5">
                      {subtitle}
                    </div>
                  </div>

                </button>
              );
            })}

            {filteredPersonas.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-(--c-muted)">No chats found</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
