import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { monadTestnet } from "viem/chains";
import {
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

export const config = getDefaultConfig({
  appName: "My Bini",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [monadTestnet],
  ssr: true,
  transports: {
    [monadTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        okxWallet,
        rabbyWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
  ],
});
