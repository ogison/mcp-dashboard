# MCP Setting Tool - 実装計画書

## 1. プロジェクト構造

```
mcp-setting/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── LICENSE
├── SPEC.md
├── IMPLEMENTATION_PLAN.md
├── bin/
│   └── cli.js                 # CLI エントリーポイント
├── src/
│   ├── server/                # バックエンド
│   │   ├── index.ts           # Express サーバー
│   │   ├── routes/
│   │   │   ├── config.ts      # 設定API
│   │   │   └── presets.ts     # プリセットAPI
│   │   ├── services/
│   │   │   ├── configManager.ts   # 設定ファイル管理
│   │   │   ├── validator.ts       # バリデーション
│   │   │   └── presetManager.ts   # プリセット管理
│   │   ├── utils/
│   │   │   ├── paths.ts           # パス解決
│   │   │   └── fileSystem.ts      # ファイル操作
│   │   └── types/
│   │       └── index.ts           # 型定義
│   ├── client/                # フロントエンド
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx       # エントリーポイント
│   │   │   ├── App.tsx        # メインコンポーネント
│   │   │   ├── components/
│   │   │   │   ├── ServerList.tsx
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   ├── ServerModal.tsx
│   │   │   │   ├── PresetModal.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useConfig.ts
│   │   │   │   └── usePresets.ts
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── styles/
│   │   │       └── index.css
│   │   └── vite.config.ts
│   └── presets/
│       └── mcpServers.json    # プリセット定義
└── dist/                      # ビルド成果物
    ├── server/
    └── client/
```

## 2. 実装フェーズ

### Phase 1: プロジェクトセットアップ（1-2日）
- [x] リポジトリ初期化
- [ ] package.json 設定
- [ ] TypeScript 設定
- [ ] ビルドツールのセットアップ
- [ ] 依存関係のインストール

### Phase 2: バックエンド基盤（2-3日）
- [ ] Express サーバーの基本構造
- [ ] 設定ファイルパス解決ロジック
- [ ] 設定ファイル読み込み/書き込みサービス
- [ ] バックアップ機能
- [ ] バリデーションロジック
- [ ] プリセットマネージャー

### Phase 3: API実装（2-3日）
- [ ] GET /api/config
- [ ] POST /api/config
- [ ] POST /api/config/validate
- [ ] GET /api/presets
- [ ] GET /api/config/path
- [ ] エラーハンドリング
- [ ] CORS設定

### Phase 4: フロントエンド基盤（2-3日）
- [ ] React + Vite セットアップ
- [ ] TailwindCSS 設定
- [ ] ルーティング設定
- [ ] API クライアントサービス
- [ ] カスタムフック（useConfig, usePresets）
- [ ] 型定義

### Phase 5: UI コンポーネント（3-4日）
- [ ] Header コンポーネント
- [ ] ServerList コンポーネント
- [ ] ServerCard コンポーネント
- [ ] ServerModal コンポーネント（追加/編集）
- [ ] PresetModal コンポーネント
- [ ] Toast 通知コンポーネント
- [ ] スタイリング

### Phase 6: 機能統合（2-3日）
- [ ] CRUD 操作の実装
- [ ] プリセット選択機能
- [ ] インポート/エクスポート機能
- [ ] 設定の有効/無効切り替え
- [ ] フォームバリデーション
- [ ] エラーハンドリング

### Phase 7: CLI実装（1-2日）
- [ ] CLI エントリーポイント
- [ ] コマンドラインオプション解析
- [ ] サーバー起動ロジック
- [ ] ブラウザ自動起動
- [ ] ポート管理
- [ ] シャットダウン処理

### Phase 8: テスト（2-3日）
- [ ] バックエンドユニットテスト
- [ ] API統合テスト
- [ ] フロントエンドコンポーネントテスト
- [ ] E2Eテスト
- [ ] クロスプラットフォームテスト

### Phase 9: ドキュメント & リリース準備（1-2日）
- [ ] README.md 作成
- [ ] 使用方法のドキュメント
- [ ] プリセット一覧のドキュメント
- [ ] CHANGELOG.md
- [ ] npm パッケージ設定
- [ ] バージョン設定

### Phase 10: リリース（1日）
- [ ] npm publish
- [ ] GitHub リリース作成
- [ ] リリースノート

**総見積もり時間: 17-26日（約3-4週間）**

## 3. 詳細タスク分解

### 3.1 Phase 1: プロジェクトセットアップ

#### タスク 1.1: package.json 設定
```json
{
  "name": "mcp-setting",
  "version": "0.1.0",
  "description": "GUI tool for managing Claude Code MCP settings",
  "bin": {
    "mcp-setting": "./dist/cli.js"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc -p tsconfig.server.json",
    "build:client": "vite build",
    "start": "node dist/server/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "format": "prettier --write src/**/*.{ts,tsx}"
  },
  "keywords": ["mcp", "claude", "claude-code", "gui", "config"],
  "author": "",
  "license": "MIT"
}
```

