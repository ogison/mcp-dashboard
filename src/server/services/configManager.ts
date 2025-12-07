import type {
  MCPConfig,
  ClaudeUserConfig,
  ValidationResult,
  ConfigLocation,
  ConfigInfoResponse,
  ConfigScope,
} from "../types/index.js";
import {
  getConfigPath,
  getBackupPath,
  getActiveConfigLocation,
  getConfigLocations,
  getVSCodeUserSettingsPath,
} from "../utils/paths.js";
import {
  fileExists,
  readJsonFile,
  writeJsonFile,
  copyFile,
} from "../utils/fileSystem.js";
import { Validator } from "./validator.js";

export class ConfigManager {
  private validator: Validator;

  constructor() {
    this.validator = new Validator();
  }

  /**
   * Extract mcpServers from VS Code user settings.json
   * Supports several key styles to avoid breaking existing data
   */
  private extractVSCodeUserMcpServers(
    settings: Record<string, unknown>,
  ): MCPConfig["mcpServers"] {
    const mcpNested =
      settings &&
      typeof settings === "object" &&
      settings !== null &&
      (settings as any).mcp &&
      typeof (settings as any).mcp === "object" &&
      (settings as any).mcp !== null
        ? (settings as any).mcp.servers
        : undefined;

    const mcpDot = (settings as any)["mcp.servers"];
    const mcpFlat = (settings as any).mcpServers;

    const candidate =
      (typeof mcpNested === "object" && mcpNested !== null
        ? mcpNested
        : null) ||
      (typeof mcpDot === "object" && mcpDot !== null ? mcpDot : null) ||
      (typeof mcpFlat === "object" && mcpFlat !== null ? mcpFlat : null);

    return (candidate as MCPConfig["mcpServers"]) || {};
  }

  private async loadVSCodeUserConfig(): Promise<MCPConfig> {
    const settingsPath = getVSCodeUserSettingsPath();
    const exists = await fileExists(settingsPath);

    if (!exists) {
      return { mcpServers: {} };
    }

    const settings = await readJsonFile<Record<string, unknown>>(settingsPath);
    return { mcpServers: this.extractVSCodeUserMcpServers(settings) };
  }

  private async saveVSCodeUserConfig(config: MCPConfig): Promise<void> {
    const settingsPath = getVSCodeUserSettingsPath();
    const exists = await fileExists(settingsPath);
    const settings = exists
      ? await readJsonFile<Record<string, unknown>>(settingsPath)
      : {};

    const hasDotStyle =
      typeof (settings as any)["mcp.servers"] === "object" &&
      (settings as any)["mcp.servers"] !== null;
    const hasNestedStyle =
      typeof (settings as any).mcp === "object" &&
      (settings as any).mcp !== null &&
      typeof (settings as any).mcp.servers === "object";
    const hasFlatStyle =
      typeof (settings as any).mcpServers === "object" &&
      (settings as any).mcpServers !== null;

    if (hasDotStyle) {
      (settings as any)["mcp.servers"] = config.mcpServers;
    } else if (hasNestedStyle) {
      (settings as any).mcp = {
        ...(settings as any).mcp,
        servers: config.mcpServers,
      };
    } else if (hasFlatStyle) {
      (settings as any).mcpServers = config.mcpServers;
    } else {
      (settings as any).mcp = {
        ...(typeof (settings as any).mcp === "object" &&
        (settings as any).mcp !== null
          ? (settings as any).mcp
          : {}),
        servers: config.mcpServers,
      };
    }

    if (exists) {
      await this.backupConfig(settingsPath);
    }
    await writeJsonFile(settingsPath, settings);
  }

  /**
   * Load config from the active config file
   * Returns mcpServers even if file contains additional fields
   */
  async loadConfig(scope?: ConfigScope): Promise<MCPConfig> {
    if (scope === "vscode-user") {
      return this.loadVSCodeUserConfig();
    }

    const configPath = await getConfigPath(undefined, scope);
    const exists = await fileExists(configPath);

    if (!exists) {
      return { mcpServers: {} };
    }

    try {
      const config = await readJsonFile<ClaudeUserConfig>(configPath);

      // Return only mcpServers for backward compatibility
      return { mcpServers: config.mcpServers || {} };
    } catch (error) {
      throw new Error(`Failed to load config: ${(error as Error).message}`);
    }
  }

