import { ConfigManager } from '../configManager.js';
import type { MCPConfig } from '../../types/index.js';
import * as paths from '../../utils/paths.js';
import * as fileSystem from '../../utils/fileSystem.js';

// Mock the modules
jest.mock('../../utils/paths.js');
jest.mock('../../utils/fileSystem.js');

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const mockConfigPath = '/mock/config/path.json';
  const mockBackupPath = '/mock/backup/path.json';

  const validConfig: MCPConfig = {
    mcpServers: {
      'test-server': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
      },
    },
  };

  beforeEach(() => {
    configManager = new ConfigManager();
    jest.clearAllMocks();

    // Setup default mocks
    (paths.getConfigPath as jest.Mock).mockReturnValue(mockConfigPath);
    (paths.getBackupPath as jest.Mock).mockReturnValue(mockBackupPath);
  });

  describe('loadConfig', () => {
    test('should load existing config file', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);
      (fileSystem.readJsonFile as jest.Mock).mockResolvedValue(validConfig);

      const result = await configManager.loadConfig();

      expect(result).toEqual(validConfig);
      expect(fileSystem.fileExists).toHaveBeenCalledWith(mockConfigPath);
      expect(fileSystem.readJsonFile).toHaveBeenCalledWith(mockConfigPath);
    });

    test('should return empty config when file does not exist', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(false);

      const result = await configManager.loadConfig();

      expect(result).toEqual({ mcpServers: {} });
      expect(fileSystem.readJsonFile).not.toHaveBeenCalled();
    });

    test('should throw error when file read fails', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);
      (fileSystem.readJsonFile as jest.Mock).mockRejectedValue(new Error('Read error'));

      await expect(configManager.loadConfig()).rejects.toThrow('Failed to load config');
    });
  });

  describe('saveConfig', () => {
    test('should save valid config and create backup', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);
      (fileSystem.copyFile as jest.Mock).mockResolvedValue(undefined);
      (fileSystem.writeJsonFile as jest.Mock).mockResolvedValue(undefined);

      await configManager.saveConfig(validConfig);

      expect(fileSystem.copyFile).toHaveBeenCalledWith(mockConfigPath, mockBackupPath);
      expect(fileSystem.writeJsonFile).toHaveBeenCalledWith(mockConfigPath, validConfig);
    });

    test('should save valid config without backup when file does not exist', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(false);
      (fileSystem.writeJsonFile as jest.Mock).mockResolvedValue(undefined);

      await configManager.saveConfig(validConfig);

      expect(fileSystem.copyFile).not.toHaveBeenCalled();
      expect(fileSystem.writeJsonFile).toHaveBeenCalledWith(mockConfigPath, validConfig);
    });

    test('should reject invalid config', async () => {
      const invalidConfig = { mcpServers: 'invalid' } as any;

      await expect(configManager.saveConfig(invalidConfig)).rejects.toThrow('Invalid config');
      expect(fileSystem.writeJsonFile).not.toHaveBeenCalled();
    });

    test('should throw error when write fails', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(false);
      (fileSystem.writeJsonFile as jest.Mock).mockRejectedValue(new Error('Write error'));

      await expect(configManager.saveConfig(validConfig)).rejects.toThrow('Failed to save config');
    });
  });

  describe('backupConfig', () => {
    test('should create backup of existing config', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);
      (fileSystem.copyFile as jest.Mock).mockResolvedValue(undefined);

      const result = await configManager.backupConfig();

      expect(result).toBe(mockBackupPath);
      expect(fileSystem.copyFile).toHaveBeenCalledWith(mockConfigPath, mockBackupPath);
    });

    test('should throw error when config does not exist', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(false);

      await expect(configManager.backupConfig()).rejects.toThrow('Config file does not exist');
      expect(fileSystem.copyFile).not.toHaveBeenCalled();
    });

    test('should throw error when backup fails', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);
      (fileSystem.copyFile as jest.Mock).mockRejectedValue(new Error('Copy error'));

      await expect(configManager.backupConfig()).rejects.toThrow('Failed to backup config');
    });
  });

  describe('validateConfig', () => {
    test('should validate config', () => {
      const result = configManager.validateConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return validation errors for invalid config', () => {
      const invalidConfig = { mcpServers: null } as any;
      const result = configManager.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getConfigPath', () => {
    test('should return config path', async () => {
      const result = await configManager.getConfigPath();
      expect(result).toBe(mockConfigPath);
    });
  });

  describe('configExists', () => {
    test('should return true when config exists', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(true);

      const result = await configManager.configExists();
      expect(result).toBe(true);
    });

    test('should return false when config does not exist', async () => {
      (fileSystem.fileExists as jest.Mock).mockResolvedValue(false);

      const result = await configManager.configExists();
      expect(result).toBe(false);
    });
  });
});
