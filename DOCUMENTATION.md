# 📖 My Bini Frontend - Complete Documentation

## 📑 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [User Flow](#user-flow)
6. [API Integration](#api-integration)
7. [WebSocket (Real-time)](#websocket-real-time)
8. [Components](#components)
9. [State Management](#state-management)
10. [Environment Setup](#environment-setup)
11. [Development Guide](#development-guide)

---

## 🎯 Overview

**My Bini** is a Web3-powered AI Girlfriend application built on the Monad blockchain. It combines blockchain wallet authentication with AI-driven chat interactions, featuring real-time streaming, token-based payments, and relationship progression systems.

### Key Highlights
- 🔐 **Web3 Authentication** via RainbowKit/Wagmi
- 💬 **Real-time Streaming Chat** with Telegram-style UI
- 🪙 **Token-based Economy** (ERC-20 on Monad Testnet)
- 💖 **Relationship System** with intimacy levels
- 📱 **Responsive Design** (Mobile-first with desktop support)
- ⚡ **WebSocket** for balance updates & notifications

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16.1.6** (App Router with Turbopack)
- **React 19.2.3**
- **TypeScript**
- **Bun** (Runtime & Package Manager)

### Web3 Integration
- **RainbowKit 2.2.10** - Wallet connection UI
- **Wagmi 3.4.3** - React hooks for Ethereum
- **Viem 2.x** - Ethereum interaction library

### State & Data Fetching
- **TanStack Query 5.90.21** - Server state management
- **Socket.IO Client 4.8.3** - Real-time WebSocket

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion 12.34.0** - Animations
- **Lucide React 0.564.0** - Icons
- **Sonner 2.0.7** - Toast notifications

---

## ✨ Features

### 1. **Wallet Authentication**
- Connect wallet via Metamask, WalletConnect, or other providers
- Auto-login with wallet signature (EIP-191)
- Session persistence via wallet address headers

### 2. **Multi-Persona Chat**
- Choose from multiple AI girlfriend personalities:
  - 💕 **Sweet** - Warm and caring
  - 😤 **Tsundere** - Tough exterior, soft inside
  - 😜 **Playful** - Fun and flirty
- Each persona has unique response styles and behaviors

### 3. **Real-time Streaming Chat**
- **Telegram-style** bubble interface
- **Streaming responses** from AI (character-by-character)
- **Status indicators**: sent → read → typing
- **Chat history** persistence across sessions
- **Auto-scroll** to latest messages

### 4. **Token Economy**
- Each chat costs tokens (configurable, default: 5 tokens)
- **Deposit** tokens via Monad blockchain transactions
- **Withdraw** tokens back to wallet
- **Daily rewards** with streak bonuses
- **Real-time balance** updates via WebSocket

### 5. **Relationship Progression**
- **Intimacy levels** increase with each interaction
- **Status tiers**: Stranger → Acquaintance → Friend → Close Friend → Best Friend
- Unlock new personas based on relationship progress

### 6. **Responsive Design**
- **Mobile**: Bottom navigation bar
- **Desktop**: Left sidebar (Telegram-style)
- Optimized chat bubbles and input for all screen sizes

---

## 📂 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── dashboard/
│   │   ├── page.tsx             # Chat list (personas)
│   │   └── chat/[personaId]/
│   │       └── page.tsx         # Individual chat page
│   ├── wallet/
│   │   └── page.tsx             # Wallet & token management
│   ├── profile/
│   │   └── page.tsx             # User profile & stats
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Global styles
│
├── components/
│   ├── AppLayout.tsx            # Main layout (sidebar/navbar)
│   ├── ChatInterface.tsx        # Chat UI component
│   ├── DepositModal.tsx         # Token deposit modal
│   └── Providers.tsx            # React Query + RainbowKit providers
│
├── hooks/
│   └── useSocket.ts             # WebSocket hook
│
├── lib/
│   └── wagmi.ts                 # Wagmi/RainbowKit configuration
│
├── types.ts                     # TypeScript type definitions
├── .env.local                   # Environment variables
└── package.json
```

---

## 🔄 User Flow

### 1. **Initial Visit**
```
Landing Page (/)
  ↓
User clicks "Get Started"
  ↓
Redirected to /wallet
  ↓
Connect Wallet (RainbowKit modal)
  ↓
Backend: POST /auth/wallet-login
  ↓
Auto-redirect to /dashboard
```

### 2. **Dashboard Flow**
```
Dashboard (/dashboard)
  ↓
Fetch: GET /personas (available AI girlfriends)
  ↓
Fetch: GET /user/profile (user's unlocked personas)
  ↓
Display persona list with lock status
  ↓
User clicks unlocked persona
  ↓
Navigate to /dashboard/chat/[personaId]
```

### 3. **Chat Flow**
```
Chat Page (/dashboard/chat/[personaId])
  ↓
Fetch: GET /chat/history?persona_id=xxx
  ↓
Load previous messages
  ↓
User types & sends message
  ↓
POST /chat?stream=true
  ↓
Stream AI response (NDJSON)
  ↓
Update balance via WebSocket
  ↓
Update intimacy level
  ↓
Store message in database
```

### 4. **Token Management Flow**
```
Wallet Page (/wallet)
  ↓
Fetch: GET /token/balance
  ↓
User deposits tokens on Monad blockchain
  ↓
Submit: POST /token/deposit { tx_hash, amount }
  ↓
Backend verifies transaction (TODO: on-chain verification)
  ↓
Balance updated
  ↓
WebSocket emits balance:update event
  ↓
Frontend updates balance in real-time
```

---

## 🌐 API Integration

### Base Configuration
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### Authentication
All authenticated requests include:
```typescript
headers: { 
  'x-wallet-address': address // Connected wallet address
}
```

---

### 📡 API Endpoints

#### **Auth Routes**

##### `POST /auth/wallet-login`
**Description**: Login or register with wallet address

**Request**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...", // Optional EIP-191 signature
  "message": "Sign this message..." // Optional message
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "wallet_address": "0x742d35...",
    "created_at": "2024-02-13T...",
    "token_balance": 100
  }
}
```

---

##### `GET /user/profile`
**Description**: Get user profile with relationships

**Headers**: `x-wallet-address`

**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "wallet_address": "0x...",
    "token_balance": 100,
    "personas": [
      {
        "id": "luna",
        "name": "Luna",
        "type": "sweet",
        "selected_at": "2024-02-13T..."
      }
    ],
    "relationships": [
      {
        "persona_id": "luna",
        "persona_name": "Luna",
        "persona_type": "sweet",
        "intimacy_level": 15,
        "status": "friend",
        "last_interaction": "2024-02-13T...",
        "last_message": "I missed you!",
        "last_message_at": "2024-02-13T..."
      }
    ]
  }
}
```

---

#### **Persona Routes**

##### `GET /personas`
**Description**: List all available personas

**Response**:
```json
{
  "success": true,
  "personas": [
    {
      "id": "luna",
      "name": "Luna",
      "type": "sweet",
      "description": "A warm and caring companion who loves to make you smile."
    },
    {
      "id": "aria",
      "name": "Aria",
      "type": "tsundere",
      "description": "Don't get the wrong idea! I'm just being nice..."
    }
  ]
}
```

---

##### `POST /user/select-persona`
**Description**: Select/unlock a persona

**Headers**: `x-wallet-address`

**Request**:
```json
{
  "persona_id": "luna"
}
```

**Response**:
```json
{
  "success": true,
  "message": "You are now connected with Luna!",
  "persona": {
    "id": "luna",
    "name": "Luna",
    "type": "sweet",
    "description": "..."
  }
}
```

---

#### **Chat Routes**

##### `POST /chat?stream=true`
**Description**: Send chat message (streaming response)

**Headers**: 
- `x-wallet-address`
- `Content-Type: application/json`

**Request**:
```json
{
  "persona_id": "luna",
  "message": "How are you today?"
}
```

**Response** (NDJSON Stream):
```jsonlines
{"type":"status","status":"sent","timestamp":"2024-02-13T..."}
{"type":"status","status":"read","timestamp":"2024-02-13T..."}
{"type":"status","status":"typing","timestamp":"2024-02-13T..."}
{"type":"message","data":{"user_message":{...},"ai_message":{...},"relationship":{...},"rate_limit":{...}}}
```

**Response Data Structure**:
```typescript
{
  type: "message",
  data: {
    user_message: {
      id: string,
      content: string,
      created_at: string
    },
    ai_message: {
      id: string,
      content: string,
      created_at: string
    },
    relationship: {
      intimacy_level: number,
      status: string
    },
    rate_limit: {
      remaining: number
    }
  }
}
```

**Error Response**:
```json
{
  "type": "error",
  "error": "Insufficient token balance."
}
```

---

##### `GET /chat/history`
**Description**: Get chat history with persona

**Headers**: `x-wallet-address`

**Query Params**:
- `persona_id` (required)
- `page` (default: 1)
- `limit` (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "Hello!",
        "created_at": "2024-02-13T..."
      },
      {
        "id": "uuid",
        "role": "ai",
        "content": "Hi there! 💕",
        "created_at": "2024-02-13T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120,
      "total_pages": 3
    }
  }
}
```

---

#### **Token Routes**

##### `GET /token/balance`
**Description**: Get current token balance

**Headers**: `x-wallet-address`

**Response**:
```json
{
  "success": true,
  "balance": 95
}
```

---

##### `POST /token/deposit`
**Description**: Deposit tokens from blockchain

**Headers**: `x-wallet-address`

**Request**:
```json
{
  "tx_hash": "0x...",
  "amount": 100
}
```

**Response**:
```json
{
  "success": true,
  "message": "Deposit successful",
  "balance": 195
}
```

---

##### `POST /token/withdraw`
**Description**: Withdraw tokens to wallet

**Headers**: `x-wallet-address`

**Request**:
```json
{
  "amount": 50
}
```

**Response**:
```json
{
  "success": true,
  "message": "Withdrawal initiated",
  "balance": 145
}
```

---

##### `POST /token/daily-reward`
**Description**: Claim daily login reward

**Headers**: `x-wallet-address`

**Response**:
```json
{
  "success": true,
  "message": "🎁 Daily reward claimed! +10 tokens",
  "reward": 10,
  "streak_bonus": 2,
  "balance": 155
}
```

**Already Claimed**:
```json
{
  "success": false,
  "message": "Daily reward already claimed today"
}
```

---

## 🔌 WebSocket (Real-time)

### Connection Setup

#### Backend (Socket.IO Server)
```typescript
// src/services/socket.service.ts
export class SocketService {
  private io: SocketIOServer;
  
  init(listener: any) {
    this.io = new SocketIOServer(listener, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    
    this.io.on("connection", (socket) => {
      // Client joins room based on user ID
      socket.on("join", async (walletAddress: string) => {
        const user = await prisma.user.findUnique({ 
          where: { wallet_address: walletAddress.toLowerCase() } 
        });
        if (user) {
          socket.join(`user:${user.id}`);
        }
      });
      
      // Typing indicator
      socket.on("typing", (isTyping: boolean) => {
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            socket.to(room).emit("typing", isTyping);
          }
        }
      });
    });
  }
  
  // Emit balance update to user's room
  emitBalanceUpdate(userId: string, newBalance: number) {
    this.io.to(`user:${userId}`).emit("balance:update", {
      balance: newBalance,
      timestamp: new Date().toISOString()
    });
  }
  
  // Send notification to user
  emitNotification(userId: string, title: string, message: string, type: string) {
    this.io.to(`user:${userId}`).emit("notification", {
      title, message, type,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

#### Frontend (useSocket Hook)
```typescript
// hooks/useSocket.ts
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export function useSocket() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!address) return;
    
    const socket = io(API_URL, {
      auth: { walletAddress: address },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('join', address); // Join user room
    });
    
    // Listen for balance updates
    socket.on('balance:update', (data: { balance: number }) => {
      queryClient.setQueryData(['balance', address], data.balance);
      toast.success(`Balance updated: ${data.balance} tokens`);
    });
    
    // Listen for notifications
    socket.on('notification', (data) => {
      toast[data.type](data.message);
    });
    
    return () => socket.disconnect();
  }, [address, queryClient]);
  
  return socket;
}
```

---

### WebSocket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `walletAddress: string` | Join user-specific room |
| `typing` | `isTyping: boolean` | Indicate typing status |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `balance:update` | `{ balance: number, timestamp: string }` | Balance changed |
| `notification` | `{ title, message, type, timestamp }` | System notification |
| `typing` | `isTyping: boolean` | Another device is typing |

---

## 🧩 Components

### 1. **AppLayout.tsx**
Main application layout with responsive navigation.

**Features**:
- Desktop: Left sidebar (Telegram-style)
- Mobile: Bottom navigation bar
- Auto-active route highlighting

**Usage**:
```tsx
<AppLayout>
  <YourPageContent />
</AppLayout>
```

---

### 2. **ChatInterface.tsx**
Complete chat UI with streaming support.

**Features**:
- Fetches chat history on mount
- Sends messages with streaming response
- Auto-scrolls to latest message
- Profile modal for persona details
- Typing indicators
- Balance checks before sending

**Key Functions**:
```typescript
const sendMessage = async () => {
  // 1. Create user message bubble
  // 2. Add empty AI bubble with streaming indicator
  // 3. POST /chat?stream=true
  // 4. Parse NDJSON stream
  // 5. Update AI bubble progressively
  // 6. Invalidate queries (balance, history)
}
```

---

### 3. **DepositModal.tsx**
Token deposit interface.

**Features**:
- Amount input with validation
- Blockchain transaction flow
- Loading states
- Success/error handling
- Real-time balance updates

**Usage**:
```tsx
<DepositModal />
```

---

### 4. **Providers.tsx**
Root-level providers for the entire app.

**Includes**:
- **TanStack Query** (React Query)
- **RainbowKit** (Wallet UI)
- **Wagmi** (Ethereum hooks)

**Usage** (in `app/layout.tsx`):
```tsx
<Providers>
  <body>{children}</body>
</Providers>
```

---

## 🗄️ State Management

### TanStack Query Keys

```typescript
// Balance
['balance', address]

// User profile
['profile', address]

// Personas list
['personas']

// Specific persona
['persona', personaId]

// Chat history
['chat-history', address, personaId]

// User stats
['user-stats', address]
```

---

### Query Examples

#### Fetch Balance
```typescript
const { data: balance } = useQuery({
  queryKey: ['balance', address],
  queryFn: async () => {
    const res = await fetch(`${API_URL}/token/balance`, {
      headers: { 'x-wallet-address': address! }
    });
    return (await res.json()).balance;
  },
  enabled: !!address
});
```

#### Fetch Chat History
```typescript
const { data: chatHistory = [] } = useQuery({
  queryKey: ['chat-history', address, personaId],
  queryFn: async () => {
    const res = await fetch(
      `${API_URL}/chat/history?persona_id=${personaId}`,
      { headers: { 'x-wallet-address': address! } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : data.messages || [];
  },
  enabled: !!address && !!personaId
});
```

---

## ⚙️ Environment Setup

### Required Environment Variables

Create `.env.local` in the frontend root:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Wallet Connect Project ID (from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Monad Testnet RPC (or custom RPC)
NEXT_PUBLIC_MONAD_RPC_URL=https://rpc.monad.xyz
```

---

### Wallet Configuration (`lib/wagmi.ts`)

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monad } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'My Bini',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [monad],
  ssr: true
});
```

---

## 🚀 Development Guide

### Installation

```bash
# Install dependencies
bun install
```

---

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001)

---

### Build for Production

```bash
bun run build
bun run start
```

---

### Linting

```bash
bun run lint
```

---

### Common Issues & Solutions

#### 1. **Chat History Not Loading**
- ✅ Ensure `isLoadingHistory` check in `useEffect`
- ✅ Handle both array and object responses from backend

#### 2. **WebSocket Not Connecting**
- ✅ Check `NEXT_PUBLIC_API_URL` is correct
- ✅ Ensure backend Socket.IO is initialized
- ✅ Verify CORS settings on backend

#### 3. **Wallet Connection Issues**
- ✅ Valid `WALLET_CONNECT_PROJECT_ID` in `.env.local`
- ✅ Correct chain configuration in `wagmi.ts`

#### 4. **Balance Not Updating**
- ✅ WebSocket connected and joined room
- ✅ `queryClient.invalidateQueries` after transactions

---

## 📊 Performance Optimizations

### 1. **Query Caching**
```typescript
staleTime: 1000 * 60, // Cache for 1 minute
```

### 2. **Lazy Loading**
```typescript
// Chat history loaded only when personaId changes
enabled: !!address && !!personaId
```

### 3. **Optimistic Updates**
```typescript
// Update UI immediately, rollback on error
queryClient.setQueryData(['balance', address], newBalance);
```

---

## 🔐 Security Considerations

### 1. **Wallet Address Validation**
- Always normalize to lowercase
- Verify EIP-191 signatures (optional)

### 2. **API Authentication**
- Include `x-wallet-address` header
- Backend validates user exists

### 3. **Rate Limiting**
- Backend enforces rate limits per user
- Frontend shows remaining requests

### 4. **Token Verification**
- TODO: On-chain verification of deposits/withdrawals
- Currently trusts tx_hash from client

---

## 📝 Type Definitions

```typescript
// types.ts
export interface User {
  id: string;
  wallet_address: string;
  token_balance: number;
  created_at: string;
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
  }>;
}

