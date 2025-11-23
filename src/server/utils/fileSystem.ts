import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";

/**
 * Validates that a file path is safe and doesn't contain path traversal attempts
 * @param filePath - The file path to validate
 * @throws Error if the path contains suspicious patterns
 */
function validateFilePath(filePath: string): void {
  // Ensure the path doesn't contain null bytes
  if (filePath.includes("\0")) {
    throw new Error("Invalid file path: null byte detected");
  }

  // Normalize the path to resolve any .. or . segments
  const normalizedPath = path.normalize(filePath);
  const resolvedPath = path.resolve(normalizedPath);

  // Check for path traversal attempts in normalized path
  if (normalizedPath.includes("..")) {
    throw new Error("Invalid file path: path traversal detected");
  }

  // Verify the resolved path is within allowed directories
  const homeDir = os.homedir();
  const cwd = process.cwd();

  // Allow paths within home directory or current working directory
  const isInHomeDir = resolvedPath.startsWith(homeDir);
  const isInCwd = resolvedPath.startsWith(cwd);

  if (!isInHomeDir && !isInCwd) {
    throw new Error(
      "Invalid file path: must be within home or working directory",
    );
  }
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  validateFilePath(dirPath);
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function fileExistsSync(filePath: string): boolean {
  return existsSync(filePath);
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  validateFilePath(filePath);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Validates data before writing to file system
 * @param data - Data to validate
 * @throws Error if data is invalid or potentially malicious
 */
function validateWriteData<T>(data: T): void {
  // Ensure data is not null or undefined
  if (data === null || data === undefined) {
    throw new Error("Invalid data: cannot write null or undefined");
  }

  // Serialize to check for valid JSON and measure size
  const content = JSON.stringify(data, null, 2);

  // Limit file size to 10MB to prevent DoS
  const maxSize = 10 * 1024 * 1024;
  if (Buffer.byteLength(content, "utf-8") > maxSize) {
    throw new Error("Invalid data: exceeds maximum file size (10MB)");
  }

  // Check for potentially dangerous patterns
  // This helps prevent injection attacks through config files
  if (typeof content === "string") {
    const dangerousPatterns = [
      /\x00/g, // Null bytes
      /<script/gi, // Script tags
      /javascript:/gi, // JavaScript protocol
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        throw new Error("Invalid data: contains potentially dangerous content");
      }
    }
  }
}

export async function writeJsonFile<T>(
  filePath: string,
  data: T,
): Promise<void> {
  validateFilePath(filePath);
  validateWriteData(data);

  const dirPath = path.dirname(filePath);
  await ensureDirectory(dirPath);

  // Sanitize data before writing to prevent injection attacks
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, "utf-8");
}

export async function copyFile(
  source: string,
  destination: string,
): Promise<void> {
  validateFilePath(source);
  validateFilePath(destination);
  await fs.copyFile(source, destination);
}

export async function deleteFile(filePath: string): Promise<void> {
  validateFilePath(filePath);
  await fs.unlink(filePath);
}

export async function listFiles(dirPath: string): Promise<string[]> {
  validateFilePath(dirPath);
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch {
    return [];
  }
}
