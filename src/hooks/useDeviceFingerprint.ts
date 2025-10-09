"use client";

import { useState, useEffect } from "react";
import { getDeviceFingerprint } from "@/lib/fingerprint";

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFingerprint() {
      try {
        const fp = await getDeviceFingerprint();
        setFingerprint(fp);
      } catch (error) {
        console.error("Failed to get device fingerprint:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFingerprint();
  }, []);

  return { fingerprint, loading };
}
