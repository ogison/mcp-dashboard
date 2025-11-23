import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { Preset } from "../types";

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPresets();
      setPresets(data.presets);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to load presets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPresets = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        await loadPresets();
        return;
      }

      try {
        setError(null);
        const data = await api.searchPresets(query);
        setPresets(data.presets);
      } catch (err) {
        setError((err as Error).message);
        console.error("Failed to search presets:", err);
      }
    },
    [loadPresets],
  );

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return {
    presets,
    loading,
    error,
    loadPresets,
    searchPresets,
  };
}
