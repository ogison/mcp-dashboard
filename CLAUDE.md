# CLAUDE.md - AI Assistant Guide for MCP Setting Tool

This document provides comprehensive guidance for AI assistants working with the MCP Setting Tool codebase.

## Project Overview

**MCP Setting Tool** is a GUI-based npm package for managing Claude Code's Model Context Protocol (MCP) settings. It provides a user-friendly web interface for configuring MCP servers without manually editing JSON files.

### Key Features
- Browser-based GUI for MCP configuration
- Cross-platform support (macOS, Windows, Linux)
- Preset library for common MCP servers
- Import/export configurations
- Auto-backup before changes
- Input validation and security checks

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React 19 + Vite + TailwindCSS
- **CLI**: Commander + Chalk + Open
- **Validation**: Zod
- **Testing**: Jest + ts-jest
- **Form Management**: React Hook Form

---

## Codebase Structure

```
mcp-setting/
├── bin/
│   └── cli.js                      # CLI entry point (executable)
├── src/
│   ├── server/                     # Backend (Express API)
│   │   ├── index.ts                # Server setup and exports
│   │   ├── routes/                 # API endpoints
│   │   │   ├── config.ts           # Config CRUD operations
│   │   │   └── presets.ts          # Preset management
│   │   ├── services/               # Business logic
│   │   │   ├── configManager.ts    # Config lifecycle management
│   │   │   ├── validator.ts        # Input validation with Zod
│   │   │   ├── presetManager.ts    # Preset handling
│   │   │   └── __tests__/          # Jest unit tests
│   │   ├── utils/
│   │   │   ├── paths.ts            # Platform-specific path resolution
│   │   │   └── fileSystem.ts       # File I/O utilities
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   ├── client/                     # Frontend (React SPA)
│   │   ├── src/
│   │   │   ├── App.tsx             # Main React component
│   │   │   ├── components/         # UI components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   ├── ServerModal.tsx
│   │   │   │   ├── PresetModal.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   ├── useConfig.ts
│   │   │   │   └── usePresets.ts
│   │   │   ├── services/
│   │   │   │   └── api.ts          # HTTP client
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── vite.config.ts
│   │   └── index.html
│   ├── presets/
│   │   └── mcpServers.json         # Preset definitions
│   └── test/
│       └── setup.ts                # Jest configuration
├── dist/                           # Build output (gitignored)
├── package.json
├── tsconfig.json                   # Base TypeScript config
├── tsconfig.server.json            # Server-specific config
├── tsconfig.client.json            # Client-specific config
└── jest.config.js                  # Test configuration
```

---

## Architecture

### Overview
The application follows a **client-server architecture** with:
- **Express server** handling API requests and serving static files
- **React SPA** for the user interface
- **CLI wrapper** that starts the server and opens the browser

### Request Flow
```
User runs CLI → Server starts → Browser opens → React app loads
                     ↓
             Express listens on localhost:3000
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
    API Routes              Static Files
    /api/config             /index.html
    /api/presets            /assets/*
    /api/config/validate
         ↓
    Services Layer
    - configManager
    - validator
    - presetManager
         ↓
    File System
    - Read/Write claude_desktop_config.json
    - Backup operations
```

### Key Design Patterns

#### Backend Patterns
- **Service Layer Pattern**: Business logic separated in services/
- **Route-Service Separation**: Routes handle HTTP, services handle logic
- **Singleton Services**: ConfigManager and PresetManager are stateless
- **Error Middleware**: Centralized error handling in Express

#### Frontend Patterns
- **Custom Hooks**: Encapsulate state management and API calls
- **Component Composition**: Small, focused components
- **Controlled Components**: React Hook Form manages form state
- **Toast Notifications**: Non-blocking user feedback

---

## Development Workflows

### Initial Setup
```bash
# Clone and install
git clone <repo-url>
cd mcp-setting
npm install

# Build the project
npm run build
```

### Development Mode
```bash
# Run both server and client in watch mode
npm run dev

# Or run separately:
npm run dev:server  # Backend on :3000
npm run dev:client  # Frontend on :5173 (Vite dev server)
```

**Note**: In dev mode, the client runs on Vite's dev server (:5173) with hot reload, while the backend runs on :3000.

### Building for Production
```bash
npm run build
# This runs:
# 1. npm run build:server  → tsc -p tsconfig.server.json
# 2. npm run build:client  → vite build in src/client
# 3. npm run copy:presets  → copy presets to dist/
```