  /**
   * Load full config (including non-mcpServers fields for user config)
   */
  async loadFullConfig(
    scope?: ConfigScope,
  ): Promise<ClaudeUserConfig | MCPConfig> {
    if (scope === "vscode-user") {
      return this.loadVSCodeUserConfig();
    }

    const configPath = await getConfigPath(undefined, scope);
    const exists = await fileExists(configPath);

    if (!exists) {
      return { mcpServers: {} };
    }

    try {
      const config = await readJsonFile<ClaudeUserConfig>(configPath);
      return config;
    } catch (error) {
      throw new Error(`Failed to load config: ${(error as Error).message}`);
    }
  }

  /**
   * Save config to the active config file
   * For user config (~/.claude.json), preserves non-mcpServers fields
   */
  async saveConfig(
    config: MCPConfig | ClaudeUserConfig,
    scope?: ConfigScope,
  ): Promise<void> {
    if (scope === "vscode-user") {
      return this.saveVSCodeUserConfig({ mcpServers: config.mcpServers });
    }

    // Validate mcpServers
    const validationResult = this.validateConfig({
      mcpServers: config.mcpServers,
    });
    if (!validationResult.valid) {
      throw new Error(`Invalid config: ${validationResult.errors.join(", ")}`);
    }

    const configPath = await getConfigPath(undefined, scope);
    const location = await getActiveConfigLocation(undefined, scope);
    const exists = await fileExists(configPath);

    if (exists) {
      await this.backupConfig(configPath);
    }

    try {
      let dataToSave: MCPConfig | ClaudeUserConfig;

      if (location?.scope === "user") {
        // For user config, preserve existing fields
        const existingConfig = exists
          ? await readJsonFile<ClaudeUserConfig>(configPath)
          : {};

        dataToSave = {
          ...existingConfig,
          ...config,
          mcpServers: config.mcpServers,
        };
      } else {
        // For project and claude-desktop configs, save only mcpServers
        dataToSave = { mcpServers: config.mcpServers };
      }

      await writeJsonFile(configPath, dataToSave);
    } catch (error) {
      throw new Error(`Failed to save config: ${(error as Error).message}`);
    }
  }

  /**
   * Backup config file
   */
  async backupConfig(configPath?: string): Promise<string> {
    const targetPath = configPath || (await getConfigPath());
    const exists = await fileExists(targetPath);

    if (!exists) {
      throw new Error("Config file does not exist, cannot backup");
    }

    const backupPath = getBackupPath(targetPath);

    try {
      await copyFile(targetPath, backupPath);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup config: ${(error as Error).message}`);
    }
  }

  /**
   * Validate config
   */
  validateConfig(config: MCPConfig): ValidationResult {
    return this.validator.validateMCPConfig(config);
  }

  /**
   * Get active config path
   */
  async getConfigPath(scope?: ConfigScope): Promise<string> {
    return getConfigPath(undefined, scope);
  }

  /**
   * Get active config location with metadata
   */
  async getActiveConfigInfo(scope?: ConfigScope): Promise<ConfigInfoResponse> {
    const location = await getActiveConfigLocation(undefined, scope);
    const allLocations = await getConfigLocations();

    if (location) {
      return {
        path: location.path,
        exists: location.exists,
        scope: location.scope,
        displayName: location.displayName,
        allLocations,
      };
    }

    // No config exists, return user config as default
    const defaultLocation = allLocations.find((loc) => loc.scope === "user");
    return {
      path: defaultLocation!.path,
      exists: false,
      scope: "user",
      displayName: defaultLocation!.displayName,
      allLocations,
    };
  }

  /**
   * Check if config exists
   */
  async configExists(scope?: ConfigScope): Promise<boolean> {
    const configPath = await getConfigPath(undefined, scope);
    return fileExists(configPath);
  }
}
