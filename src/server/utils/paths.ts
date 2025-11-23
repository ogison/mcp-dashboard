import path from 'path';
import os from 'os';

export function getConfigPath(): string {
  const platform = process.platform;
  const homeDir = os.homedir();

  switch (platform) {
    case 'darwin':
      return path.join(homeDir, 'Library/Application Support/Claude/claude_desktop_config.json');
    case 'win32':
      const appData = process.env.APPDATA;
      if (!appData) {
        throw new Error('APPDATA environment variable is not set');
      }
      return path.join(appData, 'Claude/claude_desktop_config.json');
    case 'linux':
      return path.join(homeDir, '.config/Claude/claude_desktop_config.json');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function getConfigDir(): string {
  return path.dirname(getConfigPath());
}

export function getBackupPath(timestamp?: number): string {
  const configPath = getConfigPath();
  const ts = timestamp || Date.now();
  return `${configPath}.backup.${ts}`;
}

export function isPathSafe(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  const configDir = getConfigDir();

  return normalized.startsWith(configDir);
}
