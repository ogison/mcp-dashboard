import React, { useState, useEffect } from 'react';
import { MCPConfig } from '../types';

interface JsonEditorProps {
  config: MCPConfig;
  onChange: (config: MCPConfig) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ config, onChange }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // configが変更されたらjsonTextを更新（外部から変更された場合）
  useEffect(() => {
    if (!isDirty) {
      setJsonText(JSON.stringify(config, null, 2));
    }
  }, [config, isDirty]);

  // 初期表示時にjsonTextを設定
  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2));
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    setIsDirty(true);

    // リアルタイムバリデーション
    try {
      const parsed = JSON.parse(newText);

      // 基本的な構造チェック
      if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
        setError('設定には "mcpServers" オブジェクトが必要です');
        return;
      }

      // 各サーバーの構造チェック
      for (const [serverName, serverConfig] of Object.entries(parsed.mcpServers)) {
        if (typeof serverConfig !== 'object' || serverConfig === null) {
          setError(`サーバー "${serverName}" の設定が無効です`);
          return;
        }

        const server = serverConfig as any;
        if (!server.command || typeof server.command !== 'string') {
          setError(`サーバー "${serverName}" にはcommandが必要です`);
          return;
        }

        if (server.args && !Array.isArray(server.args)) {
          setError(`サーバー "${serverName}" のargsは配列である必要があります`);
          return;
        }

        if (server.env && typeof server.env !== 'object') {
          setError(`サーバー "${serverName}" のenvはオブジェクトである必要があります`);
          return;
        }
      }

      setError(null);
      onChange(parsed as MCPConfig);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`JSON構文エラー: ${e.message}`);
      } else {
        setError('不明なエラーが発生しました');
      }
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`フォーマットできません: ${e.message}`);
      }
    }
  };

  const handleReset = () => {
    setJsonText(JSON.stringify(config, null, 2));
    setError(null);
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleFormat}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          フォーマット
        </button>
        {isDirty && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            リセット
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">エラー</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <textarea
          value={jsonText}
          onChange={handleTextChange}
          className="w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
          placeholder='{"mcpServers": {}}'
        />
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
        <p className="font-semibold mb-2">ヒント:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>JSON形式で設定を直接編集できます</li>
          <li>保存するには画面下部の「変更を保存」ボタンをクリックしてください</li>
          <li>「フォーマット」ボタンで整形できます</li>
        </ul>
      </div>
    </div>
  );
};
