"use client";

import { AppLayout } from "@/components/AppLayout";
import DepositModal from "@/components/DepositModal";
import { WalletSkeleton } from "@/components/Skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useBalance } from "wagmi";
import { Wallet, Clock, MessageCircle, Coins } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function WalletPage() {
  const { address, isConnected } = useConnection();
  const queryClient = useQueryClient();

  // Get MON balance from blockchain
  const { data: monBalance, isLoading: isLoadingMon } = useBalance({
    address: address,
  });

  // Get token balance from backend
  const { data: tokenBalance = 0, isLoading: isLoadingTokens } = useQuery({
    queryKey: ["balance", address],
    queryFn: async () => {
      if (!address) return 0;
      const res = await fetch(`${API_URL}/token/balance`, {
        headers: { "x-wallet-address": address },
      });
      const data = await res.json();
      return data.balance || 0;
    },
    enabled: !!address,
    staleTime: 1000 * 15, // 15s — balance updates after actions
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get user stats from backend
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["user-stats", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`${API_URL}/user/stats`, {
        headers: { "x-wallet-address": address },
      });
      if (!res.ok) return { stats: { total_messages: 0, total_tokens_used: 0 } };
      const data = await res.json();
      return data;
    },
    enabled: !!address,
  });

  const handleClaimDaily = async () => {
    if (!address) return;

    try {
      const res = await fetch(`${API_URL}/token/daily-reward`, {
        method: "POST",
        headers: { "x-wallet-address": address },
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        // Refetch balances
        queryClient.invalidateQueries({ queryKey: ["balance", address] });
        queryClient.invalidateQueries({ queryKey: ["user-stats", address] });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Daily reward error:", error);
      toast.error("Failed to claim daily reward");
    }
  };

  const isLoading = isLoadingMon || isLoadingTokens || isLoadingStats;

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-full p-8">
          <Wallet className="w-16 h-16 text-(--c-muted-dim) mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-(--c-muted) mb-8 text-center">
            Connect your wallet to view balance and manage tokens
          </p>
          <ConnectButton />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <WalletSkeleton />
      </AppLayout>
    );
  }

  return (  
    <AppLayout>
      <div className=" p-4 md:py-4 md:px-8 max-w-full h-full bg-(--c-secondary) mx-auto space-y-4">
        {/* Header */}
        <div className=" flex items-center justify-between mb-2">
          <h1 className="hidden md:block text-2xl font-bold text-white">Wallet</h1>
          <ConnectButton />
        </div>

        {/* Balance Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* MON Balance */}
          <div className="bg-(--c-card) rounded-2xl p-4 text-white">
            <div className="flex items-center gap-1 mb-2">
              <Wallet size={16} className="text-(--c-accent)" />
              <span className="text-xs text-(--c-muted)">MON Balance</span>
            </div>
            {isLoadingMon ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {monBalance
                    ? (
                        Number(monBalance.value) /
                        10 ** monBalance.decimals
                      ).toFixed(2)
                    : "0.00"}
                </div>
                <div className="text-xs text-(--c-muted) mt-0.5">MON</div>
              </>
            )}
          </div>

          {/* Token Balance */}
          <div className="bg-(--c-card) rounded-2xl p-4 text-white">
            <div className="flex items-center gap-1 mb-2">
              <Wallet size={16} className="text-(--c-accent)" />
              <span className="text-xs text-(--c-muted)">
                Token Balance
              </span>
            </div>
            {isLoadingTokens ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-3xl font-bold">{tokenBalance}</div>
                <div className="text-xs text-(--c-muted) mt-0.5">
                  TOKENS
                </div>
              </>
            )}
          </div>
        </div>

        {/* Daily Reward */}
        <button
          onClick={handleClaimDaily}
          className="w-full bg-(--c-primary) hover:bg-(--c-primary-hover) text-(--c-on-primary) font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Clock size={18} />
          <span className="text-sm">Daily Reward</span>
        </button>

        {/* Deposit Section */}
        <div className="bg-(--c-card) rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-3 text-white">Top Up Tokens</h2>
          <DepositModal />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-(--c-card) rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle size={14} className="text-(--c-accent)" />
              <span className="text-xs text-(--c-muted)">Messages</span>
            </div>
            <div className="text-lg font-bold text-white">
              {stats?.stats?.total_messages?.toString() || "0"}
            </div>
          </div>
          <div className="bg-(--c-card) rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins size={14} className="text-(--c-accent)" />
              <span className="text-xs text-(--c-muted)">Tokens Used</span>
            </div>
            <div className="text-lg font-bold text-white">
              {stats?.stats?.total_tokens_used?.toString() || "0"}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
