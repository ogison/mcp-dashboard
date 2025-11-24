# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MCP Dashboard** is a GUI-based npm package for managing Claude Code and Claude Desktop's Model Context Protocol (MCP) settings. It provides a browser-based interface for configuring MCP servers without manually editing JSON files.

### Supported Configuration Files

The tool supports multiple configuration scopes with automatic detection and prioritization:

1. **Project Scope** (`.mcp.json`): Searched upward from current directory
2. **User Scope** (`~/.claude.json`): Claude Code user configuration
3. **Claude Desktop** (legacy): Platform-specific Claude Desktop config files

**Priority**: Project > User > Claude Desktop

### Core Architecture

This is a **full-stack TypeScript application** with a client-server architecture:

```
CLI (bin/cli.js)
    ↓ starts server + opens browser
Express Server (localhost:65432)
    ├─→ API Routes (/api/config, /api/presets)
    ├─→ Services Layer (configManager, validator, presetManager)
    ├─→ File System (reads/writes claude_desktop_config.json)
    └─→ Static Files (serves bundled React app)
         ↓
    React SPA (Vite build)
    └─→ Components + Custom Hooks + API Client
```

**Key Design Decisions:**
- **Service Layer Separation**: Business logic isolated from HTTP handlers for testability and reusability
- **Multiple TypeScript Configs**: Server, client, and CLI have different compilation targets and module resolution needs
- **Rate Limiting**: Three-tier protection (API: 100/15min, Write: 20/15min, Static: 500/15min)
- **Platform-Specific Paths**: Auto-detects macOS/Windows/Linux config locations via `src/server/utils/paths.ts`

### Tech Stack

- **Backend**: Node.js 22+ (ES Modules) + Express + TypeScript + Zod
- **Frontend**: React 19 + Vite 5 + TailwindCSS + React Hook Form
- **CLI**: Commander + Chalk + Open
- **Testing**: Jest + ts-jest

---

## Essential Commands

### Development
```bash
# Start both server and client with hot reload
npm run dev
# Server runs on :65432, Vite dev server on :62000
# In dev mode, API requests from :62000 are proxied to :65432

# Run separately if needed
npm run dev:server  # Backend only (tsx watch)
npm run dev:client  # Frontend only (Vite HMR)
```

### Building
```bash
npm run build
# Runs 3 steps:
# 1. build:server → TypeScript compilation (src/server → dist/server)
# 2. build:client → Vite bundle (src/client → dist/client)
# 3. copy:presets → Copy JSON files (src/presets → dist/presets)
```

### Testing
```bash
npm test                      # Run all tests
npm test -- --watch           # Watch mode
npm test -- --coverage        # With coverage report
npm test -- --verbose         # Detailed output
npm test -- configManager     # Run specific test file
```

### Code Quality
```bash
npm run lint    # TypeScript type check (no emit)
npm run format  # Prettier formatting
```

### Running Built Version
```bash
npm start                     # Start production server
npx mcp-dashboard              # Run as CLI tool
mcp-dashboard -p 62000         # Custom port
mcp-dashboard --no-open        # Don't auto-open browser
```

---

## Critical Patterns and Conventions

### ES Modules (Strictly Enforced)

**CRITICAL**: All imports MUST use `.js` extensions, even when importing `.ts` files:

```typescript
// CORRECT
import { loadConfig } from './services/configManager.js';
import type { MCPConfig } from './types/index.js';

// WRONG - will cause module resolution errors
import { loadConfig } from './services/configManager';
```

This is because TypeScript compiles to ES modules and Node.js requires explicit extensions.

### Multi-Scope Path Handling

**NEVER hardcode paths**. Always use `src/server/utils/paths.ts`:

```typescript
// CORRECT - Gets active config path (respects priority)
import { getConfigPath } from './utils/paths.js';
const configPath = await getConfigPath();

// CORRECT - Gets all config locations with metadata
import { getConfigLocations } from './utils/paths.js';
const locations = await getConfigLocations();

// CORRECT - Gets active config info (path + scope + displayName)
import { getActiveConfigLocation } from './utils/paths.js';
const activeConfig = await getActiveConfigLocation();

// WRONG
const configPath = '~/.config/Claude/claude_desktop_config.json';
```

**Config file search order** (priority: highest to lowest):

1. **Project**: `.mcp.json` (searched upward from cwd to home directory)
2. **User**: `~/.claude.json` (all platforms)
3. **Claude Desktop** (legacy):
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Important**: All path functions are now `async` because they check file existence.

### Security-First Design

1. **Input Validation**: All user input validated with Zod schemas on both client and server
2. **Path Traversal Prevention**: `isPathSafe()` in `src/server/utils/fileSystem.ts`
3. **Localhost-Only Binding**: Server MUST only bind to `127.0.0.1` (never `0.0.0.0`)
4. **Rate Limiting**: Three separate limiters for different endpoint types
5. **Auto-Backup**: Always backup before config writes

### Async/Await Pattern

Always use async/await for file operations:

```typescript
// CORRECT
const data = await fs.readFile(path, 'utf-8');

// AVOID (blocks event loop)
const data = fs.readFileSync(path, 'utf-8');
```

### React State Updates

Use functional updates when new state depends on previous state:

```typescript
// CORRECT
setConfig(prev => ({ ...prev, newField: value }));

// WRONG (may use stale data)
setConfig({ ...config, newField: value });
```

---

## Key Files and What They Control

