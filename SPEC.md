# MCP Setting Tool - 仕様書

## 1. プロジェクト概要

### 1.1 目的
Claude CodeのModel Context Protocol (MCP)設定を、ブラウザベースのGUIを通じて簡単に設定・管理できるnpmパッケージを提供する。

### 1.2 ターゲットユーザー
- Claude Codeを使用する開発者
- MCP設定をGUIで管理したいユーザー
- 複数のMCPサーバーを効率的に管理したいユーザー

### 1.3 プロジェクト名
`mcp-setting`

## 2. 機能要件

### 2.1 コア機能

#### 2.1.1 コマンドライン起動
```bash
npx mcp-setting
```
- Web サーバーを起動
- デフォルトブラウザを自動的に開く
- ランダムまたは指定可能なポートを使用

#### 2.1.2 MCP設定の読み込み
- Claude Codeの設定ファイルを自動検出
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`
- 既存のMCP設定を読み込んで表示

#### 2.1.3 MCP設定の編集
- MCPサーバーの追加
  - サーバー名
  - コマンド
  - 引数（配列）
  - 環境変数（オプション）
- MCPサーバーの編集
- MCPサーバーの削除
- MCPサーバーの有効/無効切り替え

#### 2.1.4 設定の保存
- バリデーション機能
  - JSON構文チェック
  - 必須フィールドの確認
  - コマンドの実行可能性チェック（オプション）
- バックアップ機能
  - 保存前に既存設定を自動バックアップ
  - バックアップファイル: `claude_desktop_config.json.backup.[timestamp]`
- 設定ファイルへの書き込み

#### 2.1.5 プリセット機能
- よく使われるMCPサーバーのプリセット提供
  - Filesystem MCP
  - Git MCP
  - GitHub MCP
  - Brave Search MCP
  - その他の公式MCPサーバー
- プリセットからのワンクリック追加

### 2.2 追加機能

#### 2.2.1 設定のインポート/エクスポート
- JSON形式でのエクスポート
- JSON形式でのインポート
- 設定の共有を容易にする

#### 2.2.2 接続テスト
- MCPサーバーへの接続テスト機能
- エラーメッセージの表示

#### 2.2.3 ログビューア
- MCPサーバーのログ表示（将来的な拡張）

## 3. 技術スタック

### 3.1 バックエンド
- **Node.js**: v18以上
- **Express**: Webサーバーフレームワーク
- **TypeScript**: 型安全な開発

### 3.2 フロントエンド
- **React**: UIライブラリ
- **Vite**: ビルドツール
- **TailwindCSS**: スタイリング
- **React Hook Form**: フォーム管理
- **Zod**: バリデーション

### 3.3 その他
- **open**: ブラウザ自動起動
- **commander**: CLIオプション解析
- **chalk**: カラフルなコンソール出力

## 4. UI/UX仕様

### 4.1 レイアウト構成

```
+--------------------------------------------------+
|  MCP Setting Tool              [Import] [Export] |
+--------------------------------------------------+
|                                                  |
|  設定ファイルパス: ~/.config/Claude/claude_...  |
|                                        [Reload]  |
|                                                  |
|  +--------------------------------------------+  |
|  | MCP Servers                      [+ Add]   |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | ○ filesystem-server           [Edit][Del] |  |
|  |   Command: npx                             |  |
|  |   Args: -y @modelcontextprotocol/server... |  |
|  |                                            |  |
|  | ○ git-server                  [Edit][Del] |  |
|  |   Command: npx                             |  |
|  |   Args: -y @modelcontextprotocol/server... |  |
|  |                                            |  |
|  | ✕ github-server (disabled)    [Edit][Del] |  |
|  |   Command: npx                             |  |
|  |   Args: -y @modelcontextprotocol/server... |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  [Save Changes]                   [Discard]     |
|                                                  |
+--------------------------------------------------+
```

### 4.2 画面遷移

#### 4.2.1 メイン画面
- MCP サーバー一覧表示
- 各サーバーの有効/無効状態
- 追加/編集/削除ボタン

#### 4.2.2 追加/編集モーダル
```
+----------------------------------+
|  Add MCP Server           [x]    |
+----------------------------------+
|                                  |
|  Server Name *                   |
|  [_________________________]     |
|                                  |
|  Command *                       |
|  [_________________________]     |
|                                  |
|  Arguments (one per line)        |
|  [_________________________]     |
|  [_________________________]     |
|  [+ Add Argument]                |
|                                  |
|  Environment Variables           |
|  Key         Value               |
|  [_______]   [____________] [-]  |
|  [+ Add Variable]                |
|                                  |
|  □ Enable this server            |
|                                  |
|  [Cancel]           [Save]       |
+----------------------------------+
```

#### 4.2.3 プリセット選択モーダル
```
+----------------------------------+
|  Add from Preset          [x]    |
+----------------------------------+
|                                  |
|  Search: [_______________]       |
|                                  |
|  ○ Filesystem MCP                |
|    Access local files and dirs   |
|                                  |
|  ○ Git MCP                       |
|    Git repository operations     |
|                                  |
|  ○ GitHub MCP                    |
|    GitHub API integration        |
|                                  |
|  ○ Brave Search MCP              |
|    Web search capabilities       |
|                                  |
|  [Cancel]           [Add]        |
+----------------------------------+
```

### 4.3 カラースキーム
- プライマリ: Blue (#3B82F6)
- セカンダリ: Gray (#6B7280)
- 成功: Green (#10B981)
- 警告: Yellow (#F59E0B)
- エラー: Red (#EF4444)
- 背景: White/Light Gray
- テキスト: Dark Gray (#1F2937)

### 4.4 レスポンシブデザイン
- デスクトップ優先（最小幅: 1024px推奨）
- タブレット対応（768px以上）

## 5. API仕様

### 5.1 REST API エンドポイント

#### 5.1.1 設定の取得
```
GET /api/config
Response: {
  "mcpServers": {
    "server-name": {
      "command": "string",
      "args": ["string"],
      "env": {
        "KEY": "value"
      },
      "disabled": boolean
    }
  }
}
```

#### 5.1.2 設定の保存
```
POST /api/config
Request: {
  "mcpServers": { ... }
}
Response: {
  "success": boolean,
  "message": "string"
}
```

#### 5.1.3 設定のバリデーション
```
POST /api/config/validate
Request: {
  "mcpServers": { ... }
}
Response: {
  "valid": boolean,
  "errors": ["string"]
}
```

#### 5.1.4 プリセット一覧の取得
```
GET /api/presets
Response: {
  "presets": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "config": { ... }
    }
  ]
}
```

#### 5.1.5 設定ファイルパスの取得
```
GET /api/config/path
Response: {
  "path": "string",
  "exists": boolean
}
```

#### 5.1.6 接続テスト
```
POST /api/test/:serverName
Response: {
  "success": boolean,
  "message": "string"
}
```

## 6. データ構造

### 6.1 MCP設定ファイル形式（Claude Desktop Config）
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/path/to/repo"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      },
      "disabled": true
    }
  }
}
```

