# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-11-23

### Added
- Initial release of MCP Setting Tool
- Web-based GUI for managing Claude Code MCP settings
- Complete CRUD operations for MCP servers
- Built-in preset templates for popular MCP servers:
  - Filesystem MCP
  - Git MCP
  - GitHub MCP
  - Brave Search MCP
  - PostgreSQL MCP
  - SQLite MCP
  - Puppeteer MCP
  - Slack MCP
- Import/Export configuration functionality
- Automatic backup before saving changes
- Real-time configuration validation
- Enable/Disable toggle for individual servers
- Cross-platform support (macOS, Windows, Linux)
- CLI with customizable port and browser launch options
- Comprehensive backend with Express server
- React-based frontend with TailwindCSS
- TypeScript support throughout the codebase
- Unit tests for core services (ConfigManager, Validator)
- Automatic config file detection for all platforms

### Features
- **Easy Configuration**: Intuitive web interface for managing MCP servers
- **Preset Support**: Quick setup with 8+ pre-configured templates
- **Live Editing**: Real-time add, edit, delete operations
- **Validation**: Built-in validation to ensure configuration correctness
- **Auto Backup**: Automatic backup before any changes
- **Security**: Input validation and path safety checks

### Technical
- Backend: Node.js, Express, TypeScript
- Frontend: React 19, Vite, TailwindCSS
- Testing: Jest with ts-jest
- Build: TypeScript compiler, Vite bundler
- Package: npm with CLI support via npx

[unreleased]: https://github.com/yourusername/mcp-setting/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/mcp-setting/releases/tag/v0.1.0
