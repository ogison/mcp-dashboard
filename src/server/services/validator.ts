import type { MCPConfig, MCPServer, ValidationResult } from "../types/index.js";

export class Validator {
  validateMCPConfig(config: MCPConfig): ValidationResult {
    const errors: string[] = [];

    if (!config) {
      errors.push("Config is null or undefined");
      return { valid: false, errors };
    }

    if (!config.mcpServers) {
      errors.push("mcpServers field is required");
      return { valid: false, errors };
    }

    if (typeof config.mcpServers !== "object") {
      errors.push("mcpServers must be an object");
      return { valid: false, errors };
    }

    for (const [serverName, serverConfig] of Object.entries(
      config.mcpServers,
    )) {
      const serverErrors = this.validateServerConfig(serverConfig, serverName);
      errors.push(...serverErrors.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateServerConfig(
    server: MCPServer,
    serverName?: string,
  ): ValidationResult {
    const errors: string[] = [];
    const prefix = serverName ? `Server "${serverName}": ` : "";

    if (!server) {
      errors.push(`${prefix}Server config is null or undefined`);
      return { valid: false, errors };
    }

    if (
      !server.command ||
      typeof server.command !== "string" ||
      server.command.trim() === ""
    ) {
      errors.push(
        `${prefix}Command is required and must be a non-empty string`,
      );
    }

    if (server.args !== undefined) {
      if (!Array.isArray(server.args)) {
        errors.push(`${prefix}Args must be an array`);
      } else {
        server.args.forEach((arg, index) => {
          if (typeof arg !== "string") {
            errors.push(`${prefix}Arg at index ${index} must be a string`);
          }
        });
      }
    }

    if (server.env !== undefined) {
      const envResult = this.validateEnvVars(server.env, serverName);
      errors.push(...envResult.errors);
    }

    if (server.disabled !== undefined && typeof server.disabled !== "boolean") {
      errors.push(`${prefix}Disabled must be a boolean`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateCommand(command: string): boolean {
    if (!command || typeof command !== "string") {
      return false;
    }

    const trimmed = command.trim();
    if (trimmed === "") {
      return false;
    }

    const dangerousPatterns = [/[;&|`$()]/, /\.\./, /~\//];

    return !dangerousPatterns.some((pattern) => pattern.test(trimmed));
  }

  validateEnvVars(
    env: Record<string, string>,
    serverName?: string,
  ): ValidationResult {
    const errors: string[] = [];
    const prefix = serverName ? `Server "${serverName}": ` : "";

    if (typeof env !== "object" || env === null) {
      errors.push(`${prefix}Environment variables must be an object`);
      return { valid: false, errors };
    }

    for (const [key, value] of Object.entries(env)) {
      if (typeof key !== "string" || key.trim() === "") {
        errors.push(
          `${prefix}Environment variable key must be a non-empty string`,
        );
      }

      if (typeof value !== "string") {
        errors.push(
          `${prefix}Environment variable "${key}" value must be a string`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
