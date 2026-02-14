"use client";

import { AppLayout } from "@/components/AppLayout";
import DepositModal from "@/components/DepositModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useBalance } from "wagmi";
import { Wallet, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
  const { data: stats } = useQuery({
    queryKey: ["user-stats", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`${API_URL}/user/stats`, {
        headers: { "x-wallet-address": address },
      });
      if (!res.ok) return { totalEarned: 0, totalSpent: 0 };
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
        alert(`🎁 ${result.message}`);
        // Refetch balances
        queryClient.invalidateQueries({ queryKey: ["balance", address] });
        queryClient.invalidateQueries({ queryKey: ["user-stats", address] });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Daily reward error:", error);
      alert("Failed to claim daily reward");
    }
  };

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

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <ConnectButton />
        </div>

        {/* Balance Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* MON Balance */}
          <div className="bg-(--c-primary-hover) rounded-2xl p-4 text-white">
            <div className="flex items-center gap-1 mb-2">
              <Wallet size={16} />
              <span className="text-xs opacity-80">MON Balance</span>
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
                <div className="text-xs opacity-80 mt-0.5">MON</div>
              </>
            )}
          </div>

          {/* Token Balance */}
          <div className="bg-(--c-secondary) border border-(--c-border) rounded-2xl p-4 text-white">
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

        {/* Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Reward */}
          <button
            onClick={handleClaimDaily}
            className="bg-(--c-primary) hover:bg-(--c-primary-hover) text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Clock size={18} />
            <span className="text-sm">Daily Reward</span>
          </button>

          {/* Stats Toggle (optional) */}
          <div className="bg-(--c-secondary) border border-(--c-border) rounded-xl p-3 text-center">
            <div className="text-xs text-(--c-muted)">Total Earned</div>
            <div className="text-xl font-bold text-white">
              {stats?.totalEarned?.toString() || "0"}
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="bg-(--c-secondary) border border-(--c-border) rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-3 text-white">Top Up Balance</h2>
          <DepositModal />
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-(--c-bg) border border-(--c-border) rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowUpRight size={14} className="text-green-400" />
              <span className="text-xs text-(--c-muted)">Earned</span>
            </div>
            <div className="text-lg font-bold text-white">
              {stats?.totalEarned?.toString() || "0"}
            </div>
          </div>
          <div className="bg-(--c-bg) border border-(--c-border) rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowDownLeft size={14} className="text-red-400" />
              <span className="text-xs text-(--c-muted)">Spent</span>
            </div>
            <div className="text-lg font-bold text-white">
              {stats?.totalSpent?.toString() || "0"}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
