import type {
  MCPConfig,
  ClaudeUserConfig,
  Preset,
  ApiResponse,
  ConfigPathResponse,
  ConfigInfoResponse,
  ConfigScope,
} from "../types";

const API_BASE = "/api";

function buildScopeQuery(scope?: ConfigScope): string {
  return scope ? `?scope=${encodeURIComponent(scope)}` : "";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
}

export const api = {
  async getConfig(scope?: ConfigScope): Promise<MCPConfig> {
    const response = await fetch(`${API_BASE}/config${buildScopeQuery(scope)}`);
    return handleResponse<MCPConfig>(response);
  },

  async getFullConfig(
    scope?: ConfigScope,
  ): Promise<ClaudeUserConfig | MCPConfig> {
    const response = await fetch(
      `${API_BASE}/config/full${buildScopeQuery(scope)}`,
    );
    return handleResponse<ClaudeUserConfig | MCPConfig>(response);
  },

  async saveConfig(
    config: MCPConfig | ClaudeUserConfig,
    scope?: ConfigScope,
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${API_BASE}/config${buildScopeQuery(scope)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      },
    );
    return handleResponse<ApiResponse>(response);
  },

  async getConfigPath(scope?: ConfigScope): Promise<ConfigPathResponse> {
    const response = await fetch(
      `${API_BASE}/config/path${buildScopeQuery(scope)}`,
    );
    return handleResponse<ConfigPathResponse>(response);
  },

  async getConfigInfo(scope?: ConfigScope): Promise<ConfigInfoResponse> {
    const response = await fetch(
      `${API_BASE}/config/info${buildScopeQuery(scope)}`,
    );
    return handleResponse<ConfigInfoResponse>(response);
  },

  async getPresets(): Promise<{ presets: Preset[] }> {
    const response = await fetch(`${API_BASE}/presets`);
    return handleResponse<{ presets: Preset[] }>(response);
  },

  async getPresetById(id: string): Promise<Preset> {
    const response = await fetch(`${API_BASE}/presets/${id}`);
    return handleResponse<Preset>(response);
  },

  async searchPresets(query: string): Promise<{ presets: Preset[] }> {
    const response = await fetch(
      `${API_BASE}/presets/search/${encodeURIComponent(query)}`,
    );
    return handleResponse<{ presets: Preset[] }>(response);
  },
};
