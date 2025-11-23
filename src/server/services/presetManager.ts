import path from "path";
import { fileURLToPath } from "url";
import type { Preset } from "../types/index.js";
import { readJsonFile } from "../utils/fileSystem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PresetManager {
  private presets: Preset[] | null = null;

  async loadPresets(): Promise<Preset[]> {
    if (this.presets) {
      return this.presets;
    }

    const presetsPath = path.join(__dirname, "../../presets/mcpServers.json");

    try {
      const data = await readJsonFile<{ presets: Preset[] }>(presetsPath);
      this.presets = data.presets;
      return this.presets;
    } catch (error) {
      console.error("Failed to load presets:", error);
      return [];
    }
  }

  async getPresets(): Promise<Preset[]> {
    return this.loadPresets();
  }

  async getPresetById(id: string): Promise<Preset | undefined> {
    const presets = await this.loadPresets();
    return presets.find((preset) => preset.id === id);
  }

  async searchPresets(query: string): Promise<Preset[]> {
    const presets = await this.loadPresets();
    const lowerQuery = query.toLowerCase();

    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.description.toLowerCase().includes(lowerQuery) ||
        preset.category.toLowerCase().includes(lowerQuery),
    );
  }

  async getPresetsByCategory(category: string): Promise<Preset[]> {
    const presets = await this.loadPresets();
    return presets.filter((preset) => preset.category === category);
  }
}
