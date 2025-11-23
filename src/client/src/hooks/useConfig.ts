import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { MCPConfig } from "../types";

export function useConfig() {
  const [config, setConfig] = useState<MCPConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to load config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: MCPConfig) => {
    try {
      setError(null);
      await api.saveConfig(newConfig);
      setConfig(newConfig);
      return true;
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to save config:", err);
      return false;
    }
  }, []);

  const updateServer = useCallback(
    (serverName: string, serverConfig: MCPConfig["mcpServers"][string]) => {
      if (!config) return;

      const newConfig = {
        ...config,
        mcpServers: {
          ...config.mcpServers,
          [serverName]: serverConfig,
        },
      };

      setConfig(newConfig);
    },
    [config],
  );

  const deleteServer = useCallback(
    (serverName: string) => {
      if (!config) return;

      const { [serverName]: _, ...remainingServers } = config.mcpServers;

      const newConfig = {
        ...config,
        mcpServers: remainingServers,
      };

      setConfig(newConfig);
    },
    [config],
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateServer,
    deleteServer,
  };
}
