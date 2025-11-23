import { useState } from "react";
import type { Preset } from "../types";
import { usePresets } from "../hooks/usePresets";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: Preset) => void;
}

export function PresetModal({ isOpen, onClose, onSelect }: PresetModalProps) {
  const { presets, loading, searchPresets } = usePresets();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchPresets(query);
  };

  const handleSelect = (preset: Preset) => {
    onSelect(preset);
    onClose();
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add from Preset</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search presets..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading presets...
            </div>
          ) : presets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No presets found
            </div>
          ) : (
            <div className="space-y-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelect(preset)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {preset.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {preset.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(preset);
                      }}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {preset.description}
                  </p>
                  <div className="text-xs font-mono bg-gray-50 p-2 rounded">
                    <div>
                      <span className="text-gray-600">Command:</span>{" "}
                      <span className="text-gray-900">
                        {preset.config.command}
                      </span>
                    </div>
                    {preset.config.args && preset.config.args.length > 0 && (
                      <div className="mt-1">
                        <span className="text-gray-600">Args:</span>{" "}
                        <span className="text-gray-900">
                          {preset.config.args.join(" ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