#### タスク 1.2: 依存関係
```bash
# バックエンド
npm install express cors body-parser open chalk commander

# 開発依存関係
npm install -D typescript @types/node @types/express @types/cors tsx nodemon concurrently

# フロントエンド
npm install react react-dom react-hook-form zod @hookform/resolvers

# フロントエンド開発依存関係
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer @types/react @types/react-dom

# テスト
npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
```

#### タスク 1.3: TypeScript設定
- tsconfig.json（共通）
- tsconfig.server.json（サーバー用）
- tsconfig.client.json（クライアント用）

#### タスク 1.4: .gitignore
```
node_modules/
dist/
.env
*.log
.DS_Store
coverage/
.vscode/
*.backup.*
```

### 3.2 Phase 2: バックエンド基盤

#### タスク 2.1: 設定ファイルパス解決
```typescript
// src/server/utils/paths.ts
export function getConfigPath(): string {
  const platform = process.platform;
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  switch (platform) {
    case 'darwin':
      return path.join(homeDir, 'Library/Application Support/Claude/claude_desktop_config.json');
    case 'win32':
      return path.join(process.env.APPDATA, 'Claude/claude_desktop_config.json');
    case 'linux':
      return path.join(homeDir, '.config/Claude/claude_desktop_config.json');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
```

#### タスク 2.2: 設定マネージャー
```typescript
// src/server/services/configManager.ts
export class ConfigManager {
  async loadConfig(): Promise<MCPConfig>
  async saveConfig(config: MCPConfig): Promise<void>
  async backupConfig(): Promise<string>
  async validateConfig(config: MCPConfig): Promise<ValidationResult>
}
```

#### タスク 2.3: バリデーター
```typescript
// src/server/services/validator.ts
export class Validator {
  validateMCPConfig(config: MCPConfig): ValidationResult
  validateServerConfig(server: MCPServer): ValidationResult
  validateCommand(command: string): boolean
  validateEnvVars(env: Record<string, string>): ValidationResult
}
```

### 3.3 Phase 3: API実装

#### タスク 3.1: ルート定義
```typescript
// src/server/routes/config.ts
router.get('/config', getConfig);
router.post('/config', saveConfig);
router.post('/config/validate', validateConfig);
router.get('/config/path', getConfigPath);

// src/server/routes/presets.ts
router.get('/presets', getPresets);
```

#### タスク 3.2: コントローラー実装
- 各エンドポイントのハンドラー実装
- エラーハンドリング
- レスポンス形式の統一

### 3.4 Phase 4: フロントエンド基盤

#### タスク 4.1: Vite設定
```typescript
// src/client/vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/client',
  },
});
```

#### タスク 4.2: APIクライアント
```typescript
// src/client/src/services/api.ts
export const api = {
  getConfig: () => fetch('/api/config').then(r => r.json()),
  saveConfig: (config) => fetch('/api/config', {...}).then(r => r.json()),
  validateConfig: (config) => fetch('/api/config/validate', {...}),
  getPresets: () => fetch('/api/presets').then(r => r.json()),
  getConfigPath: () => fetch('/api/config/path').then(r => r.json()),
};
```

#### タスク 4.3: カスタムフック
```typescript
// src/client/src/hooks/useConfig.ts
export function useConfig() {
  const [config, setConfig] = useState<MCPConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => { ... };
  const saveConfig = async (newConfig: MCPConfig) => { ... };

  return { config, loading, error, loadConfig, saveConfig };
}
```

### 3.5 Phase 5: UIコンポーネント

#### タスク 5.1: コンポーネント構造
各コンポーネントに以下を実装:
- Props 型定義
- State 管理
- イベントハンドラー
- レンダリングロジック
- スタイリング（TailwindCSS）

#### タスク 5.2: ServerModal フォーム
- React Hook Form でフォーム管理
- Zod でバリデーション
- 動的な引数/環境変数の追加/削除

### 3.6 Phase 6: 機能統合

#### タスク 6.1: CRUD操作フロー
1. サーバー追加: UI → バリデーション → API → ファイル保存 → UI更新
2. サーバー編集: 同上
3. サーバー削除: UI → 確認ダイアログ → API → UI更新
4. 有効/無効切り替え: UI → API → UI更新

#### タスク 6.2: インポート/エクスポート
- JSON ファイルのダウンロード
- JSON ファイルのアップロードと検証

### 3.7 Phase 7: CLI実装

#### タスク 7.1: CLIエントリーポイント
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { startServer } from '../server';
import open from 'open';
import chalk from 'chalk';

const program = new Command();

program
  .name('mcp-setting')
  .description('GUI tool for managing Claude Code MCP settings')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    const port = parseInt(options.port);
    await startServer(port);

    console.log(chalk.green('MCP Setting Tool started!'));
    console.log(chalk.blue(`Server running at http://localhost:${port}`));

    if (options.open) {
      await open(`http://localhost:${port}`);
    }
  });

