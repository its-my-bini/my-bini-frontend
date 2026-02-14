'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TREASURY_ADDRESS = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0xF9a7cE64DfddD0666E8Be5f29F182Df51bd2E76E') as `0x${string}`;

// Treasury Contract ABI - only the deposit function
const TREASURY_ABI = [
  {
    inputs: [{ name: 'userId', type: 'string' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export default function DepositModal() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const queryClient = useQueryClient();

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash && address) {
      // Transaction confirmed, now sync with backend
      syncWithBackend(pendingTxHash, parseFloat(amount));
    }
  }, [isConfirmed, pendingTxHash, address, amount]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      toast.error(`Transaction failed: ${error.message}`);
      setPendingTxHash(undefined);
    }
  }, [error]);

  const syncWithBackend = async (txHash: string, depositAmount: number) => {
    try {
      const response = await fetch(`${API_URL}/token/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address!,
        },
        body: JSON.stringify({
          tx_hash: txHash,
          amount: depositAmount,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Backend returned non-JSON response');
        toast.error('Transaction confirmed, but backend sync failed. Please contact support.');
        setPendingTxHash(undefined);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`🎉 Deposit successful! You received ${result.tokens_received || depositAmount * 100} tokens`);
        setAmount('');
        setPendingTxHash(undefined);

        // Refetch balances
        queryClient.invalidateQueries({ queryKey: ['balance', address] });
        queryClient.invalidateQueries({ queryKey: ['user-stats', address] });
      } else {
        toast.error(result.message || 'Failed to sync deposit with backend');
        setPendingTxHash(undefined);
      }
    } catch (error) {
      console.error('Backend sync error:', error);
      toast.error('Transaction confirmed on blockchain, but failed to sync with backend. Please contact support with your transaction hash.');
      setPendingTxHash(undefined);
    }
  };

  const handleDeposit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      toast.loading('Preparing transaction...');

      // Call the deposit function on the contract
      writeContract(
        {
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: 'deposit',
          args: [address], // Use wallet address as userId
          value: parseEther(amount),
        },
        {
          onSuccess: (txHash) => {
            toast.dismiss();
            toast.success('Transaction sent! Waiting for confirmation...');
            setPendingTxHash(txHash);
          },
          onError: (error) => {
            toast.dismiss();
            console.error('Transaction error:', error);
            toast.error(`Transaction failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.dismiss();
      toast.error(error?.message || 'Failed to initiate deposit');
    }
  };

  return (
    <div className="bg-[var(--c-secondary)] rounded-2xl p-6 border border-[var(--c-border)]">
      <h3 className="text-lg font-semibold mb-4 text-white">Deposit MON</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--c-muted)] mb-2">Amount (MON)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[var(--c-bg)] text-white px-4 py-3 rounded-xl border border-[var(--c-border)] focus:outline-none focus:border-[var(--c-primary)] transition"
          />
        </div>

        <div className="bg-[var(--c-bg)] rounded-xl p-4 border border-[var(--c-border)]">
          <p className="text-sm text-[var(--c-muted)]">Exchange Rate</p>
          <p className="text-xl font-bold text-white">1 MON = 100 Tokens</p>
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-[var(--c-primary-faint)] rounded-xl p-4 border border-[var(--c-border-accent)]">
            <p className="text-sm text-[var(--c-accent)]">You will receive</p>
            <p className="text-2xl font-bold text-[var(--c-accent)]">{(parseFloat(amount) * 100).toFixed(0)} Tokens</p>
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0 || isPending || isConfirming}
          className="w-full bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] disabled:bg-[var(--c-hover-bg)] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {isConfirming ? 'Confirming transaction...' : 'Waiting for approval...'}
            </>
          ) : (
            'Deposit MON'
          )}
        </button>

        {pendingTxHash && (
          <div className="text-xs text-[var(--c-muted)] text-center">
            <a
              href={`https://explorer.monad.xyz/tx/${pendingTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--c-accent)] hover:underline"
            >
              View transaction on explorer
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