### Testing
```bash
npm test           # Run all tests
npm run test:watch # Watch mode (if configured)
npm run lint       # Type checking only
```

### Code Quality
```bash
npm run format     # Prettier formatting
npm run lint       # TypeScript type checking
```

---

## Key Conventions

### Code Style
- **ES Modules**: All code uses `import/export` (not `require`)
- **TypeScript**: Strict typing enabled
- **Async/Await**: Prefer over callbacks or raw Promises
- **Error Handling**: Use try-catch blocks, propagate errors with meaningful messages

### Naming Conventions
- **Files**: camelCase for .ts/.tsx files (e.g., `configManager.ts`)
- **Components**: PascalCase for React components (e.g., `ServerCard.tsx`)
- **Functions**: camelCase (e.g., `loadConfig`, `validateServer`)
- **Interfaces**: PascalCase (e.g., `MCPConfig`, `ServerConfig`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `DEFAULT_PORT`)

### File Organization
- **Index Exports**: Use `index.ts` to re-export from modules
- **Co-location**: Tests live in `__tests__/` next to source files
- **Type Definitions**: Centralized in `types/index.ts` per module

### API Conventions
- **REST Endpoints**: Use standard HTTP methods (GET, POST, PUT, DELETE)
- **Response Format**: Always return JSON with consistent structure
- **Error Responses**: Include `{ error: string, message?: string }`
- **Success Responses**: Include relevant data and optional `message`

---

## Important Files and What They Do

### Backend Core Files

#### `src/server/index.ts`
The main server entry point. Exports:
- `createApp()`: Creates Express app with middleware and routes
- `startServer(port, openBrowser)`: Starts server and optionally opens browser

**When to modify**: Adding new middleware, routes, or server configuration.

#### `src/server/services/configManager.ts`
Manages the entire config lifecycle:
- `loadConfig()`: Reads Claude's config file (auto-detects platform)
- `saveConfig(config)`: Validates and saves with auto-backup
- `validateConfig(config)`: Validates using Zod schema
- `getConfigPath()`: Returns platform-specific config file path
- `createBackup()`: Creates timestamped backup

**When to modify**: Changing config load/save logic, backup strategy, or validation.

#### `src/server/services/validator.ts`
Validates all user input:
- Zod schemas for MCPConfig and MCPServer
- Security checks (command injection, path traversal)
- Environment variable validation

**When to modify**: Adding new validation rules or security checks.

#### `src/server/utils/paths.ts`
Platform-specific path resolution:
- `getConfigFilePath()`: Returns correct path for macOS/Windows/Linux
- Handles environment variables and home directory expansion

**When to modify**: Supporting new platforms or config locations.

### Frontend Core Files

#### `src/client/src/App.tsx`
The main React component:
- Manages global state (config, modals, toasts)
- Handles import/export functionality
- Coordinates all child components

**When to modify**: Adding new top-level features or state management.

#### `src/client/src/hooks/useConfig.ts`
Custom hook for config management:
- `loadConfig()`: Fetches config from API
- `saveConfig()`: Saves config via API
- `updateServer()`: Updates a single server
- `deleteServer()`: Removes a server
- State management for config data

**When to modify**: Adding new config operations or changing state logic.

#### `src/client/src/components/ServerModal.tsx`
Form modal for adding/editing servers:
- Uses React Hook Form + Zod validation
- Dynamic form fields (args, env vars)
- Preset integration

**When to modify**: Changing server form fields or validation rules.

### Configuration Files

#### `src/presets/mcpServers.json`
Preset definitions for common MCP servers:
- Filesystem, Git, GitHub, Brave Search, PostgreSQL, SQLite, Puppeteer, Slack

**When to modify**: Adding new presets or updating existing ones.

#### `tsconfig.*.json`
Multiple TypeScript configs for different contexts:
- `tsconfig.json`: Base config
- `tsconfig.server.json`: Server-side compilation
- `tsconfig.client.json`: Client-side compilation
- `tsconfig.node.json`: Node utilities (CLI)

**When to modify**: Changing compiler options or paths.

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route handler** in `src/server/routes/`:
```typescript
// src/server/routes/myFeature.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/my-endpoint', async (req: Request, res: Response) => {
  try {
    // Your logic here
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
```

