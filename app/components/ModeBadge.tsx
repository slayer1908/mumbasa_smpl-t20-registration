"use client";

import { useEffect, useState } from "react";

export default function ModeBadge() {
  const [mode, setMode] = useState<"supabase" | "local" | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMode(data.mode);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode !== "local") return null;

  return (
    <div className="bg-gold-600/10 border-b border-gold-600/30">
      <p className="mx-auto max-w-5xl px-4 py-2 text-center text-xs text-gold-400">
        Running in <span className="font-semibold">Local Demo Mode</span> —
        data is stored on this server only (no Supabase connected). See
        README.md to connect real Supabase for production.
      </p>
    </div>
  );
}
