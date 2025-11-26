import type { ConfigScope, ConfigLocation } from "../types";

const scopeDisplayNames: Record<ConfigScope, string> = {
  project: "Project",
  cursor: "Cursor",
  vscode: "VS Code",
  user: "User",
  "claude-desktop": "Claude Desktop",
};

interface HeaderProps {
  configPath: string;
  configScope?: ConfigScope;
  configDisplayName?: string;
  locations?: ConfigLocation[];
  onReload: () => void;
  onScopeChange?: (scope: ConfigScope) => void;
  isSwitchingScope?: boolean;
}

function getScopeBadgeColor(scope?: ConfigScope): string {
  switch (scope) {
    case "project":
      return "bg-green-100 text-green-800 border-green-300";
    case "cursor":
      return "bg-teal-100 text-teal-800 border-teal-300";
    case "vscode":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "user":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "claude-desktop":
      return "bg-purple-100 text-purple-800 border-purple-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getScopeLabel(scope?: ConfigScope): string {
  return (scope ? scopeDisplayNames[scope] : undefined) ?? "Unknown";
}

export function Header({
  configPath,
  configScope,
  configDisplayName,
  onReload,
  locations,
  onScopeChange,
  isSwitchingScope,
}: HeaderProps) {
  const selectedScope =
    configScope ||
    locations?.find((location) => location.exists)?.scope ||
    locations?.[0]?.scope ||
    "";

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
                  configScope,
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
          <div className="flex items-center gap-3">
            {locations && locations.length > 0 && (
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
                value={selectedScope}
                onChange={(e) => {
                  const value = e.target.value as ConfigScope;
                  onScopeChange?.(value);
                }}
                disabled={isSwitchingScope}
              >
                {locations.map((location) => (
                  <option
                    key={`${location.scope}-${location.path}`}
                    value={location.scope}
                  >
                    {location.displayName || scopeDisplayNames[location.scope]}
                    {!location.exists ? " (create)" : ""}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={onReload}
              className="px-3 py-1 text-primary hover:text-blue-700 font-medium disabled:opacity-60"
              disabled={isSwitchingScope}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