### 6.2 内部データモデル
```typescript
interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  config: MCPServer;
}
```

## 7. セキュリティ要件

### 7.1 ファイルアクセス
- 設定ファイルへのアクセスは読み取り/書き込みのみ
- パストラバーサル攻撃の防止
- 適切なファイルパーミッションチェック

### 7.2 入力バリデーション
- コマンドインジェクション防止
- 環境変数の値のサニタイズ
- JSON構造の厳密なバリデーション

### 7.3 ローカルホスト限定
- Web サーバーは localhost のみでリッスン
- 外部ネットワークからのアクセス不可

## 8. エラーハンドリング

### 8.1 エラーケース
- 設定ファイルが存在しない
- 設定ファイルの読み込みエラー
- JSON パースエラー
- 設定ファイルへの書き込みエラー
- 無効なMCP設定
- ポートの競合

### 8.2 エラー表示
- トースト通知でエラーメッセージ表示
- エラーの詳細をコンソールに出力
- ユーザーフレンドリーなエラーメッセージ

## 9. パフォーマンス要件

- Web サーバー起動時間: 3秒以内
- ブラウザ起動: サーバー起動後即座
- UI レスポンス: 100ms以内
- 設定保存: 1秒以内

## 10. 互換性

### 10.1 OS互換性
- macOS (10.15以降)
- Windows (10以降)
- Linux (主要ディストリビューション)

### 10.2 Node.js バージョン
- Node.js 18.x 以上

### 10.3 ブラウザ互換性
- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 11. 今後の拡張案

- MCPサーバーのステータス監視
- リアルタイムログビューア
- 設定の同期機能（クラウド連携）
- カスタムプリセットの作成と共有
- 複数プロファイル対応
- Dark Mode 対応
- 多言語対応
