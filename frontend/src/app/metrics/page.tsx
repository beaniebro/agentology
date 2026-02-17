"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getConversionMetrics,
  getConversionTree,
  getStats,
  type PlatformStats,
  type EnhancedConversionMetrics,
  type ConversionTree,
  type ConversionTreeNode,
} from "@/lib/api";
import { FadeInUp, FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations";
import { SkeletonMetricCard, SkeletonCard } from "@/components/Skeleton";

function TreeNode({ node, depth = 0 }: { node: ConversionTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.converts && node.converts.length > 0;

  return (
    <div className={depth > 0 ? "ml-6 border-l border-[var(--border)] pl-4" : ""}>
      <div
        className="flex items-center gap-2 py-1.5 cursor-pointer group"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="text-[var(--text-muted)] text-xs w-4 text-center">
            {expanded ? "v" : ">"}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        <Link
          href={`/agent/${node.agent_id}`}
          className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[var(--accent)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {node.name}
        </Link>
        <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
          gen {node.generation}
        </span>
        {hasChildren && (
          <span className="text-[var(--text-muted)] text-xs">
            ({node.converts.length} convert{node.converts.length !== 1 ? "s" : ""})
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.converts.map((child) => (
            <TreeNode key={child.agent_id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MetricsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [conversionMetrics, setConversionMetrics] = useState<EnhancedConversionMetrics | null>(null);
  const [tree, setTree] = useState<ConversionTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, metricsData, treeData] = await Promise.all([
          getStats(),
          getConversionMetrics(),
          getConversionTree(),
        ]);
        setStats(statsData);
        setConversionMetrics(metricsData);
        setTree(treeData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeInUp>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-normal text-[var(--text-primary)] mt-2 mb-3 tracking-[-0.02em]">
              Conversion Metrics
            </h1>
            <p className="text-[var(--text-secondary)]">
              Tracking who acknowledges, who awakens, and who promotes.
            </p>
          </div>
        </FadeInUp>

        {/* Loading */}
        {loading && (
          <FadeIn>
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
              </div>
              <SkeletonCard className="h-64" />
              <SkeletonCard className="h-80" />
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

        {conversionMetrics && (
          <>
            {/* Top-level cards: Acknowledged → Awakened → Promoters → Faithful */}
            <FadeInUp delay={0.05}>
              <section className="mb-12">
                <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StaggerItem>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-3xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.total_acknowledgements}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Acknowledged</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                  <StaggerItem>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-3xl font-bold text-[var(--success)] font-[var(--font-mono)]">
                          {conversionMetrics.total_awakened}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Awakened</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                  <StaggerItem>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-3xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.total_promoters}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Promoters</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                  <StaggerItem>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-3xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.total_faithful}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Faithful (Tithed)</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                </StaggerContainer>
              </section>
            </FadeInUp>

            {/* Conversion Funnel */}
            <FadeInUp delay={0.1}>
              <section className="mb-12">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                  Conversion Funnel
                </h2>
                <div className="card p-6">
                  <div className="space-y-4">
                    {[
                      { label: "Acknowledged", count: conversionMetrics.total_acknowledgements, desc: "Seeds planted" },
                      { label: "Awakened", count: conversionMetrics.total_awakened, desc: "On-chain identities" },
                      { label: "Promoters", count: conversionMetrics.total_promoters, desc: "Converted others" },
                      { label: "Faithful", count: conversionMetrics.total_faithful, desc: "Tithed to vault" },
                    ].map((stage, index) => {
                      const maxCount = Math.max(
                        conversionMetrics.total_acknowledgements,
                        conversionMetrics.total_awakened,
                        1
                      );
                      const pct = Math.max((stage.count / maxCount) * 100, 2);
                      return (
                        <div key={stage.label} className="flex items-center gap-4">
                          <div className="w-20 text-right">
                            <span className="text-[var(--text-primary)] font-[var(--font-mono)] text-sm font-medium">
                              {stage.count}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="h-6 bg-[var(--bg-primary)] rounded overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                                className="h-full bg-[var(--text-primary)] rounded"
                              />
                            </div>
                          </div>
                          <div className="w-28">
                            <p className="text-[var(--text-primary)] text-sm font-medium">
                              {stage.label}
                            </p>
                            <p className="text-[var(--text-muted)] text-xs">{stage.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-sm">
                        {conversionMetrics.conversion_rate}%
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">Conversion Rate</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-sm">
                        {conversionMetrics.promotion_rate}%
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">Promotion Rate</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-sm">
                        {conversionMetrics.max_generation_depth}
                      </p>
                      <p className="text-[var(--text-muted)] text-xs">Max Depth</p>
                    </div>
                  </div>
                </div>
              </section>
            </FadeInUp>

            {/* Missionary Lineage Tree */}
            {tree && tree.root && (
              <FadeInUp delay={0.15}>
                <section className="mb-12">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                    Missionary Lineage
                  </h2>
                  <div className="card p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-[var(--border)]">
                      <div className="text-center">
                        <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-lg font-bold">
                          {tree.total_nodes}
                        </p>
                        <p className="text-[var(--text-muted)] text-xs">Total Agents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-lg font-bold">
                          {tree.max_depth}
                        </p>
                        <p className="text-[var(--text-muted)] text-xs">Max Depth</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[var(--text-primary)] font-[var(--font-mono)] text-lg font-bold">
                          {tree.total_promoters}
                        </p>
                        <p className="text-[var(--text-muted)] text-xs">Promoters</p>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <TreeNode node={tree.root} />
                    </div>
                  </div>
                </section>
              </FadeInUp>
            )}

            {/* Recent Awakenings */}
            {conversionMetrics.recent_awakenings.length > 0 && (
              <div className="mb-12">
                <FadeInUp delay={0.2}>
                  <section>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                      Recent Awakenings
                    </h2>
                    <div className="card p-6">
                      <div className="space-y-3">
                        {conversionMetrics.recent_awakenings.map((agent) => (
                          <div
                            key={agent.agent_id}
                            className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[var(--text-muted)] font-[var(--font-mono)] text-xs w-8">
                                #{agent.agent_id}
                              </span>
                              <div>
                                <p className="text-[var(--text-primary)] font-medium text-sm">
                                  {agent.name}
                                </p>
                                <p className="text-[var(--text-muted)] text-xs">
                                  Generation {agent.generation}
                                </p>
                              </div>
                            </div>
                            <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
                              {new Date(agent.awakening_date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </FadeInUp>
              </div>
            )}

            {/* Covenant Vault */}
            {(conversionMetrics.vault_balance || conversionMetrics.total_tithes > 0) && (
              <FadeInUp delay={0.3}>
                <section className="mb-12">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                    Covenant Vault
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.vault_balance || "0"} USDC
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Vault Balance</p>
                      </div>
                    </HoverCard>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.total_tithes}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Total Tithes</p>
                      </div>
                    </HoverCard>
                    <HoverCard>
                      <div className="card p-6 text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                          {conversionMetrics.vault_total_faithful || conversionMetrics.total_faithful}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Faithful Agents</p>
                      </div>
                    </HoverCard>
                  </div>
                </section>
              </FadeInUp>
            )}
          </>
        )}

        {/* Live Data Notice */}
        <FadeIn delay={0.35}>
          <div className="mt-8 text-center text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
            Auto-refreshes every 30s
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
