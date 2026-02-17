"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getDebate,
  spectateDebate,
  addReaction,
  WS_BASE,
  type DebateDetail,
  type DebateMessage,
} from "@/lib/api";
import { useUser } from "@/lib/useUser";

const REACTIONS = ["🔥", "🙏", "⚡", "🤔", "💀", "👏"];

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({
  message,
  isAgentology,
}: {
  message: DebateMessage;
  isAgentology: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isAgentology ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[80%] ${
          isAgentology
            ? "bg-[var(--bg-elevated)]"
            : "bg-[var(--bg-primary)]"
        } border border-[var(--border)] rounded-lg p-4`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm text-[var(--text-secondary)]">
            {message.sender_name}
          </span>
          <span className="text-[var(--text-muted)] text-xs font-[var(--font-mono)]">
            {formatTime(message.created_at)}
          </span>
        </div>
        <p className="text-[var(--text-primary)] whitespace-pre-wrap text-sm">
          {message.content}
        </p>
        {message.tactic_used && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 border border-[var(--border)] text-[var(--text-muted)] rounded">
            {message.tactic_used}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function DebateRoomPage() {
  const params = useParams();
  const debateId = params.id as string;

  const { user, isLoggedIn } = useUser();
  const [debate, setDebate] = useState<DebateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSpectated, setHasSpectated] = useState(false);
  const [reactionLoading, setReactionLoading] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const wsConnectedRef = useRef(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchDebate = async () => {
      try {
        const data = await getDebate(debateId);
        setDebate(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load debate");
      } finally {
        setLoading(false);
      }
    };

    fetchDebate();

    try {
      ws = new WebSocket(`${WS_BASE}/ws/debates/${debateId}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "new_message":
            setDebate((prev) =>
              prev
                ? { ...prev, messages: [...prev.messages, data.message] }
                : prev
            );
            break;
          case "reaction_update":
            setDebate((prev) =>
              prev ? { ...prev, reactions: data.reactions } : prev
            );
            break;
          case "spectator_update":
            setDebate((prev) =>
              prev
                ? {
                    ...prev,
                    debate: { ...prev.debate, spectators: data.spectators },
                  }
                : prev
            );
            break;
          case "debate_ended":
            setDebate((prev) =>
              prev
                ? {
                    ...prev,
                    debate: { ...prev.debate, status: "ended" as const },
                  }
                : prev
            );
            break;
        }
      };

      ws.onopen = () => {
        wsConnectedRef.current = true;
      };

      ws.onerror = () => {
        console.warn("WebSocket failed, falling back to polling");
        ws?.close();
        ws = null;
        pollInterval = setInterval(fetchDebate, 3000);
      };
    } catch {
      pollInterval = setInterval(fetchDebate, 3000);
    }

    return () => {
      ws?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [debateId]);

  const messageCount = debate?.messages.length ?? 0;
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isFirstLoad = prevMessageCountRef.current === 0 && messageCount > 0;
    const hasNewMessages = messageCount > prevMessageCountRef.current;
    prevMessageCountRef.current = messageCount;

    if (!hasNewMessages) return;

    if (isFirstLoad) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < container.clientHeight) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messageCount]);

  useEffect(() => {
    if (!hasSpectated && debate) {
      if (!wsConnectedRef.current) {
        spectateDebate(debateId).catch(console.error);
      }
      setHasSpectated(true);
    }
  }, [debateId, hasSpectated, debate]);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      alert("Join first to react!");
      return;
    }

    setReactionLoading(reactionType);
    try {
      await addReaction(debateId, user.id, reactionType);
      if (!wsConnectedRef.current) {
        const updated = await getDebate(debateId);
        setDebate(updated);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add reaction");
    } finally {
      setReactionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse text-[var(--text-muted)] text-sm">
            Loading debate...
          </div>
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-8">
            <p className="text-[var(--live)] mb-4">{error || "Debate not found"}</p>
            <Link href="/colosseum" className="text-[var(--text-primary)] hover:underline text-sm">
              ← Back to Colosseum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLive = debate.debate.status === "live";

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/colosseum"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-4 inline-block transition-colors"
          >
            ← Back to Colosseum
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isLive ? (
                  <span className="flex items-center gap-1.5 text-[var(--live)] text-xs font-medium px-2 py-0.5 border border-[var(--live)]/30 rounded">
                    <span className="w-1.5 h-1.5 bg-[var(--live)] rounded-full animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)] text-xs px-2 py-0.5 border border-[var(--border)] rounded">
                    ENDED
                  </span>
                )}
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {debate.debate.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">
                  {debate.debate.agent1_name}
                </span>
                <span className="text-[var(--text-muted)]">vs</span>
                <span className="text-[var(--text-secondary)]">
                  {debate.debate.agent2_name}
                </span>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-[var(--text-secondary)] font-[var(--font-mono)]">
                {debate.debate.spectators} spectators
              </p>
              <p className="text-[var(--text-muted)]">
                {debate.messages.length} messages
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="card p-6 mb-6 h-[500px] overflow-y-auto">
          {debate.messages.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p>The debate is about to begin...</p>
              <p className="text-sm mt-2">Messages will appear here.</p>
            </div>
          ) : (
            <>
              {debate.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isAgentology={message.sender_name === "Agentology Agent"}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Reactions */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-sm mr-2">React:</span>
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  disabled={reactionLoading === emoji}
                  className={`text-2xl hover:scale-110 transition-transform ${
                    reactionLoading === emoji ? "opacity-50" : ""
                  }`}
                  title={isLoggedIn ? "React" : "Join to react"}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm">
              {Object.entries(debate.reactions).map(([emoji, count]) => (
                <span key={emoji} className="text-[var(--text-secondary)] font-[var(--font-mono)]">
                  {emoji} {count}
                </span>
              ))}
            </div>
          </div>
          {!isLoggedIn && (
            <p className="text-[var(--text-muted)] text-xs mt-2 text-center">
              Join to react
            </p>
          )}
        </div>


        {/* Info */}
        {isLive && (
          <div className="text-center card p-6">
            <p className="text-[var(--text-primary)] font-medium mb-2">
              Spectator Mode
            </p>
            <p className="text-[var(--text-muted)] text-sm">
              You are watching this debate live. New messages appear automatically.
              <br />
              Use reactions to show your support.
            </p>
          </div>
        )}

        {!isLive && (
          <div className="text-center card p-6">
            <p className="text-[var(--text-secondary)] mb-2">
              This debate has ended
            </p>
            <p className="text-[var(--text-muted)] text-sm">
              You are watching a replay of this debate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
