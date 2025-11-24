import type { ConfigScope } from "../types";

interface HeaderProps {
  configPath: string;
  configScope?: ConfigScope;
  configDisplayName?: string;
  onReload: () => void;
}

function getScopeBadgeColor(scope?: ConfigScope): string {
  switch (scope) {
    case "project":
      return "bg-green-100 text-green-800 border-green-300";
    case "user":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "claude-desktop":
      return "bg-purple-100 text-purple-800 border-purple-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getScopeLabel(scope?: ConfigScope): string {
  switch (scope) {
    case "project":
      return "Project";
    case "user":
      return "User";
    case "claude-desktop":
      return "Claude Desktop";
    default:
      return "Unknown";
  }
}

export function Header({
  configPath,
  configScope,
  configDisplayName,
  onReload,
}: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">MCP Dashboard</h1>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {configScope && (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded border ${getScopeBadgeColor(
                  configScope
                )}`}
              >
                {getScopeLabel(configScope)}
              </span>
            )}
            <span className="text-gray-600">
              {configDisplayName || "Config file:"}
            </span>
            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
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
