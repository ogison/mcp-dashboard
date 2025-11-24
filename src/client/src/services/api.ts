import type {
  MCPConfig,
  ClaudeUserConfig,
  Preset,
  ValidationResult,
  ApiResponse,
  ConfigPathResponse,
  ConfigInfoResponse,
} from "../types";

const API_BASE = "/api";

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
  async getConfig(): Promise<MCPConfig> {
    const response = await fetch(`${API_BASE}/config`);
    return handleResponse<MCPConfig>(response);
  },

  async getFullConfig(): Promise<ClaudeUserConfig | MCPConfig> {
    const response = await fetch(`${API_BASE}/config/full`);
    return handleResponse<ClaudeUserConfig | MCPConfig>(response);
  },

  async saveConfig(config: MCPConfig | ClaudeUserConfig): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
    return handleResponse<ApiResponse>(response);
  },

  async getConfigPath(): Promise<ConfigPathResponse> {
    const response = await fetch(`${API_BASE}/config/path`);
    return handleResponse<ConfigPathResponse>(response);
  },

  async getConfigInfo(): Promise<ConfigInfoResponse> {
    const response = await fetch(`${API_BASE}/config/info`);
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
