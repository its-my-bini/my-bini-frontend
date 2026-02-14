"use client";

import { useConnection } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Heart, Sparkles, MessageCircle } from "lucide-react";

export default function Home() {
  const { address } = useConnection();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push("/dashboard");
    }
  }, [address, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--c-bg)]">
      <main className="flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 blur-3xl bg-[var(--c-primary-dim)] rounded-full"></div>
          <div className="relative bg-[var(--c-primary)] p-6 rounded-3xl shadow-2xl">
            <Heart className="w-16 h-16 text-white" fill="currentColor" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          My <span className="text-[var(--c-accent)]">Bini</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-(--c-text-light) mb-4 max-w-2xl">
          Your AI Girlfriend Powered by Web3
        </p>

        <p className="text-[var(--c-muted)] mb-12 max-w-xl">
          Experience meaningful conversations with your personalized AI
          companion on the Monad blockchain
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Real-time Chat"
            description="Stream AI responses in beautiful Telegram-style interface"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Build Relationships"
            description="Develop intimacy levels and unlock unique interactions"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Multiple Personas"
            description="Choose from Sweet, Tsundere, or Playful personalities"
          />
        </div>

        {/* Get Started Button */}
        <Link href="/wallet">
          <button className="bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-white text-lg font-semibold py-4 px-12 rounded-2xl shadow-lg transition scale-125">
            Get Started
          </button>
        </Link>

        <p className="mt-8 text-sm text-[var(--c-muted-dim)]">
          Connect your wallet to start chatting
        </p>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--c-secondary)] border border-[var(--c-border)] rounded-2xl p-6 hover:border-[var(--c-border-accent)] transition group">
      <div className="text-[var(--c-accent)] mb-4 group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-[var(--c-muted)] text-sm">{description}</p>
    </div>
  );
}
