"use client";

import { useEffect, useState } from "react";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: number;

    function updateToday() {
      const now = new Date();
      setToday(getLocalDateString(now));
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timeoutId = window.setTimeout(updateToday, nextMidnight.getTime() - now.getTime());
    }

    updateToday();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return today;
}
