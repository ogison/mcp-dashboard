import type { MCPServer } from '../types';

interface ServerCardProps {
  serverName: string;
  server: MCPServer;
  onEdit: (serverName: string) => void;
  onDelete: (serverName: string) => void;
  onToggle: (serverName: string, disabled: boolean) => void;
}

export function ServerCard({ serverName, server, onEdit, onDelete, onToggle }: ServerCardProps) {
  const isDisabled = server.disabled || false;

  return (
    <div className={`bg-white border rounded-lg p-4 ${isDisabled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(serverName, !isDisabled)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isDisabled
                ? 'border-gray-300 bg-gray-100'
                : 'border-success bg-success'
            }`}
          >
            {!isDisabled && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {serverName}
            {isDisabled && <span className="ml-2 text-sm text-gray-500">(disabled)</span>}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(serverName)}
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(serverName)}
            className="px-3 py-1 text-sm bg-error text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Command:</span>
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{server.command}</span>
        </div>

        {server.args && server.args.length > 0 && (
          <div>
            <span className="text-gray-600">Args:</span>
            <div className="ml-2 mt-1 space-y-1">
              {server.args.map((arg, index) => (
                <div key={index} className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  {arg}
                </div>
              ))}
            </div>
          </div>
        )}

        {server.env && Object.keys(server.env).length > 0 && (
          <div>
            <span className="text-gray-600">Environment Variables:</span>
            <div className="ml-2 mt-1 space-y-1">
              {Object.entries(server.env).map(([key, value]) => (
                <div key={key} className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  <span className="text-gray-700">{key}:</span>{' '}
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
