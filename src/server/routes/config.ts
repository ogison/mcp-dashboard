import express, { Request, Response } from "express";
import { ConfigManager } from "../services/configManager.js";
import type {
  MCPConfig,
  ClaudeUserConfig,
  ApiResponse,
  ConfigPathResponse,
  ConfigInfoResponse,
  ConfigScope,
} from "../types/index.js";

const router = express.Router();
const configManager = new ConfigManager();

const validScopes: ConfigScope[] = ["project", "user", "claude-desktop"];

function parseScope(scope?: string): ConfigScope | undefined {
  if (!scope) return undefined;
  if (validScopes.includes(scope as ConfigScope)) {
    return scope as ConfigScope;
  }
  return undefined;
}

router.get("/config", async (req: Request, res: Response) => {
  try {
    const scope = parseScope(req.query.scope as string | undefined);
    if (req.query.scope && !scope) {
      res.status(400).json({
        success: false,
        message: "Invalid scope parameter",
      } as ApiResponse);
      return;
    }

    const config = await configManager.loadConfig(scope);
    res.json(config);
  } catch (error) {
    console.error("Error loading config:", error);
    res.status(500).json({
      success: false,
      message: `Failed to load config: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

// Load full config (including non-mcpServers fields)
router.get("/config/full", async (req: Request, res: Response) => {
  try {
    const scope = parseScope(req.query.scope as string | undefined);
    if (req.query.scope && !scope) {
      res.status(400).json({
        success: false,
        message: "Invalid scope parameter",
      } as ApiResponse);
      return;
    }

    const config = await configManager.loadFullConfig(scope);
    res.json(config);
  } catch (error) {
    console.error("Error loading full config:", error);
    res.status(500).json({
      success: false,
      message: `Failed to load full config: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

router.post("/config", async (req: Request, res: Response) => {
  try {
    const scope = parseScope(req.query.scope as string | undefined);
    if (req.query.scope && !scope) {
      res.status(400).json({
        success: false,
        message: "Invalid scope parameter",
      } as ApiResponse);
      return;
    }

    const config: MCPConfig | ClaudeUserConfig = req.body;

    const validationResult = configManager.validateConfig({ mcpServers: config.mcpServers });
    if (!validationResult.valid) {
      res.status(400).json({
        success: false,
        message: "Invalid configuration",
        data: { errors: validationResult.errors },
      } as ApiResponse);
      return;
    }

    await configManager.saveConfig(config, scope);

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

// Get active config information (path, scope, all locations)
router.get("/config/info", async (req: Request, res: Response) => {
  try {
    const scope = parseScope(req.query.scope as string | undefined);
    if (req.query.scope && !scope) {
      res.status(400).json({
        success: false,
        message: "Invalid scope parameter",
      } as ApiResponse);
      return;
    }

    const info = await configManager.getActiveConfigInfo(scope);
    res.json(info satisfies ConfigInfoResponse);
  } catch (error) {
    console.error("Error getting config info:", error);
    res.status(500).json({
      success: false,
      message: `Failed to get config info: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

// Legacy endpoint for backward compatibility
router.get("/config/path", async (req: Request, res: Response) => {
  try {
    const scope = parseScope(req.query.scope as string | undefined);
    if (req.query.scope && !scope) {
      res.status(400).json({
        success: false,
        message: "Invalid scope parameter",
      } as ApiResponse);
      return;
    }

    const path = await configManager.getConfigPath(scope);
    const exists = await configManager.configExists(scope);

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
