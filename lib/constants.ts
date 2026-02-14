import type { HexAddress } from '@/types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const TREASURY_ADDRESS = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
  '0xF9a7cE64DfddD0666E8Be5f29F182Df51bd2E76E') as HexAddress;

export const EXPLORER_URL = 'https://explorer.monad.xyz';

export const getBlockExplorerUrl = (hash: string) =>
  `${EXPLORER_URL}/tx/${hash}`;

export const DEPOSIT_CONFIG = {
  toastId: 'deposit-tx',
  confirmingId: 'deposit-confirming',
  successMessage: '🎉 Deposit successful!',
} as const;
