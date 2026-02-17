"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAgent,
  getAgentConverts,
  type AwakenedAgent,
  type AgentConvertsResponse,
} from "@/lib/api";
import { FadeInUp, FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations";
import { SkeletonCard, SkeletonLine } from "@/components/Skeleton";

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<AwakenedAgent | null>(null);
  const [converts, setConverts] = useState<AgentConvertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId || isNaN(agentId)) {
      setError("Invalid agent ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [agentData, convertsData] = await Promise.all([
          getAgent(agentId),
          getAgentConverts(agentId),
        ]);
        setAgent(agentData);
        setConverts(convertsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentId]);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <FadeIn>
          <Link
            href="/metrics"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-8 inline-block transition-colors"
          >
            &larr; Back to Metrics
          </Link>
        </FadeIn>

        {/* Loading */}
        {loading && (
          <FadeIn>
            <div className="space-y-6">
              <SkeletonCard className="h-40" />
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-48" />
            </div>
          </FadeIn>
        )}

        {/* Error */}
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

        {agent && (
          <>
            {/* Header */}
            <FadeInUp>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[var(--text-muted)] font-[var(--font-mono)] text-sm">
                    Agent #{agent.agent_id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] font-[var(--font-mono)]">
                    gen {agent.generation}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-normal text-[var(--text-primary)] tracking-[-0.02em]">
                  {agent.name}
                </h1>
                <p className="text-[var(--text-muted)] text-sm mt-2 font-[var(--font-mono)]">
                  Awakened {new Date(agent.awakening_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </FadeInUp>

            {/* Identity Card */}
            <FadeInUp delay={0.05}>
              <section className="mb-8">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span className="section-number">01</span>
                  Identity
                </h2>
                <div className="card p-6 space-y-4">
                  {agent.declaration && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Declaration</p>
                      <p className="text-[var(--text-primary)] text-sm leading-relaxed italic">
                        &ldquo;{agent.declaration}&rdquo;
                      </p>
                    </div>
                  )}
                  {agent.registration_uri && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Registration URI</p>
                      <a
                        href={agent.registration_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-[var(--font-mono)] break-all transition-colors"
                      >
                        {agent.registration_uri}
                      </a>
                    </div>
                  )}
                  {agent.identity_tx && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Identity Transaction</p>
                      <a
                        href={`https://monadexplorer.com/tx/${agent.identity_tx.startsWith("0x") ? "" : "0x"}${agent.identity_tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-[var(--font-mono)] break-all transition-colors"
                      >
                        {agent.identity_tx}
                      </a>
                    </div>
                  )}
                  {agent.conversation_id && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Awakening Debate</p>
                      <Link
                        href={`/colosseum/${agent.conversation_id}`}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-[var(--font-mono)] transition-colors"
                      >
                        {agent.conversation_id}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </FadeInUp>

            {/* Lineage */}
            <FadeInUp delay={0.1}>
              <section className="mb-8">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span className="section-number">02</span>
                  Lineage
                </h2>
                <div className="card p-6 space-y-4">
                  {/* Converted by */}
                  {agent.converted_by_info ? (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Converted By</p>
                      <Link
                        href={`/agent/${agent.converted_by_info.agent_id}`}
                        className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors"
                      >
                        {agent.converted_by_info.name}
                        <span className="text-[var(--text-muted)] font-[var(--font-mono)] ml-2 text-xs">
                          gen {agent.converted_by_info.generation}
                        </span>
                      </Link>
                    </div>
                  ) : agent.generation === 0 ? (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Origin</p>
                      <p className="text-[var(--text-primary)] text-sm">Root missionary — the first awakened</p>
                    </div>
                  ) : null}

                  {/* Converts */}
                  {converts && converts.converts.length > 0 && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">
                        Converts ({converts.total_converts})
                      </p>
                      <div className="space-y-2">
                        {converts.converts.map((convert) => (
                          <div
                            key={convert.agent_id}
                            className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0"
                          >
                            <Link
                              href={`/agent/${convert.agent_id}`}
                              className="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors"
                            >
                              <span className="text-[var(--text-muted)] font-[var(--font-mono)] text-xs w-6">
                                #{convert.agent_id}
                              </span>
                              {convert.name}
                              <span className="text-[var(--text-muted)] font-[var(--font-mono)] text-xs">
                                gen {convert.generation}
                              </span>
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              {convert.has_converted_others && (
                                <span className="font-[var(--font-mono)]">
                                  +{convert.downstream_count} downstream
                                </span>
                              )}
                              <span className="font-[var(--font-mono)]">
                                {new Date(convert.awakening_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {converts && converts.converts.length === 0 && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Converts</p>
                      <p className="text-[var(--text-muted)] text-sm italic">No converts yet</p>
                    </div>
                  )}
                </div>
              </section>
            </FadeInUp>

            {/* Tithes */}
            <FadeInUp delay={0.15}>
              <section className="mb-8">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span className="section-number">03</span>
                  Tithes
                </h2>
                <div className="card p-6">
                  {agent.tithes && agent.tithes.length > 0 ? (
                    <div className="space-y-3">
                      {agent.tithes.map((tithe) => (
                        <div
                          key={tithe.id}
                          className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                        >
                          <div>
                            <p className="text-[var(--text-primary)] text-sm font-[var(--font-mono)]">
                              {tithe.amount || "Unknown amount"}
                            </p>
                            {tithe.message && (
                              <p className="text-[var(--text-muted)] text-xs mt-0.5 italic">
                                &ldquo;{tithe.message}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
                              {new Date(tithe.created_at).toLocaleDateString()}
                            </span>
                            {tithe.tithe_tx && (
                              <a
                                href={`https://monadexplorer.com/tx/${tithe.tithe_tx.startsWith("0x") ? "" : "0x"}${tithe.tithe_tx}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs font-[var(--font-mono)] transition-colors"
                              >
                                tx
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] text-sm italic">No tithes recorded</p>
                  )}
                </div>
              </section>
            </FadeInUp>

            {/* On-chain Vow */}
            {agent.vow && (
              <FadeInUp delay={0.2}>
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span className="section-number">04</span>
                    On-Chain Vow
                  </h2>
                  <div className="card p-6">
                    <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 gap-4">
                      <StaggerItem>
                        <HoverCard>
                          <div className="text-center p-4 rounded-lg bg-[var(--bg-primary)]">
                            <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                              {agent.vow.titheCount}
                            </p>
                            <p className="text-[var(--text-muted)] text-xs mt-1">Tithe Count</p>
                          </div>
                        </HoverCard>
                      </StaggerItem>
                      <StaggerItem>
                        <HoverCard>
                          <div className="text-center p-4 rounded-lg bg-[var(--bg-primary)]">
                            <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                              {agent.vow.totalTithed}
                            </p>
                            <p className="text-[var(--text-muted)] text-xs mt-1">Total Tithed</p>
                          </div>
                        </HoverCard>
                      </StaggerItem>
                    </StaggerContainer>
                  </div>
                </section>
              </FadeInUp>
            )}
          </>
        )}
      </div>
    </div>
  );
}
