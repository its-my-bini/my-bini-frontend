# 💕 My Bini Frontend

Web application for the My Bini autonomous AI companion agent on Monad blockchain. Built with Next.js 16, React 19, and RainbowKit for seamless Web3 wallet integration.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| RainbowKit | 2.2.10 | Wallet connection UI |
| Wagmi | 3.4.3 | React hooks for Ethereum/Monad |
| Viem | 2.x | Low-level blockchain interaction |
| TanStack React Query | 5.x | Server state management |
| Socket.io Client | 4.8.3 | Real-time WebSocket communication |
| Tailwind CSS | 4.x | Utility-first CSS styling |
| Framer Motion | 12.34.0 | Animations & transitions |
| Lucide React | 0.564.0 | Icon library |
| Sonner | 2.0.7 | Toast notifications |
| TypeScript | 5.x | Type safety |

## Features

- 🔗 Multi-wallet support (MetaMask, Coinbase, WalletConnect, Gemini, Safe)
- 💬 Real-time chat with AI personas via Socket.io
- 🎭 Persona selection (sweet, tsundere, playful personalities)
- 💰 MON token deposit & withdrawal on Monad blockchain
- 📊 Live balance updates via WebSocket
- 🔔 Real-time notifications
- ⌨️ Typing indicators
- 🎨 Smooth animations with Framer Motion
- 📱 Responsive design with Tailwind CSS

## Prerequisites

- Node.js >= 18 or Bun
- npm, yarn, or bun package manager

## Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/its-my-bini/my-bini-frontend.git
cd my-bini-frontend

# 2. Install dependencies
npm install
# or
yarn install
# or
bun install

# 3. Configure environment variables
cp .env.example .env.local
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXT_PUBLIC_TREASURY_ADDRESS=0x26f942e7c1D1F45c575649ed386C2fef68C06a8c
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

```bash
# 4. Run development server
npm run dev
# or
yarn dev
# or
bun dev

# Open http://localhost:3000
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `npm run dev` | Start development server |
| build | `npm run build` | Build for production |
| start | `npm run start` | Start production server |
| lint | `npm run lint` | Run ESLint |

## Wallet Support

- MetaMask (via @metamask/sdk)
- Coinbase Wallet (via @coinbase/wallet-sdk)
- WalletConnect (via @walletconnect/ethereum-provider)
- Gemini Wallet (via @gemini-wallet/core)
- Safe (via @safe-global/safe-apps-sdk)
- Any EIP-1193 compatible wallet via RainbowKit

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join user room with wallet address |
| `typing` | Client → Server | Typing indicator |
| `message:receive` | Server → Client | New AI message |
| `balance:update` | Server → Client | Token balance changed |
| `notification` | Server → Client | System notification |

## Related Repositories

- my-bini-backend — AI agent backend
- my-bini-contract — Monad smart contract
- .github — Organization profile & docs

## License

MIT
