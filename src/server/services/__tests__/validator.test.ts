import { Validator } from "../validator.js";
import type { MCPConfig, MCPServer } from "../../types/index.js";

describe("Validator", () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe("validateMCPConfig", () => {
    test("should validate a valid config", () => {
      const config: MCPConfig = {
        mcpServers: {
          "test-server": {
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem"],
          },
        },
      };

      const result = validator.validateMCPConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject null config", () => {
      const result = validator.validateMCPConfig(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Config is null or undefined");
    });

    test("should reject config without mcpServers", () => {
      const config = {} as MCPConfig;
      const result = validator.validateMCPConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("mcpServers field is required");
    });

    test("should reject config with non-object mcpServers", () => {
      const config = { mcpServers: "invalid" } as any;
      const result = validator.validateMCPConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("mcpServers must be an object");
    });

    test("should validate config with empty mcpServers", () => {
      const config: MCPConfig = { mcpServers: {} };
      const result = validator.validateMCPConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should validate config with disabled server", () => {
      const config: MCPConfig = {
        mcpServers: {
          "disabled-server": {
            command: "npx",
            args: ["-y", "test"],
            disabled: true,
          },
        },
      };

      const result = validator.validateMCPConfig(config);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateServerConfig", () => {
    test("should validate a valid server config", () => {
      const server: MCPServer = {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem"],
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject server with empty command", () => {
      const server: MCPServer = {
        command: "",
        args: [],
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Command is required"))).toBe(
        true,
      );
    });

    test("should reject server with whitespace-only command", () => {
      const server: MCPServer = {
        command: "   ",
        args: [],
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(false);
    });

    test("should reject server with non-string args", () => {
      const server: MCPServer = {
        command: "npx",
        args: ["valid", 123 as any, "valid"],
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be a string"))).toBe(
        true,
      );
    });

    test("should reject server with non-array args", () => {
      const server: MCPServer = {
        command: "npx",
        args: "invalid" as any,
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be an array"))).toBe(
        true,
      );
    });

    test("should validate server with env vars", () => {
      const server: MCPServer = {
        command: "npx",
        args: ["-y", "test"],
        env: {
          API_KEY: "test-key",
          DEBUG: "true",
        },
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(true);
    });

    test("should reject server with invalid disabled field", () => {
      const server: MCPServer = {
        command: "npx",
        args: [],
        disabled: "yes" as any,
      };

      const result = validator.validateServerConfig(server);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("Disabled must be a boolean")),
      ).toBe(true);
    });

    test("should include server name in error messages", () => {
      const server: MCPServer = {
        command: "",
        args: [],
      };

      const result = validator.validateServerConfig(server, "my-server");
      expect(result.errors.some((e) => e.includes("my-server"))).toBe(true);
    });
  });

  describe("validateCommand", () => {
    test("should validate valid commands", () => {
      expect(validator.validateCommand("npx")).toBe(true);
      expect(validator.validateCommand("node")).toBe(true);
      expect(validator.validateCommand("/usr/bin/python3")).toBe(true);
    });

    test("should reject empty or whitespace commands", () => {
      expect(validator.validateCommand("")).toBe(false);
      expect(validator.validateCommand("   ")).toBe(false);
    });

    test("should reject null or undefined", () => {
      expect(validator.validateCommand(null as any)).toBe(false);
      expect(validator.validateCommand(undefined as any)).toBe(false);
    });

    test("should reject commands with dangerous patterns", () => {
      expect(validator.validateCommand("command; rm -rf /")).toBe(false);
      expect(validator.validateCommand("command && malicious")).toBe(false);
      expect(validator.validateCommand("command | grep")).toBe(false);
      expect(validator.validateCommand("command `whoami`")).toBe(false);
      expect(validator.validateCommand("$(malicious)")).toBe(false);
      expect(validator.validateCommand("../../../etc/passwd")).toBe(false);
      expect(validator.validateCommand("~/sensitive")).toBe(false);
    });
  });

  describe("validateEnvVars", () => {
    test("should validate valid env vars", () => {
      const env = {
        API_KEY: "test-key",
        PORT: "3000",
        DEBUG: "true",
      };

      const result = validator.validateEnvVars(env);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should validate empty env vars", () => {
      const result = validator.validateEnvVars({});
      expect(result.valid).toBe(true);
    });

    test("should reject null env vars", () => {
      const result = validator.validateEnvVars(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be an object"))).toBe(
        true,
      );
    });

    test("should reject env vars with non-string values", () => {
      const env = {
        API_KEY: "valid",
        PORT: 3000 as any,
      };

      const result = validator.validateEnvVars(env);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be a string"))).toBe(
        true,
      );
    });

    test("should reject env vars with empty keys", () => {
      const env = {
        "": "value",
      };

      const result = validator.validateEnvVars(env);
      expect(result.valid).toBe(false);
    });

    test("should include server name in error messages", () => {
      const result = validator.validateEnvVars(null as any, "test-server");
      expect(result.errors.some((e) => e.includes("test-server"))).toBe(true);
    });
  });
});
