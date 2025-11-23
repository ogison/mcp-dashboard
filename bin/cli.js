#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { startServer } from '../dist/server/index.js';

const program = new Command();

program
  .name('mcp-setting')
  .description('GUI tool for managing Claude Code MCP settings')
  .version('0.1.0')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    const port = parseInt(options.port, 10);

    if (isNaN(port) || port < 1024 || port > 65535) {
      console.error(chalk.red('Error: Port must be a number between 1024 and 65535'));
      process.exit(1);
    }

    try {
      console.log(chalk.blue('Starting MCP Setting Tool...'));

      await startServer(port);

      console.log(chalk.green('✓ MCP Setting Tool started successfully!'));
      console.log(chalk.blue(`✓ Server running at http://localhost:${port}`));
      console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));

      if (options.open) {
        try {
          await open(`http://localhost:${port}`);
          console.log(chalk.green('✓ Browser opened'));
        } catch (error) {
          console.warn(chalk.yellow('Warning: Could not open browser automatically'));
          console.log(chalk.gray(`Please open http://localhost:${port} manually`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to start server:'), error.message);
      process.exit(1);
    }
  });

program.parse();
