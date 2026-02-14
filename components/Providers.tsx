"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth-context";
import { monad } from "viem/chains";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <InnerProviders>{children}</InnerProviders>
    </ThemeProvider>
  );
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30s default — avoid unnecessary refetches on navigation
            gcTime: 1000 * 60 * 5, // 5 min garbage collection
            refetchOnWindowFocus: false, // Don't refetch just because user alt-tabbed
            retry: 1,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={monad}
          modalSize="compact"
          coolMode={true}
          theme={darkTheme({
            accentColor: theme.rainbowAccent,
            accentColorForeground: "white",
            borderRadius: "large",
          })}
        >
          <AuthProvider>
            {children}
            <Toaster 
              position="top-center" 
              richColors 
              toastOptions={{
                style: {
                  background: 'var(--c-card)',
                  border: '1px solid var(--c-border)',
                  color: 'white',
                },
              }}
            />
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
