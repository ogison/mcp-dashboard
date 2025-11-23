import express, { Request, Response } from 'express';
import { PresetManager } from '../services/presetManager.js';
import type { ApiResponse, Preset } from '../types/index.js';

const router = express.Router();
const presetManager = new PresetManager();

router.get('/presets', async (_req: Request, res: Response) => {
  try {
    const presets = await presetManager.getPresets();
    res.json({ presets });
  } catch (error) {
    console.error('Error loading presets:', error);
    res.status(500).json({
      success: false,
      message: `Failed to load presets: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

router.get('/presets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const preset = await presetManager.getPresetById(id);

    if (!preset) {
      res.status(404).json({
        success: false,
        message: `Preset with id "${id}" not found`,
      } as ApiResponse);
      return;
    }

    res.json(preset);
  } catch (error) {
    console.error('Error loading preset:', error);
    res.status(500).json({
      success: false,
      message: `Failed to load preset: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

router.get('/presets/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const presets = await presetManager.searchPresets(query);
    res.json({ presets });
  } catch (error) {
    console.error('Error searching presets:', error);
    res.status(500).json({
      success: false,
      message: `Failed to search presets: ${(error as Error).message}`,
    } as ApiResponse);
  }
});

export default router;
