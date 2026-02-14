import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'viem/chains';


export const config = getDefaultConfig({
  appName: 'My Bini',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [monadTestnet],
  ssr: true,
});