2. **Register route** in `src/server/index.ts`:
```typescript
import myFeatureRouter from './routes/myFeature.js';
app.use('/api/my-feature', myFeatureRouter);
```

3. **Add client API call** in `src/client/src/services/api.ts`:
```typescript
export const fetchMyFeature = async () => {
  const response = await fetch(`${API_BASE}/my-feature`);
  return response.json();
};
```

### Adding a New Preset

Edit `src/presets/mcpServers.json`:
```json
{
  "id": "my-new-server",
  "name": "My New MCP Server",
  "description": "Description of what it does",
  "category": "Development",
  "config": {
    "command": "npx",
    "args": ["-y", "@my-org/my-mcp-server"],
    "env": {
      "API_KEY": "your-key-here"
    }
  }
}
```

### Adding a New React Component

1. **Create component** in `src/client/src/components/`:
```tsx
// MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h2>{title}</h2>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
};
```

2. **Use in parent component**:
```tsx
import { MyComponent } from './components/MyComponent';

<MyComponent title="Hello" onAction={() => console.log('Clicked')} />
```

### Adding Unit Tests

Create test file in `__tests__/` directory:
```typescript
// src/server/services/__tests__/myService.test.ts
import { describe, it, expect } from '@jest/globals';
import { myFunction } from '../myService';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

---

## Security Considerations

### Critical Security Rules

1. **Path Traversal Prevention**
   - Always validate file paths in `src/server/utils/fileSystem.ts`
   - Never allow user input to directly construct file paths
   - Use path sanitization before file operations

2. **Command Injection Prevention**
   - Validate commands against whitelist (if applicable)
   - Don't execute arbitrary user-provided commands
   - Sanitize environment variables

3. **Localhost-Only Binding**
   - Server MUST only listen on `127.0.0.1` or `localhost`
   - Never bind to `0.0.0.0` in production

4. **Input Validation**
   - Use Zod schemas for all user input
   - Validate on both client and server
   - Sanitize before storing or executing

5. **Backup Before Write**
   - Always create backup before modifying config
   - Use timestamped backups for recovery

### Validation Example
```typescript
// Always validate user input
const serverSchema = z.object({
  command: z.string().min(1).max(255),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  disabled: z.boolean().optional()
});

const result = serverSchema.safeParse(userInput);
if (!result.success) {
  throw new Error('Invalid server configuration');
}
```

---

## Testing Guidelines

### Unit Testing Strategy
- **Test services, not routes**: Focus on business logic
- **Mock file system**: Use Jest mocks for fs operations
- **Test edge cases**: Empty configs, missing files, invalid input
- **Test error handling**: Ensure errors are caught and handled

### Example Test Structure
```typescript
describe('ConfigManager', () => {
  describe('loadConfig', () => {
    it('should load existing config');
    it('should create default config if missing');
    it('should handle file read errors');
  });

  describe('saveConfig', () => {
    it('should save valid config');
    it('should create backup before save');
    it('should reject invalid config');
  });
});
```

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Generate coverage report
```

---

## Configuration Management

### Claude Config File Locations