### Backend Core

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/server/index.ts` | Express app setup, middleware, route registration | Adding middleware, new routes, server config |
| `src/server/services/configManager.ts` | Config CRUD operations, backup, validation | Changing load/save logic, backup strategy |
| `src/server/services/validator.ts` | Zod schemas, security checks | Adding validation rules, security checks |
| `src/server/utils/paths.ts` | Platform-specific path resolution | Supporting new platforms, config locations |
| `src/server/routes/config.ts` | Config API endpoints | Adding/modifying config endpoints |
| `src/server/routes/presets.ts` | Preset API endpoints | Adding/modifying preset endpoints |

### Frontend Core

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/client/src/App.tsx` | Main component, global state, import/export | Adding top-level features, state changes |
| `src/client/src/hooks/useConfig.ts` | Config state management and API calls | Adding config operations |
| `src/client/src/hooks/usePresets.ts` | Preset state management and API calls | Adding preset operations |
| `src/client/src/components/ServerModal.tsx` | Add/Edit server form (React Hook Form + Zod) | Changing form fields, validation |
| `src/client/src/services/api.ts` | HTTP client for backend API | Adding new API calls |

### Configuration

| File | Purpose |
|------|---------|
| `tsconfig.json` | Base TypeScript config |
| `tsconfig.server.json` | Server build (ES2020, Node modules) |
| `tsconfig.client.json` | Client build (ESNext, React JSX) |
| `tsconfig.node.json` | CLI utilities (Node environment) |
| `src/client/vite.config.ts` | Vite bundler config, proxy setup |
| `jest.config.js` | Jest test configuration (ES modules enabled) |
| `src/presets/mcpServers.json` | MCP server preset definitions |

---

## Architecture Details

### Data Flow

```
User Action (React UI)
    ↓
Custom Hook (useConfig/usePresets)
    ↓
API Client (fetch to /api/*)
    ↓
Express Route Handler
    ↓
Service Layer (business logic)
    ↓
Validator (Zod schema validation)
    ↓
File System Utils (with backup)
    ↓
claude_desktop_config.json (+ timestamped backup)
```

### Build Process

The build is split into three independent steps:

1. **Server**: `tsc -p tsconfig.server.json`
   - Compiles `src/server/**/*.ts` → `dist/server/**/*.js`
   - ES modules output for Node.js runtime

2. **Client**: `cd src/client && vite build`
   - Bundles React app → `dist/client/` (optimized, minified)
   - Includes HTML, CSS, JS with content hashing

3. **Presets**: `cp -r src/presets/* dist/presets/`
   - Copies JSON preset files

### Development vs Production

**Development Mode** (`npm run dev`):
- Server: tsx watch (TypeScript execution + hot reload) on :65432
- Client: Vite dev server (:62000) with HMR
- API proxy: Vite proxies `/api/*` to `localhost:65432`

**Production Mode** (`npm start`):
- Server: Compiled JS from `dist/server/`
- Client: Pre-bundled files from `dist/client/`
- Single server on port 65432 serves both API and static files

---

## Testing Guidelines

Tests are located in `__tests__/` directories next to source files.

**Focus areas:**
- Service layer logic (not route handlers)
- Edge cases: empty configs, missing files, invalid input
- Error handling paths
- Security validation

**Example structure:**
```typescript
describe('ConfigManager', () => {
  describe('loadConfig', () => {
    it('should load existing config');
    it('should create default config if missing');
    it('should handle file read errors');
  });
});
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. Create route handler in `src/server/routes/`
2. Add business logic to appropriate service
3. Register route in `src/server/index.ts`
4. Add client-side API call to `src/client/src/services/api.ts`
5. Add TypeScript types if needed

### Adding a New MCP Server Preset

Edit `src/presets/mcpServers.json`:
```json
{
  "id": "my-server",
  "name": "My MCP Server",
  "description": "What it does",
  "category": "Development",
  "config": {
    "command": "npx",
    "args": ["-y", "@org/package"],
    "env": { "API_KEY": "placeholder" }
  }
}
```

### Modifying Validation Rules

Update Zod schemas in `src/server/services/validator.ts`:
```typescript
const serverSchema = z.object({
  command: z.string().min(1).max(255),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  disabled: z.boolean().optional()
});
```

---

## Troubleshooting

### Build Fails
1. Check `npm install` completed
2. Run `npm run lint` to check TypeScript errors
3. Verify Node.js >= 22.0.0

### Tests Fail
- Run `npm test -- --verbose` for details
- Check for ES module import issues (missing `.js` extensions)
- Verify Jest config in `jest.config.js`

### Port Already in Use
```bash
mcp-dashboard -p 62000
```

### Config File Not Found
Ensure Claude Code is installed and has been run at least once to create the config file.

---

## Git Workflow

- **Main branch**: `main` (stable, production-ready)
- **Development branch**: `develop` (current)
- **Feature branches**: `claude/feature-name-<session-id>`

Commit message style: Clear, descriptive, focus on "why" not "what"

---

## Package Distribution

**Entry points:**
- `bin/cli.js`: Executable CLI
- `dist/server/index.js`: Main export

**Files included in npm package:**
- `bin/`, `dist/`, `README.md`, `LICENSE`

**Minimum Node version**: 22.0.0 (specified in `engines`)

---

## Quick Reference

### Ports
- Production: 65432 (configurable)
- Dev server: 65432
- Dev client (Vite): 62000

### Important Paths
- Server entry: `src/server/index.ts`
- Client entry: `src/client/src/main.tsx`
- CLI entry: `bin/cli.js`
- Presets: `src/presets/mcpServers.json`
- Tests: `src/server/services/__tests__/`

### Key NPM Scripts
```bash
npm run dev         # Development mode
npm run build       # Production build
npm test            # Run tests
npm run lint        # Type check
npm start           # Start server
```
