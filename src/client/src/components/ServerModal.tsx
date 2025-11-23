import { useState, useEffect } from "react";
import type { MCPServer } from "../types";

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serverName: string, server: MCPServer) => void;
  serverName?: string;
  server?: MCPServer;
}

export function ServerModal({
  isOpen,
  onClose,
  onSave,
  serverName = "",
  server,
}: ServerModalProps) {
  const [name, setName] = useState(serverName);
  const [command, setCommand] = useState(server?.command || "");
  const [args, setArgs] = useState<string[]>(server?.args || []);
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>(
    server?.env
      ? Object.entries(server.env).map(([key, value]) => ({ key, value }))
      : [],
  );
  const [disabled, setDisabled] = useState(server?.disabled || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(serverName);
      setCommand(server?.command || "");
      setArgs(server?.args || []);
      setEnvVars(
        server?.env
          ? Object.entries(server.env).map(([key, value]) => ({ key, value }))
          : [],
      );
      setDisabled(server?.disabled || false);
      setErrors({});
    }
  }, [isOpen, serverName, server]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Server name is required";
    }

    if (!command.trim()) {
      newErrors.command = "Command is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const env: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key.trim()) {
        env[key.trim()] = value;
      }
    });

    const serverConfig: MCPServer = {
      command: command.trim(),
      ...(args.filter((a) => a.trim()).length > 0 && {
        args: args.filter((a) => a.trim()),
      }),
      ...(Object.keys(env).length > 0 && { env }),
      ...(disabled && { disabled }),
    };

    onSave(name.trim(), serverConfig);
    onClose();
  };

  const addArg = () => {
    setArgs([...args, ""]);
  };

  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index));
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {serverName ? "Edit MCP Server" : "Add MCP Server"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!serverName}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? "border-error" : "border-gray-300"
              } ${serverName ? "bg-gray-100" : ""}`}
              placeholder="e.g., filesystem"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Command <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.command ? "border-error" : "border-gray-300"
              }`}
              placeholder="e.g., npx"
            />
            {errors.command && (
              <p className="mt-1 text-sm text-error">{errors.command}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arguments
            </label>
            <div className="space-y-2">
              {args.map((arg, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={arg}
                    onChange={(e) => updateArg(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Argument"
                  />
                  <button
                    onClick={() => removeArg(index)}
                    className="px-3 py-2 bg-error text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addArg}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-primary hover:text-primary"
              >
                + Add Argument
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Variables
            </label>
            <div className="space-y-2">
              {envVars.map((envVar, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={envVar.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Value"
                  />
                  <button
                    onClick={() => removeEnvVar(index)}
                    className="px-3 py-2 bg-error text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addEnvVar}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-primary hover:text-primary"
              >
                + Add Variable
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disabled"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="disabled" className="ml-2 text-sm text-gray-700">
              Disable this server
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