export interface Persona {
  id: string;
  name: string;
  type: string;
  description: string;
}

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
```

---

## 🎨 Design System

### Color Palette
```css
--tg-bg: #0f172a;       /* Dark Blue/Slate */
--tg-secondary: #1e293b; 
--tg-bubble-in: #1e293b; /* Incoming message */
--tg-bubble-out: #3b82f6; /* Outgoing message (Blue 500) */
--tg-text: #f8fafc;
--tg-hint: #94a3b8;
```

### Typography
- **Font**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Headings**: Bold, tracking-tight
- **Body**: Regular, leading-relaxed

---

## 📱 Mobile Optimizations

- **Safe Area**: `pb-safe` for bottom navigation
- **Touch Targets**: Minimum 44px height
- **Scrolling**: Smooth scroll, momentum scrolling
- **Input**: Auto-focus prevented on mobile

---

## 🧪 Testing Recommendations

### Unit Tests
- Component rendering
- Hook behavior (`useSocket`, `useAccount`)
- API mocking with MSW

### Integration Tests
- Full user flows (connect → chat → deposit)
- WebSocket event handling
- Query invalidation

### E2E Tests
- Playwright/Cypress
- Wallet connection
- Chat streaming
- Transaction flows

---

## 📚 Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ using Bun, Next.js, and Web3 Technologies**
