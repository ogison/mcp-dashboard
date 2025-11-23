import express, { Request, Response } from "express";
import { ConfigManager } from "../services/configManager.js";
import { getConfigPath } from "../utils/paths.js";
import { fileExists } from "../utils/fileSystem.js";
import type {
  MCPConfig,
  ApiResponse,
  ConfigPathResponse,
} from "../types/index.js";

const router = express.Router();
const configManager = new ConfigManager();

router.get("/config", async (_req: Request, res: Response) => {
  try {
    const config = await configManager.loadConfig();
    res.json(config);
  } catch (error) {
    console.error("Error loading config:", error);
    res.status(500).json({
      success: false,
      message: `Failed to load config: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

router.post("/config", async (req: Request, res: Response) => {
  try {
    const config: MCPConfig = req.body;

    const validationResult = configManager.validateConfig(config);
    if (!validationResult.valid) {
      res.status(400).json({
        success: false,
        message: "Invalid configuration",
        data: { errors: validationResult.errors },
      } as ApiResponse);
      return;
    }

    await configManager.saveConfig(config);

    res.json({
      success: true,
      message: "Configuration saved successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error saving config:", error);
    res.status(500).json({
      success: false,
      message: `Failed to save config: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

router.post("/config/validate", async (req: Request, res: Response) => {
  try {
    const config: MCPConfig = req.body;
    const validationResult = configManager.validateConfig(config);

    res.json(validationResult);
  } catch (error) {
    console.error("Error validating config:", error);
    res.status(500).json({
      valid: false,
      errors: [`Validation error: ${(error as Error).message}`],
    });
  }
});

router.get("/config/path", async (_req: Request, res: Response) => {
  try {
    const path = getConfigPath();
    const exists = await fileExists(path);

    res.json({
      path,
      exists,
    } as ConfigPathResponse);
  } catch (error) {
    console.error("Error getting config path:", error);
    res.status(500).json({
      success: false,
      message: `Failed to get config path: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

export default router;
