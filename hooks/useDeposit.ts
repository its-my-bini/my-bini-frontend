"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { parseEther } from "viem";
import { useConnection } from "wagmi";
import { toast } from "sonner";
import { config } from "@/lib/wagmi";
import { treasuryAbi } from "@/lib/abis/treasury-abi";
import {
  API_URL,
  TREASURY_ADDRESS,
  DEPOSIT_CONFIG,
  getBlockExplorerUrl,
} from "@/lib/constants";
import type { HexAddress, TxStatus } from "@/types";

interface DepositParams {
  amount: string;
}

/** Sync confirmed deposit tx with backend DB */
const syncDepositWithBackend = async (
  address: string,
  txHash: string,
  amount: number,
): Promise<{ tokens_received?: number; success: boolean; message?: string }> => {
  const res = await fetch(`${API_URL}/token/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": address,
    },
    body: JSON.stringify({ tx_hash: txHash, amount }),
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(
      "Transaction confirmed, but backend sync failed. Please contact support.",
    );
  }

  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Failed to sync deposit with backend");
  }

  return result;
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  const { address } = useConnection();

  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<HexAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ amount }: DepositParams) => {
      if (!address) {
        toast.error("Wallet not connected");
        throw new Error("Wallet not connected");
      }

      setStatus("idle");
      setError(null);

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        toast.error("Please enter a valid amount");
        throw new Error("Invalid amount");
      }

      // Step 1: Send transaction to blockchain
      setStatus("loading");
      toast.loading("Preparing transaction...", { id: DEPOSIT_CONFIG.toastId });

      const hash = await writeContract(config, {
        address: TREASURY_ADDRESS,
        abi: treasuryAbi,
        functionName: "deposit",
        args: [address],
        value: parseEther(amount),
      });
      setTxHash(hash);

      toast.dismiss(DEPOSIT_CONFIG.toastId);
      toast.loading("Waiting for confirmation...", {
        id: DEPOSIT_CONFIG.confirmingId,
      });

      // Step 2: Wait for blockchain confirmation
      setStatus("confirming");
      const receipt = await waitForTransactionReceipt(config, { hash });

      toast.dismiss(DEPOSIT_CONFIG.confirmingId);

      // Step 3: Sync with backend DB
      const result = await syncDepositWithBackend(
        address,
        hash,
        amountFloat,
      );

      toast.success(DEPOSIT_CONFIG.successMessage, {
        description: `You received ${result.tokens_received || amountFloat * 250} tokens`,
        action: {
          label: "View Tx",
          onClick: () => window.open(getBlockExplorerUrl(hash), "_blank"),
        },
      });

      setStatus("success");

      // Invalidate balance queries (backend token balance + wagmi on-chain balance)
      queryClient.invalidateQueries({ queryKey: ["balance", address] });
      queryClient.invalidateQueries({ queryKey: ["user-stats", address] });
      queryClient.invalidateQueries({ queryKey: ["balance"] }); // wagmi useBalance

      return receipt;
    },
    onError: (e: Error) => {
      toast.dismiss(DEPOSIT_CONFIG.toastId);
      toast.dismiss(DEPOSIT_CONFIG.confirmingId);

      const isUserRejected =
        e.message.includes("User rejected") ||
        e.message.includes("User denied") ||
        e.message.includes("rejected the request");

      if (isUserRejected) {
        setStatus("idle");
        toast.error("Transaction rejected");
      } else {
        setStatus("error");
        setError(e.message);
        toast.error("Transaction Failed", { description: e.message });
      }
    },
  });

  const reset = () => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
    mutation.reset();
  };

  return { status, mutation, txHash, error, reset };
};

export default useDeposit;
