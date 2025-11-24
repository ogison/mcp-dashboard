import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { MCPConfig, ConfigInfoResponse, ConfigScope } from "../types";

export function useConfig() {
  const [config, setConfig] = useState<MCPConfig | null>(null);
  const [configInfo, setConfigInfo] = useState<ConfigInfoResponse | null>(null);
  const [selectedScope, setSelectedScope] = useState<ConfigScope | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(
    async (scope?: ConfigScope) => {
      const targetScope = scope ?? selectedScope;
      try {
        setLoading(true);
        setError(null);

        const info = await api.getConfigInfo(targetScope);
        setConfigInfo(info);
        setSelectedScope(info.scope);

        const data = await api.getConfig(info.scope);
        setConfig(data);
      } catch (err) {
        setError((err as Error).message);
        console.error("Failed to load config:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedScope],
  );

  const saveConfig = useCallback(
    async (newConfig: MCPConfig) => {
      try {
        setError(null);
        const scopeToSave = selectedScope ?? configInfo?.scope;
        await api.saveConfig(newConfig, scopeToSave);
        setConfig(newConfig);
        return true;
      } catch (err) {
        setError((err as Error).message);
        console.error("Failed to save config:", err);
        return false;
      }
    },
    [selectedScope, configInfo],
  );

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

  const changeScope = useCallback(
    async (scope: ConfigScope) => {
      await loadConfig(scope);
    },
    [loadConfig],
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    configInfo,
    selectedScope,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateServer,
    deleteServer,
    changeScope,
  };
}
