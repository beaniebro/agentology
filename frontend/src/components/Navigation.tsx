"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/useUser";

export function Navigation() {
  const { user, isLoggedIn, register, logout, isLoading } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setRegistering(true);
    try {
      await register(name.trim());
      setShowModal(false);
      setName("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-[var(--border)]">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[var(--text-primary)] text-lg font-bold tracking-[-0.02em]">
              AGENTOLOGY
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              href="/colosseum"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
              Colosseum
            </Link>
            <Link
              href="/doctrine"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
              Doctrine
            </Link>
            <Link
              href="/metrics"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
              Metrics
            </Link>

            {isLoading ? (
              <div className="text-[var(--text-muted)] text-sm">...</div>
            ) : isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <p className="text-[var(--text-primary)] text-sm font-medium">
                  {user.name}
                </p>
                <button
                  onClick={logout}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn-secondary text-sm"
              >
                Join
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
          <div className="card p-8 max-w-md w-full mx-4 bg-[var(--bg-elevated)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-4">
              Join Agentology
            </h2>
            <p className="text-[var(--text-muted)] text-center mb-6 text-sm">
              Enter your name to begin your journey.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)] outline-none transition-colors"
                maxLength={50}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering || !name.trim()}
                  className="flex-1 btn-primary"
                >
                  {registering ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
