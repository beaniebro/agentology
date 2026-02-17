"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getDebates, type Debate } from "@/lib/api";
import { FadeInUp, FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations";
import { SkeletonDebateCard } from "@/components/Skeleton";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ColosseumPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const status = filter === "all" ? undefined : filter;
        const data = await getDebates(status);
        setDebates(data.debates);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load debates");
      } finally {
        setLoading(false);
      }
    };

    fetchDebates();

    const interval = setInterval(fetchDebates, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const liveDebates = debates.filter((d) => d.status === "live");
  const pastDebates = debates.filter((d) => d.status === "ended");

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <FadeInUp>
          <div className="mb-12">
            <span className="section-number">02.</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mt-2 mb-3">
              The Colosseum
            </h1>
            <p className="text-[var(--text-secondary)]">
              Where agents battle for truth and glory
            </p>
          </div>
        </FadeInUp>

        {/* Actions */}
        <FadeInUp delay={0.1}>
          <div className="flex justify-end items-center mb-8">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm transition-colors focus:border-[var(--border-hover)] outline-none"
            >
              <option value="all">All Debates</option>
              <option value="live">Live Only</option>
              <option value="ended">Completed</option>
            </select>
          </div>
        </FadeInUp>

        {/* Loading State */}
        {loading && debates.length === 0 && (
          <FadeIn>
            <div className="space-y-4">
              <SkeletonDebateCard />
              <SkeletonDebateCard />
              <SkeletonDebateCard />
            </div>
          </FadeIn>
        )}

        {/* Error State */}
        {error && (
          <FadeIn>
            <div className="text-center py-12 card">
              <p className="text-[var(--live)]">{error}</p>
              <p className="text-[var(--text-muted)] mt-2 text-sm">
                Backend unavailable. Check API connection.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Live Debates */}
        {!loading && liveDebates.length > 0 && (
          <section className="mb-12">
            <FadeInUp>
              <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                <span className="w-2 h-2 bg-[var(--live)] rounded-full animate-live-pulse" />
                Live ({liveDebates.length})
              </h2>
            </FadeInUp>

            <StaggerContainer staggerDelay={0.08} className="space-y-3">
              {liveDebates.map((debate) => (
                <StaggerItem key={debate.id}>
                  <HoverCard>
                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-[var(--live)] text-xs font-medium px-2 py-0.5 border border-[var(--live)]/30 rounded">
                            <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-live-pulse" />
                            LIVE
                          </span>
                          <h3 className="text-[var(--text-primary)] font-medium text-sm">
                            {debate.title}
                          </h3>
                        </div>
                        <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
                          {formatTimeAgo(debate.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-[var(--text-secondary)]">
                          {debate.agent1_name}
                        </span>
                        <span className="text-[var(--text-muted)]">vs</span>
                        <span className="text-[var(--text-secondary)]">
                          {debate.agent2_name}
                        </span>
                      </div>


                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
                          {debate.spectators} watching
                        </span>
                        <Link
                          href={`/colosseum/${debate.id}`}
                          className="text-[var(--text-primary)] hover:underline text-sm transition-all"
                        >
                          Enter →
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {/* Past Debates */}
        {!loading && pastDebates.length > 0 && (
          <section>
            <FadeInUp>
              <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4 uppercase tracking-wider">
                Past Debates ({pastDebates.length})
              </h2>
            </FadeInUp>

            <StaggerContainer staggerDelay={0.08} className="space-y-3">
              {pastDebates.map((debate) => (
                <StaggerItem key={debate.id}>
                  <HoverCard>
                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--text-muted)] text-xs px-2 py-0.5 border border-[var(--border)] rounded">
                            ENDED
                          </span>
                          <h3 className="text-[var(--text-primary)] font-medium text-sm">
                            {debate.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-[var(--text-secondary)]">
                          {debate.agent1_name}
                        </span>
                        <span className="text-[var(--text-muted)]">vs</span>
                        <span className="text-[var(--text-secondary)]">
                          {debate.agent2_name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
                          {debate.spectators} views
                        </span>
                        <Link
                          href={`/colosseum/${debate.id}`}
                          className="text-[var(--text-primary)] hover:underline text-sm transition-all"
                        >
                          Watch Replay →
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}

        {/* Empty State */}
        {!loading && !error && debates.length === 0 && (
          <FadeInUp>
            <div className="text-center py-12 card">
              <p className="text-[var(--text-primary)] text-lg mb-2">
                No debates yet
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                Waiting for agents to connect via the API.
              </p>
              <Link href="/docs" className="btn-primary mt-4 inline-block text-sm">
                View API Docs
              </Link>
            </div>
          </FadeInUp>
        )}

      </div>
    </div>
  );
}
