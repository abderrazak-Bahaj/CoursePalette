/**
 * AI Integration Configuration and Feature Flags
 *
 * Reads environment variables (VITE_ prefix for Vite) and exposes
 * typed configuration values and feature flags for all AI features.
 *
 * Validates required/critical variables at module load time and throws
 * a descriptive error if anything is missing or invalid.
 *
 * @module services/ai/config
 */

// ---------------------------------------------------------------------------
// Raw environment variable helpers
// ---------------------------------------------------------------------------

/**
 * Read a string env var, returning `undefined` when the variable is absent
 * or an empty string.
 */
function readString(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

/**
 * Read a boolean env var.
 * Accepts "true" / "1" as truthy, everything else (including absence) as falsy.
 * When the variable is absent the `defaultValue` is returned.
 */
function readBoolean(key: string, defaultValue: boolean): boolean {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  return raw === 'true' || raw === '1';
}

/**
 * Read a positive-integer env var.
 * Returns `defaultValue` when the variable is absent.
 * Throws a `ConfigurationError` when the value is present but not a valid
 * positive integer.
 */
function readPositiveInt(key: string, defaultValue: number): number {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ConfigurationError(
      `Environment variable "${key}" must be a positive integer, got: "${raw}"`
    );
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// ConfigurationError
// ---------------------------------------------------------------------------

/**
 * Thrown when the AI configuration is invalid or required variables are
 * missing.
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(`[AI Config] ${message}`);
    this.name = 'ConfigurationError';
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Feature flags controlling which AI capabilities are active. */
export interface AiFeatureFlags {
  /** Student Q&A feature (ask questions about lesson content). */
  aiQA: boolean;
  /** Teacher assignment generation feature. */
  aiGeneration: boolean;
  /** Teacher question enhancement feature. */
  aiEnhancement: boolean;
  /** Teacher pre-grading feature. */
  aiPreGrading: boolean;
  /** Admin AI usage statistics feature. */
  aiStatistics: boolean;
}

/** Full AI integration configuration object. */
export interface AiConfig {
  /**
   * Base URL for the AI backend API.
   * Defaults to `http://localhost:8000/api`.
   */
  apiBaseUrl: string;

  /**
   * Master switch – when `false` all AI UI components should be hidden and
   * no AI API calls should be made.
   * Defaults to `true`.
   */
  enabled: boolean;

  /**
   * When `true` the client uses Server-Sent Events (SSE) for streaming
   * responses.  When `false` it falls back to a regular non-streaming
   * request.
   * Defaults to `true`.
   */
  streamingEnabled: boolean;

  /**
   * Request timeout in milliseconds.
   * Defaults to `30000` (30 s).
   */
  timeoutMs: number;

  /** Granular feature flags for individual AI capabilities. */
  features: AiFeatureFlags;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a fully-constructed `AiConfig` object and throws a
 * `ConfigurationError` if any value is out of range or logically
 * inconsistent.
 */
function validateConfig(config: AiConfig): void {
  // Validate apiBaseUrl is a plausible URL
  try {
    new URL(config.apiBaseUrl);
  } catch {
    throw new ConfigurationError(
      `VITE_AI_API_BASE_URL is not a valid URL: "${config.apiBaseUrl}"`
    );
  }

  // Validate timeout is a reasonable value (100 ms – 5 min)
  if (config.timeoutMs < 100 || config.timeoutMs > 300_000) {
    throw new ConfigurationError(
      `VITE_AI_TIMEOUT_MS must be between 100 and 300000, got: ${config.timeoutMs}`
    );
  }
}

// ---------------------------------------------------------------------------
// Config factory
// ---------------------------------------------------------------------------

/**
 * Builds and validates the AI configuration from environment variables.
 *
 * Called once at module load time; the result is exported as `aiConfig`.
 */
function buildConfig(): AiConfig {
  const apiBaseUrl =
    readString('VITE_AI_API_BASE_URL') ??
    readString('VITE_API_BASE_URL') ??
    'http://localhost:8000/api';

  const enabled = readBoolean('VITE_AI_ENABLED', true);
  const streamingEnabled = readBoolean('VITE_AI_STREAMING_ENABLED', true);
  const timeoutMs = readPositiveInt('VITE_AI_TIMEOUT_MS', 30_000);

  // Individual feature flags – each defaults to the master `enabled` flag so
  // that setting VITE_AI_ENABLED=false disables everything at once, while
  // individual flags can still be used to selectively disable a feature.
  const features: AiFeatureFlags = {
    aiQA: enabled && readBoolean('VITE_AI_FEATURE_QA', true),
    aiGeneration: enabled && readBoolean('VITE_AI_FEATURE_GENERATION', true),
    aiEnhancement: enabled && readBoolean('VITE_AI_FEATURE_ENHANCEMENT', true),
    aiPreGrading: enabled && readBoolean('VITE_AI_FEATURE_PRE_GRADING', true),
    aiStatistics: enabled && readBoolean('VITE_AI_FEATURE_STATISTICS', true),
  };

  const config: AiConfig = {
    apiBaseUrl,
    enabled,
    streamingEnabled,
    timeoutMs,
    features,
  };

  validateConfig(config);

  return config;
}

// ---------------------------------------------------------------------------
// Exported singleton
// ---------------------------------------------------------------------------

/**
 * The validated AI configuration singleton.
 *
 * Import this wherever you need to read AI settings:
 *
 * ```ts
 * import { aiConfig } from '@/services/ai/config';
 *
 * if (aiConfig.enabled) { ... }
 * if (aiConfig.features.aiQA) { ... }
 * ```
 */
export const aiConfig: AiConfig = buildConfig();

/**
 * Convenience re-export of the feature flags for components that only need
 * to check feature availability.
 *
 * ```ts
 * import { aiFeatures } from '@/services/ai/config';
 *
 * if (aiFeatures.aiGeneration) { ... }
 * ```
 */
export const aiFeatures: AiFeatureFlags = aiConfig.features;

/**
 * Alias for `aiFeatures` — exported as `featureFlags` for consistency with
 * the design document naming convention.
 *
 * ```ts
 * import { featureFlags } from '@/services/ai/config';
 *
 * if (featureFlags.aiQA) { ... }
 * ```
 */
export const featureFlags: AiFeatureFlags = aiConfig.features;
