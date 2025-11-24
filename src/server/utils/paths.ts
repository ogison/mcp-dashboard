import path from "path";
import os from "os";
import fs from "fs/promises";
import type { ConfigLocation, ConfigScope } from "../types/index.js";

/**
 * Find .mcp.json by searching upward from current directory
 * Stops at home directory to avoid searching entire filesystem
 */
export async function findProjectMcpConfig(
  startDir: string = process.cwd(),
): Promise<string | null> {
  const homeDir = os.homedir();
  let currentDir = path.resolve(startDir);

  // Search upward until we hit home directory
  while (true) {
    const mcpPath = path.join(currentDir, ".mcp.json");

    try {
      await fs.access(mcpPath);
      return mcpPath;
    } catch {
      // File doesn't exist, continue searching
    }

    // Stop if we've reached home directory
    if (currentDir === homeDir) {
      break;
    }

    const parentDir = path.dirname(currentDir);

    // Stop if we've reached root (parent === current)
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

/**
 * Get Claude Code user config path (~/.claude.json)
 */
export function getUserMcpConfigPath(): string {
  return path.join(os.homedir(), ".claude.json");
}

/**
 * Get Claude Desktop config path (platform-specific)
 * Legacy path for backward compatibility
 */
export function getClaudeDesktopConfigPath(): string {
  const platform = process.platform;
  const homeDir = os.homedir();

  switch (platform) {
    case "darwin":
      return path.join(
        homeDir,
        "Library/Application Support/Claude/claude_desktop_config.json",
      );
    case "win32":
      const appData = process.env.APPDATA;
      if (!appData) {
        throw new Error("APPDATA environment variable is not set");
      }
      return path.join(appData, "Claude/claude_desktop_config.json");
    case "linux":
      return path.join(homeDir, ".config/Claude/claude_desktop_config.json");
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Get all possible config locations in priority order
 * Priority: .mcp.json > ~/.claude.json > claude_desktop_config.json
 */
export async function getConfigLocations(
  startDir?: string,
): Promise<ConfigLocation[]> {
  const locations: ConfigLocation[] = [];

  // 1. Project scope (.mcp.json)
  const projectPath = await findProjectMcpConfig(startDir);
  if (projectPath) {
    locations.push({
      path: projectPath,
      scope: "project",
      exists: true,
      displayName: `.mcp.json (${path.basename(path.dirname(projectPath))})`,
    });
  }

  // 2. User scope (~/.claude.json)
  const userPath = getUserMcpConfigPath();
  let userExists = false;
  try {
    await fs.access(userPath);
    userExists = true;
  } catch {
    // File doesn't exist
  }
  locations.push({
    path: userPath,
    scope: "user",
    exists: userExists,
    displayName: "~/.claude.json (User)",
  });

  // 3. Claude Desktop scope (legacy)
  const desktopPath = getClaudeDesktopConfigPath();
  let desktopExists = false;
  try {
    await fs.access(desktopPath);
    desktopExists = true;
  } catch {
    // File doesn't exist
  }
  locations.push({
    path: desktopPath,
    scope: "claude-desktop",
    exists: desktopExists,
    displayName: "Claude Desktop Config",
  });

  return locations;
}

/**
 * Get the active config location (first existing file in priority order)
 */
export async function getActiveConfigLocation(
  startDir?: string,
): Promise<ConfigLocation | null> {
  const locations = await getConfigLocations(startDir);
  return locations.find((loc) => loc.exists) || null;
}

/**
 * Get the config path (backward compatible function)
 * Returns the first existing config file, or user config path if none exist
 */
export async function getConfigPath(startDir?: string): Promise<string> {
  const activeLocation = await getActiveConfigLocation(startDir);
  if (activeLocation) {
    return activeLocation.path;
  }

  // If no config exists, return user config path (for creation)
  return getUserMcpConfigPath();
}

/**
 * Get config directory from config path
 */
export function getConfigDir(configPath?: string): string {
  if (configPath) {
    return path.dirname(configPath);
  }
  // Fallback to Claude Desktop path for backward compatibility
  return path.dirname(getClaudeDesktopConfigPath());
}

/**
 * Get backup path for a config file
 */
export function getBackupPath(configPath: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  const date = new Date(ts);
  const dateStr = date
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  const timeStr = date
    .toTimeString()
    .split(" ")[0]
    .replace(/:/g, "");
  return `${configPath}.backup.${dateStr}_${timeStr}`;
}

/**
 * Check if a file path is safe (within allowed directories)
 */
export function isPathSafe(filePath: string, configPath?: string): boolean {
  const normalized = path.normalize(filePath);

  // Allow paths in home directory
  const homeDir = os.homedir();
  if (normalized.startsWith(homeDir)) {
    return true;
  }

  // Allow paths in current working directory
  const cwd = process.cwd();
  if (normalized.startsWith(cwd)) {
    return true;
  }

  // If specific config path provided, check its directory
  if (configPath) {
    const configDir = path.dirname(configPath);
    if (normalized.startsWith(configDir)) {
      return true;
    }
  }

  return false;
}
