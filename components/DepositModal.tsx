"use client";

import { useState } from "react";
import { Loader2, Coins } from "lucide-react";
import { useDeposit } from "@/hooks/useDeposit";
import { getBlockExplorerUrl } from "@/lib/constants";

const TOKENS_PER_MON = 250;

const PACKAGES = [
  { tokens: 250, mon: 1 },
  { tokens: 500, mon: 2 },
  { tokens: 1000, mon: 4 },
] as const;

export default function DepositModal() {
  const [selected, setSelected] = useState<number | null>(null);
  const { status, mutation, txHash } = useDeposit();

  const isBusy = status === "loading" || status === "confirming";
  const pkg = selected !== null ? PACKAGES[selected] : null;

  const handleDeposit = () => {
    if (!pkg) return;
    mutation.mutate(
      { amount: String(pkg.mon) },
      { onSuccess: () => setSelected(null) },
    );
  };

  return (
    <div className=" rounded-xl p-2 sm:p-4 ">
      <p className="text-sm text-(--c-muted) mb-4">
        1 MON = {TOKENS_PER_MON} Tokens
      </p>

      <div className="space-y-4">
        {/* Package Options */}
        <div className="grid grid-cols-3 gap-3">
          {PACKAGES.map((p, idx) => {
            const isActive = selected === idx;
            return (
              <button
                key={p.tokens}
                onClick={() => setSelected(idx)}
                disabled={isBusy}
                className={`flex flex-col items-center gap-1 p-4 rounded-2xl border transition cursor-pointer ${
                  isActive
                    ? "border-(--c-primary) bg-(--c-primary-dim)"
                    : "border-(--c-border) bg-(--c-bg) hover:border-(--c-border-accent)"
                } disabled:opacity-50`}
              >
                <Coins
                  size={20}
                  className="text-(--c-accent) hidden md:block"
                />
                <span className="text-lg font-bold text-white">{p.tokens}</span>
                <span className="text-xs font-semibold text-(--c-accent) mt-1">
                  {p.mon} MON
                </span>
              </button>
            );
          })}
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={selected === null || isBusy}
          className="w-full bg-(--c-primary) hover:bg-(--c-primary-hover) disabled:bg-(--c-secondary-light) disabled:text-(--c-muted) text-(--c-on-primary) font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {isBusy ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {status === "confirming"
                ? "Confirming..."
                : "Waiting for approval..."}
            </>
          ) : pkg ? (
            `Deposit ${pkg.mon} MON`
          ) : (
            "Select a package"
          )}
        </button>

        {txHash && (
          <div className="text-xs text-(--c-muted) text-center">
            <a
              href={getBlockExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--c-accent) hover:underline"
            >
              View transaction on explorer
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