The tool automatically detects the platform and reads from:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Config File Structure
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "env": {
        "KEY": "value"
      },
      "disabled": false
    }
  }
}
```

### Backup Strategy
- Backups created before every save
- Format: `claude_desktop_config.json.backup.YYYYMMDD_HHMMSS`
- No automatic cleanup (user responsibility)

---

## Build and Deployment

### Build Process
1. **Server Build**: TypeScript → JavaScript (ES modules)
   - Input: `src/server/**/*.ts`
   - Output: `dist/server/**/*.js`
   - Config: `tsconfig.server.json`

2. **Client Build**: Vite bundles React app
   - Input: `src/client/src/**/*`
   - Output: `dist/client/` (bundled and minified)
   - Config: `src/client/vite.config.ts`

3. **Preset Copy**: Copy JSON files
   - Input: `src/presets/*.json`
   - Output: `dist/presets/*.json`

### Package Distribution
```json
{
  "bin": {
    "mcp-setting": "./bin/cli.js"
  },
  "main": "./dist/server/index.js",
  "files": ["bin/", "dist/", "README.md", "LICENSE"]
}
```

### NPM Scripts Reference
- `dev`: Run both server and client in watch mode
- `build`: Build entire project for production
- `start`: Start production server
- `test`: Run Jest tests
- `lint`: TypeScript type checking
- `format`: Format code with Prettier

---

## Troubleshooting Common Issues

### Issue: Port Already in Use
**Solution**: Use `-p` flag to specify different port
```bash
mcp-setting -p 3001
```

### Issue: Config File Not Found
**Cause**: Claude Code not installed or never run
**Solution**: Install and run Claude Code at least once to create config file

### Issue: Build Fails
**Check**:
1. `npm install` completed successfully
2. All TypeScript files are valid (`npm run lint`)
3. Node version >= 18.0.0

### Issue: Tests Fail
**Debug**:
```bash
npm test -- --verbose
npm test -- --no-coverage  # Run without coverage
```

### Issue: Frontend Not Loading
**Check**:
1. Build completed: `npm run build:client`
2. Static files in `dist/client/`
3. Server serving static files correctly

---

## Tips for AI Assistants

### When Making Changes

1. **Always read files first**: Never propose changes without reading the current code
2. **Check existing patterns**: Follow the established code style and patterns
3. **Validate TypeScript**: Ensure changes compile (`npm run lint`)
4. **Run tests**: Run affected tests after changes
5. **Update documentation**: Update comments and docs if behavior changes

### Best Practices

1. **Don't over-engineer**: Keep solutions simple and focused
2. **Security first**: Always validate user input, sanitize paths
3. **Test thoroughly**: Add tests for new features
4. **Error handling**: Always handle errors gracefully
5. **TypeScript strict**: Leverage TypeScript's type system fully

### Code Modification Workflow

```bash
# 1. Read the file(s) you'll modify
# 2. Make changes
# 3. Type check
npm run lint

# 4. Run tests
npm test

# 5. Format code
npm run format

# 6. Test manually (if needed)
npm run dev
```

### Common Gotchas

1. **ES Modules**: Use `.js` extensions in imports (even for .ts files)
   ```typescript
   import { foo } from './utils.js';  // Correct
   import { foo } from './utils';     // Wrong
   ```

2. **Async File Operations**: Always use async/await for file I/O
   ```typescript
   const data = await fs.readFile(path, 'utf-8');  // Correct
   const data = fs.readFileSync(path, 'utf-8');    // Avoid
   ```

3. **Platform Paths**: Always use `paths.ts` utilities, never hardcode paths
   ```typescript
   const configPath = getConfigFilePath();  // Correct
   const configPath = '~/.config/...';      // Wrong
   ```

4. **React State Updates**: Use functional updates for state derived from previous state
   ```typescript
   setConfig(prev => ({ ...prev, newField: value }));  // Correct
   setConfig({ ...config, newField: value });          // May have stale data
   ```

---

## Git Workflow

### Branch Strategy
- **Main branch**: Stable, production-ready code
- **Feature branches**: `claude/feature-name-<session-id>`
- **Development branches**: As specified in task instructions

### Commit Guidelines
- Use clear, descriptive commit messages
- Focus on "why" rather than "what"
- Reference issues if applicable
- Follow existing commit message style (check `git log`)

### Git Commands
```bash
# Check status
git status

# Stage changes
git add <files>

# Commit
git commit -m "descriptive message"

# Push to branch
git push -u origin <branch-name>
```

---

## Additional Resources

### Documentation Files
- `README.md`: User-facing documentation
- `SPEC.md`: Technical specification (Japanese)
- `IMPLEMENTATION_PLAN.md`: Implementation roadmap
- `CHANGELOG.md`: Version history

### External Links
- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express Documentation](https://expressjs.com)

---

## Versioning and Releases

### Current Version
Check `package.json` for current version (currently `0.1.0`)

### Semantic Versioning
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### Release Process
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full build and tests
4. Tag release in git
5. Publish to npm (if applicable)

---

## Quick Reference

### File Paths
- Config file: Platform-dependent (see Configuration Management section)
- Server entry: `src/server/index.ts`
- Client entry: `src/client/src/main.tsx`
- CLI entry: `bin/cli.js`

### Ports
- Production server: 3000 (default, configurable)
- Dev client (Vite): 5173
- Dev server: 3000

### Key Commands
```bash
npm run dev         # Development mode
npm run build       # Production build
npm test            # Run tests
npm run lint        # Type check
npm start           # Start production server
npx mcp-setting     # Run CLI (after build)
```

---

**Last Updated**: Based on repository state as of latest commit
**For Questions**: Check existing code patterns and tests for examples
