// Utility types
export type HexAddress = `0x${string}`;
export type TxStatus = 'idle' | 'loading' | 'confirming' | 'success' | 'error';

// User & Auth
export interface User {
  id: string;
  wallet_address: string;
  token_balance: number;
  created_at: string;
  username?: string;
  name?: string;
}

export interface UserProfile extends User {
  personas: Array<{
    id: string;
    name: string;
    type: "sweet" | "tsundere" | "playful";
    selected_at: string;
  }>;
  relationships: Array<{
    persona_name: string;
    persona_type: string;
    intimacy_level: number;
    status: string;
    last_interaction: string;
    last_message?: string;
  }>;
}

// Global Responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Personas
export interface Persona {
  id: string;
  name: string;
  type: string;
  description: string;
  // Optional detail fields from API
  age?: string;
  height?: string;
  birthday?: string;
  zodiac?: string;
  personality?: string[];
  hobbies?: string[];
  likes?: string[];
  dislikes?: string[];
  greeting?: string;
}

// Chat
export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

export interface ChatResponse {
  user_message: ChatMessage;
  ai_message: ChatMessage;
  relationship: {
    intimacy_level: number;
    status: string;
  };
  rate_limit: {
    remaining: number;
  };
}

// Streaming Events
export type StreamEvent =
  | { type: "status"; status: "sent" | "read" | "typing"; timestamp: string }
  | { type: "message"; data: ChatResponse }
  | { type: "error"; error: string };