program.parse();
```

#### タスク 7.2: サーバー起動ロジック
- ポートの可用性チェック
- Graceful shutdown
- エラーハンドリング

### 3.8 Phase 8: テスト

#### タスク 8.1: バックエンドテスト
```typescript
describe('ConfigManager', () => {
  test('should load config file', async () => { ... });
  test('should save config file', async () => { ... });
  test('should create backup', async () => { ... });
  test('should validate config', async () => { ... });
});
```

#### タスク 8.2: フロントエンドテスト
```typescript
describe('ServerModal', () => {
  test('should render form', () => { ... });
  test('should validate input', () => { ... });
  test('should submit form', async () => { ... });
});
```

#### タスク 8.3: E2Eテスト
- Playwright or Cypress を使用
- ユーザーフロー全体のテスト

## 4. 技術的な考慮事項

### 4.1 設定ファイルの並行アクセス
- ファイルロック機構の実装
- 楽観的ロックまたは悲観的ロック

### 4.2 エラーリカバリー
- バックアップからの復元機能
- 不正な設定の検出と修正

### 4.3 パフォーマンス最適化
- 設定ファイルのキャッシング
- デバウンス処理
- 遅延ロード

### 4.4 セキュリティ
- CSRF対策（localhost限定なので優先度低）
- パストラバーサル対策
- コマンドインジェクション対策

### 4.5 クロスプラットフォーム対応
- パス区切り文字の処理
- 環境変数の違い
- ファイルパーミッション

## 5. プリセット定義

```json
{
  "presets": [
    {
      "id": "filesystem",
      "name": "Filesystem MCP",
      "description": "Access local files and directories",
      "category": "Official",
      "config": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"]
      }
    },
    {
      "id": "git",
      "name": "Git MCP",
      "description": "Git repository operations",
      "category": "Official",
      "config": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/repo"]
      }
    },
    {
      "id": "github",
      "name": "GitHub MCP",
      "description": "GitHub API integration",
      "category": "Official",
      "config": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
        }
      }
    },
    {
      "id": "brave-search",
      "name": "Brave Search MCP",
      "description": "Web search capabilities",
      "category": "Official",
      "config": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {
          "BRAVE_API_KEY": "<your-api-key>"
        }
      }
    }
  ]
}
```

## 6. リリースチェックリスト

### 6.1 コード品質
- [ ] すべてのテストがパス
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] セキュリティ脆弱性チェック（npm audit）

### 6.2 ドキュメント
- [ ] README.md が完成
- [ ] インストール手順が明確
- [ ] 使用例が記載されている
- [ ] トラブルシューティングガイド
- [ ] CHANGELOG.md が更新されている

### 6.3 パッケージング
- [ ] package.json が正しく設定されている
- [ ] .npmignore が適切
- [ ] bin フィールドが正しい
- [ ] バージョン番号が適切

### 6.4 動作確認
- [ ] macOS で動作確認
- [ ] Windows で動作確認
- [ ] Linux で動作確認
- [ ] npx 経由での実行確認
- [ ] グローバルインストール確認

### 6.5 npm公開
- [ ] npm アカウント作成
- [ ] npm login
- [ ] npm publish --dry-run でチェック
- [ ] npm publish で公開
- [ ] 公開後の動作確認（npx mcp-setting）

## 7. メンテナンス計画

### 7.1 バージョニング戦略
- セマンティックバージョニング (SemVer) を採用
- MAJOR: 破壊的変更
- MINOR: 機能追加
- PATCH: バグ修正

### 7.2 イシュー管理
- GitHub Issues でバグ報告・機能リクエストを管理
- ラベルで分類（bug, enhancement, documentation, etc.）

### 7.3 継続的改善
- ユーザーフィードバックの収集
- パフォーマンス監視
- セキュリティアップデート
- 依存関係の更新

## 8. 成功指標

### 8.1 機能的指標
- すべての主要機能が動作
- クロスプラットフォーム対応完了
- エラーハンドリングが適切

### 8.2 品質指標
- テストカバレッジ 80% 以上
- Lint/型エラー 0
- セキュリティ脆弱性 0

### 8.3 ユーザビリティ指標
- 直感的なUI
- 明確なエラーメッセージ
- 充実したドキュメント

## 9. リスクと対策

### 9.1 リスク
1. **設定ファイル形式の変更**: Claude側で設定ファイル形式が変更される可能性
2. **プラットフォーム依存**: 異なるOSでの動作差異
3. **セキュリティ**: ローカルファイル操作のセキュリティリスク
4. **ブラウザ起動失敗**: 特定環境でブラウザが起動しない

### 9.2 対策
1. バージョン管理とマイグレーション機能
2. 十分なクロスプラットフォームテスト
3. 厳格なバリデーションとサニタイゼーション
4. フォールバック処理とマニュアルアクセス手順の提供

## 10. 次のステップ

1. **Phase 1の開始**: プロジェクトセットアップ
2. **開発環境の構築**: 必要なツールのインストール
3. **基本構造の実装**: サーバーとクライアントの骨組み
4. **反復的な開発**: フェーズごとに実装・テスト・レビュー
5. **ベータリリース**: 限定的なユーザーでのテスト
6. **正式リリース**: npm への公開
