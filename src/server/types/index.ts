export interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
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

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}
