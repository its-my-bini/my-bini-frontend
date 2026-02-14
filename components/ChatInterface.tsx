"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Heart, ArrowLeft, X } from "lucide-react";
import { useConnection } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Persona } from "@/types";
import { getPersonaImage } from "@/lib/persona-images";
import { ChatHistorySkeleton } from "@/components/Skeleton";
import { PROACTIVE_MSG_EVENT, type ProactiveMessage } from "@/hooks/useSocket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ChatHistoryMessage {
  role: string;
  content: string;
  created_at?: string;
  timestamp?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
  date: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  personaId: string;
}

export default function ChatInterface({ personaId }: ChatInterfaceProps) {
  const { address } = useConnection();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch persona details — reuse cached personas list from dashboard
  const { data: persona } = useQuery<Persona>({
    queryKey: ["persona", personaId],
    queryFn: async () => {
      // Try cache first
      const cached = queryClient.getQueryData<Persona[]>(["personas"]);
      if (cached) {
        const found = cached.find((p) => p.id === personaId);
        if (found) return found;
      }
      const res = await fetch(`${API_URL}/personas`);
      if (!res.ok) throw new Error("Failed to fetch personas");
      const data = await res.json();
      const personas = data.personas || [];
      return personas.find((p: Persona) => p.id === personaId) || personas[0];
    },
    staleTime: 1000 * 60 * 5, // Persona data rarely changes
  });

  // Fetch user profile for relationship stats
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["profile", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { "x-wallet-address": address },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.profile;
    },
    enabled: !!address,
    staleTime: 1000 * 60,
  });

  // Get relationship for current persona
  const relationship = userProfile?.relationships?.find(
    (r) => r.persona_name.toLowerCase() === persona?.name?.toLowerCase(),
  );

  // Track if user is actively sending to prevent history overwriting local messages
  const isSendingRef = useRef(false);
  const historyLoadedRef = useRef(false);

  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<
    ChatHistoryMessage[]
  >({
    queryKey: ["chat-history", address, personaId],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(
        `${API_URL}/chat/history?persona_id=${personaId}`,
        {
          headers: { "x-wallet-address": address },
        },
      );
      if (!res.ok) return [];
      const data = await res.json();

      // Handle different response formats:
      // 1. Direct array
      // 2. { messages: [...] }
      // 3. { data: { messages: [...] } }
      if (Array.isArray(data)) return data;
      if (data.data?.messages) return data.data.messages;
      if (data.messages) return data.messages;
      return [];
    },
    enabled: !!address && !!personaId,
    staleTime: 1000 * 60, // Cache for 1 min to preserve across navigation
  });

  // Load chat history into messages (only once on initial load)
  useEffect(() => {
    if (isLoadingHistory || !chatHistory) return;
    if (isSendingRef.current) return;
    if (historyLoadedRef.current) return; // Only load once

    historyLoadedRef.current = true;

    if (chatHistory.length > 0) {
      const formattedMessages: Message[] = chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "ai",
        content: msg.content,
        date: new Date(msg.created_at || msg.timestamp || new Date()),
      }));
      setMessages(formattedMessages);
    }
  }, [chatHistory, isLoadingHistory]);

  // Reset loaded flag when persona changes
  useEffect(() => {
    historyLoadedRef.current = false;
  }, [personaId]);

  // Auto-select persona when entering chat
  const personaSelectedRef = useRef(false);
  useEffect(() => {
    if (!address || !personaId || personaSelectedRef.current) return;
    personaSelectedRef.current = true;
    fetch(`${API_URL}/user/select-persona`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": address,
      },
      body: JSON.stringify({ persona_id: personaId }),
    }).catch(() => {
      /* ignore — may already be selected */
    });
  }, [address, personaId]);

  // Show profile modal only on very first visit (no chat history and no local messages)
  useEffect(() => {
    if (
      !isLoadingHistory &&
      chatHistory &&
      chatHistory.length === 0 &&
      messages.length === 0 &&
      persona
    ) {
      setShowProfileModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, isLoadingHistory, persona]);

  // Listen for proactive AI messages (Smart Routine: morning/lunch/night check-ins)
  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent<ProactiveMessage>).detail;
      if (data.persona_id !== personaId) return; // Not for this chat
      if (isSendingRef.current) return; // Don't interrupt active send

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.content,
          date: new Date(data.timestamp),
        },
      ]);
    };
    window.addEventListener(PROACTIVE_MSG_EVENT, handler);
    return () => window.removeEventListener(PROACTIVE_MSG_EVENT, handler);
  }, [personaId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  // Helper: process a NDJSON stream response, returns ai content or error string
  const processStream = async (
    response: Response,
  ): Promise<{ aiContent: string; error?: string }> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let aiContent = "";
    let streamError = "";

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === "error") {
            streamError = event.error || "Unknown error";
          } else if (event.type === "message") {
            aiContent = event.data.ai_message.content;
            setMessages((prev) => {
              const newArr = [...prev];
              const lastIdx = newArr.length - 1;
              newArr[lastIdx] = {
                ...newArr[lastIdx],
                content: aiContent,
                isStreaming: false,
              };
              return newArr;
            });
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    return { aiContent, error: streamError };
  };

  // Helper: send chat request
  const sendChatRequest = (message: string) =>
    fetch(`${API_URL}/chat?stream=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": address!,
      },
      body: JSON.stringify({ persona_id: personaId, message }),
    });

  // Helper: select persona
  const selectPersona = () =>
    fetch(`${API_URL}/user/select-persona`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": address!,
      },
      body: JSON.stringify({ persona_id: personaId }),
    });

  const sendMessage = async () => {
    if (!input.trim() || !address) {
      if (!address) toast.error("Please connect your wallet first");
      return;
    }

    const userMsg: Message = { role: "user", content: input, date: new Date() };
    const userContent = input;
    setInput("");
    setIsTyping(true);
    isSendingRef.current = true;

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Add empty AI bubble for streaming
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "", date: new Date(), isStreaming: true },
      ]);

      const response = await sendChatRequest(userContent);

      if (response.status === 402) {
        toast.error("Insufficient tokens! Please top up your balance.");
        setMessages((prev) => prev.filter((m) => !m.isStreaming));
        setIsTyping(false);
        isSendingRef.current = false;
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Process the stream
      let result = await processStream(response);

      // Handle in-stream errors (e.g. "You haven't selected this persona yet.")
      if (result.error && !result.aiContent) {
        // Auto-select persona and retry
        try {
          await selectPersona();
          // Reset the AI bubble for retry
          setMessages((prev) => {
            const newArr = [...prev];
            const lastIdx = newArr.length - 1;
            newArr[lastIdx] = {
              ...newArr[lastIdx],
              content: "",
              isStreaming: true,
            };
            return newArr;
          });
          const retryResponse = await sendChatRequest(userContent);
          if (retryResponse.ok) {
            result = await processStream(retryResponse);
          }
        } catch {
          // retry failed
        }

        // If still no AI content after retry, show error
        if (!result.aiContent) {
          toast.error(result.error || "Failed to send message");
          setMessages((prev) => prev.filter((m) => !m.isStreaming));
          return;
        }
      }

      // If stream ended but no message event was received, remove the streaming bubble
      if (!result.aiContent) {
        setMessages((prev) => prev.filter((m) => !m.isStreaming));
      }

      // Invalidate queries after successful message
      queryClient.invalidateQueries({ queryKey: ["balance", address] });
      queryClient.invalidateQueries({ queryKey: ["profile", address] });
      queryClient.invalidateQueries({ queryKey: ["user-stats", address] });
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((m) => !m.isStreaming));
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        isSendingRef.current = false;
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      {persona && (
        <div className="bg-(--c-secondary) border-b border-(--c-border) p-4">
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={() => router.push("/chat")}
              className="text-(--c-muted) hover:text-white transition"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 flex-1 hover:opacity-80 transition"
            >
              <div className="w-12 h-12 bg-(--c-primary) rounded-full flex items-center justify-center overflow-hidden">
                {getPersonaImage(personaId) ? (
                  <Image
                    src={getPersonaImage(personaId)!}
                    alt={persona.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Heart size={24} className="text-white" fill="currentColor" />
                )}
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">{persona.name}</h2>
                <p className="text-xs text-(--c-muted)">{persona.type}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && persona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-(--c-secondary) border border-(--c-border) rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-(--c-muted) hover:text-white transition"
              >
                <X size={24} />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-(--c-primary) rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {getPersonaImage(personaId) ? (
                    <Image
                      src={getPersonaImage(personaId)!}
                      alt={persona.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Heart
                      size={48}
                      className="text-(--c-on-primary)"
                      fill="currentColor"
                    />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {persona.name}
                </h2>
                <p className="text-(--c-accent) font-medium">{persona.type}</p>
              </div>

              {/* Stats */}
              <div className="bg-(--c-bg) rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-(--c-muted)">Level</span>
                  <span className="text-white font-semibold">
                    {relationship?.intimacy_level || 1}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--c-muted)">Status</span>
                  <span className="text-(--c-accent) font-medium capitalize">
                    {relationship?.status || "Stranger"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--c-muted)">Messages</span>
                  <span className="text-white font-semibold">
                    {messages.length}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-(--c-primary) hover:bg-(--c-primary-hover) text-(--c-on-primary) font-semibold py-3 rounded-xl transition"
              >
                Continue Chat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-20">
        {isLoadingHistory ? (
          <ChatHistorySkeleton />
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => {
              // Hide empty streaming bubble (typing dots shown separately)
              if (msg.isStreaming && !msg.content) return null;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm text-[15px] leading-relaxed relative group
                  ${
                    msg.role === "user"
                      ? "bg-(--c-primary) text-(--c-on-primary) rounded-tr-none"
                      : "bg-(--c-secondary) text-white rounded-tl-none"
                  }`}
                  >
                    {msg.content}
                    {!msg.isStreaming && msg.content && (
                      <span className="text-[10px] opacity-60 block text-right mt-1">
                        {msg.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {isTyping && messages[messages.length - 1]?.isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start items-end gap-2"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-(--c-primary)">
                  {getPersonaImage(personaId) ? (
                    <Image
                      src={getPersonaImage(personaId)!}
                      alt={persona?.name || ""}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Heart
                        size={14}
                        className="text-(--c-on-primary)"
                        fill="currentColor"
                      />
                    </div>
                  )}
                </div>
                <div className="bg-(--c-secondary) px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 bg-(--c-accent) rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-(--c-accent) rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-(--c-accent) rounded-full animate-bounce delay-150"></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="absolute bottom-0 w-full  p-2 md:p-4">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-(--c-bg) p-2 rounded-3xl border border-(--c-border)">
          <textarea
            className="flex-1 bg-transparent text-white placeholder-(--c-muted-faint) px-4 py-2 focus:outline-none resize-none max-h-32 min-h-11"
            placeholder="Message..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-(--c-primary) flex items-center justify-center text-(--c-on-primary) hover:bg-(--c-primary-hover) transition disabled:opacity-50 disabled:bg-(--c-hover-bg)"
          >
            <ArrowUp size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
