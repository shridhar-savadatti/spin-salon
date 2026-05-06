"use client";

import { useEffect } from "react";

export default function PageAnalytics({ page }: { page: string }) {
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {}); // silent fail
  }, [page]);

  return null;
}
