import type { MCPConfig, ValidationResult } from '../types/index.js';
import { getConfigPath, getBackupPath } from '../utils/paths.js';
import { fileExists, readJsonFile, writeJsonFile, copyFile } from '../utils/fileSystem.js';
import { Validator } from './validator.js';

export class ConfigManager {
  private validator: Validator;

  constructor() {
    this.validator = new Validator();
  }

  async loadConfig(): Promise<MCPConfig> {
    const configPath = getConfigPath();
    const exists = await fileExists(configPath);

    if (!exists) {
      return { mcpServers: {} };
    }

    try {
      const config = await readJsonFile<MCPConfig>(configPath);
      return config;
    } catch (error) {
      throw new Error(`Failed to load config: ${(error as Error).message}`);
    }
  }

  async saveConfig(config: MCPConfig): Promise<void> {
    const validationResult = this.validateConfig(config);
    if (!validationResult.valid) {
      throw new Error(`Invalid config: ${validationResult.errors.join(', ')}`);
    }

    const configPath = getConfigPath();
    const exists = await fileExists(configPath);

    if (exists) {
      await this.backupConfig();
    }

    try {
      await writeJsonFile(configPath, config);
    } catch (error) {
      throw new Error(`Failed to save config: ${(error as Error).message}`);
    }
  }

  async backupConfig(): Promise<string> {
    const configPath = getConfigPath();
    const exists = await fileExists(configPath);

    if (!exists) {
      throw new Error('Config file does not exist, cannot backup');
    }

    const backupPath = getBackupPath();

    try {
      await copyFile(configPath, backupPath);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup config: ${(error as Error).message}`);
    }
  }

  validateConfig(config: MCPConfig): ValidationResult {
    return this.validator.validateMCPConfig(config);
  }

  async getConfigPath(): Promise<string> {
    return getConfigPath();
  }

  async configExists(): Promise<boolean> {
    const configPath = getConfigPath();
    return fileExists(configPath);
  }
}
