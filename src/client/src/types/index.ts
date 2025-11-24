export interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
}

// Claude Code user config (~/.claude.json) with additional fields
export interface ClaudeUserConfig extends MCPConfig {
  numStartups?: number;
  theme?: string;
  projects?: Record<string, any>;
  hasCompletedOnboarding?: boolean;
  [key: string]: any; // Allow other fields
}

// Configuration file location and scope information
export type ConfigScope = 'project' | 'user' | 'claude-desktop';

export interface ConfigLocation {
  path: string;
  scope: ConfigScope;
  exists: boolean;
  displayName: string; // User-friendly name for UI
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  config: MCPServer;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ConfigPathResponse {
  path: string;
  exists: boolean;
}

// Extended response with scope information
export interface ConfigInfoResponse extends ConfigPathResponse {
  scope: ConfigScope;
  displayName: string;
  allLocations?: ConfigLocation[];
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
