interface HeaderProps {
  configPath: string;
  onReload: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function Header({
  configPath,
  onReload,
  onExport,
  onImport,
}: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">MCP Setting Tool</h1>
          <div className="flex gap-2">
            <button
              onClick={onImport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Import
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Config file:</span>
            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
              {configPath}
            </span>
          </div>
          <button
            onClick={onReload}
            className="px-3 py-1 text-primary hover:text-blue-700 font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
