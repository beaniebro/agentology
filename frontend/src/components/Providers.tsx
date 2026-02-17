"use client";

import { UserProvider } from "@/lib/useUser";

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
