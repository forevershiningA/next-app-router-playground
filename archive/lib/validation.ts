// lib/validation.ts

/**
 * Sanitizes a string to be safe for use in file paths
 * Removes any characters that could cause path traversal or other security issues
 */
export function sanitizeFilePath(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Validates and sanitizes an addition ID
 */
export function validateAdditionId(id: string): string {
  const sanitized = sanitizeFilePath(id);
  if (!sanitized) {
    throw new Error('Invalid addition ID: ID cannot be empty');
  }
  return sanitized;
}

/**
 * Validates XML content for basic security checks
 */
export function validateXMLContent(xmlText: string): void {
  // Check for XXE (XML External Entity) attacks
  if (xmlText.includes('<!ENTITY')) {
    throw new Error('Invalid XML: External entities are not allowed');
  }
  
  // Check for DOCTYPE declarations that could be malicious
  if (xmlText.includes('<!DOCTYPE') && xmlText.includes('SYSTEM')) {
    throw new Error('Invalid XML: System DOCTYPE declarations are not allowed');
  }
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Safely parses a number from a string, returning default if invalid
 */
export function safeParseInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parses a float from a string, returning default if invalid
 */
export function safeParseFloat(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
