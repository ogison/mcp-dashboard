import { useState } from "react";
import { Header } from "./components/Header";
import { ServerCard } from "./components/ServerCard";
import { ServerModal } from "./components/ServerModal";
import { PresetModal } from "./components/PresetModal";
import { ToastContainer } from "./components/Toast";
import { TabSwitcher, TabType } from "./components/TabSwitcher";
import { JsonEditor } from "./components/JsonEditor";
import { useConfig } from "./hooks/useConfig";
import { api } from "./services/api";
import type { MCPServer, MCPConfig, Preset, Toast, ConfigScope } from "./types";

function App() {
  const {
    config,
    configInfo,
    selectedScope,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateServer,
    deleteServer,
    changeScope,
  } = useConfig();
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<{
    name: string;
    server: MCPServer;
  } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [isSwitchingScope, setIsSwitchingScope] = useState(false);

  const addToast = (type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddServer = () => {
    setEditingServer(null);
    setIsServerModalOpen(true);
  };

  const handleEditServer = (serverName: string) => {
    if (config) {
      setEditingServer({
        name: serverName,
        server: config.mcpServers[serverName],
      });
      setIsServerModalOpen(true);
    }
  };

  const handleDeleteServer = (serverName: string) => {
    if (window.confirm(`Are you sure you want to delete "${serverName}"?`)) {
      deleteServer(serverName);
      setHasUnsavedChanges(true);
      addToast("success", `Server "${serverName}" deleted`);
    }
  };

  const handleToggleServer = (serverName: string, disabled: boolean) => {
    if (config) {
      const server = config.mcpServers[serverName];
      updateServer(serverName, { ...server, disabled });
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveServer = (serverName: string, server: MCPServer) => {
    updateServer(serverName, server);
    setHasUnsavedChanges(true);
    addToast(
      "success",
      `Server "${serverName}" ${editingServer ? "updated" : "added"}`,
    );
  };

  const handleSaveConfig = async () => {
    if (config) {
      const success = await saveConfig(config);
      if (success) {
        setHasUnsavedChanges(false);
        addToast("success", "Configuration saved successfully");
      } else {
        addToast("error", "Failed to save configuration");
      }
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("Are you sure you want to discard all changes?")) {
      loadConfig(selectedScope);
      setHasUnsavedChanges(false);
      addToast("info", "Changes discarded");
    }
  };

  const handleScopeChange = async (scope: ConfigScope) => {
    setIsSwitchingScope(true);
    try {
      await changeScope(scope);
      setHasUnsavedChanges(false);
    } finally {
      setIsSwitchingScope(false);
    }
  };


  const handlePresetSelect = (preset: Preset) => {
    const baseName = preset.id;
    let serverName = baseName;
    let counter = 1;

    while (config?.mcpServers[serverName]) {
      serverName = `${baseName}-${counter}`;
      counter++;
    }

    setEditingServer({ name: serverName, server: preset.config });
    setIsServerModalOpen(true);
  };

  const handleJsonChange = (newConfig: MCPConfig) => {
    if (config) {
      // Replace existing configuration with imported JSON content
      Object.keys(config.mcpServers).forEach((key) => deleteServer(key));
      Object.entries(newConfig.mcpServers).forEach(([name, server]) => {
        updateServer(name, server);
      });
      setHasUnsavedChanges(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading configuration...</div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-error">Error: {error}</div>
      </div>
    );
  }

  const servers = config ? Object.entries(config.mcpServers) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        configPath={configInfo?.path || ""}
        configScope={configInfo?.scope}
        configDisplayName={configInfo?.displayName}
        locations={configInfo?.allLocations}
        onReload={async () => {
          await loadConfig(selectedScope);
          setHasUnsavedChanges(false);
        }}
        onScopeChange={handleScopeChange}
        isSwitchingScope={isSwitchingScope}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'list' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">MCP Servers</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPresetModalOpen(true)}
                    className="px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors"
                  >
                    + Add from Preset
                  </button>
                  <button
                    onClick={handleAddServer}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    + Add Server
                  </button>
                </div>
              </div>

              {servers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-4">No MCP servers configured</p>
                  <p className="text-sm">
                    Click "Add Server" or "Add from Preset" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {servers.map(([serverName, server]) => (
                    <ServerCard
                      key={serverName}
                      serverName={serverName}
                      server={server}
                      onEdit={handleEditServer}
                      onDelete={handleDeleteServer}
                      onToggle={handleToggleServer}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            config && (
              <JsonEditor
                config={config}
                onChange={handleJsonChange}
              />
            )
          )}
        </div>

        {hasUnsavedChanges && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleDiscardChanges}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2 bg-success text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <ServerModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onSave={handleSaveServer}
        serverName={editingServer?.name}
        server={editingServer?.server}
      />

      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelect={handlePresetSelect}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
