/**
 * AI Context Provider
 *
 * Provides shared AI configuration (feature flags, global AI state) to all
 * AI components in the application tree.  The provider is intentionally
 * lightweight — it reads from `aiConfig` and `featureFlags` once at mount
 * time and exposes them via context so that every AI component can check
 * feature availability without importing the config module directly.
 *
 * Usage:
 * ```tsx
 * // Wrap your app (or a subtree) with AiProvider:
 * <AiProvider>
 *   <App />
 * </AiProvider>
 *
 * // Consume in any child component:
 * const { isAiEnabled, features } = useAiContext();
 * ```
 *
 * @see Requirements 12 (State Management — context provider)
 * @see Requirements 18 (Environment Configuration and Feature Flags)
 * @module context/AiContext
 */

import React, { createContext, useContext, useMemo } from 'react';
import { aiConfig, featureFlags } from '@/services/ai/config';
import type { AiFeatureFlags } from '@/services/ai/config';

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

/**
 * The value exposed by AiContext to all consumers.
 *
 * The context is intentionally minimal — it surfaces the global AI toggle,
 * the streaming toggle, and the granular feature flags.  Individual
 * components that need richer state (conversation history, generated
 * assignments, etc.) should use the dedicated hooks directly
 * (useAiConversation, useAssignmentGeneration, …).
 */
export interface AiContextValue {
  /**
   * Master AI toggle.  When `false` all AI UI should be hidden and no AI
   * API calls should be made.
   */
  isAiEnabled: boolean;

  /**
   * Whether Server-Sent Events streaming is enabled.
   * When `false` components should fall back to non-streaming requests.
   */
  isStreamingEnabled: boolean;

  /**
   * Granular feature flags for each AI capability.
   * Each flag is already gated by the master `isAiEnabled` toggle.
   */
  features: AiFeatureFlags;
}

// ---------------------------------------------------------------------------
// Context creation
// ---------------------------------------------------------------------------

/**
 * The React context object.
 * Initialised to `null` so that `useAiContext` can detect missing providers.
 */
const AiContext = createContext<AiContextValue | null>(null);

AiContext.displayName = 'AiContext';

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

export interface AiProviderProps {
  children: React.ReactNode;
}

/**
 * AiProvider
 *
 * Wraps a subtree and makes AI configuration available to all descendants
 * via `useAiContext()`.  Place this high in the component tree — typically
 * inside `App.tsx` alongside the other global providers.
 *
 * The provider reads `aiConfig` and `featureFlags` once and memoises the
 * context value so that it never triggers unnecessary re-renders.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AiProvider>
 *       <RouterProvider router={router} />
 *     </AiProvider>
 *   );
 * }
 * ```
 */
export function AiProvider({ children }: AiProviderProps): JSX.Element {
  /**
   * Memoised context value.
   * `aiConfig` and `featureFlags` are module-level singletons that never
   * change at runtime, so the dependency array is intentionally empty —
   * the value is computed once and reused for the lifetime of the provider.
   */
  const value = useMemo<AiContextValue>(
    () => ({
      isAiEnabled: aiConfig.enabled,
      isStreamingEnabled: aiConfig.streamingEnabled,
      features: featureFlags,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * useAiContext
 *
 * Returns the current `AiContextValue`.
 *
 * @throws {Error} When called outside of an `<AiProvider>` tree.
 *
 * @example
 * ```tsx
 * function MyAiComponent() {
 *   const { isAiEnabled, features } = useAiContext();
 *
 *   if (!isAiEnabled || !features.aiQA) return null;
 *
 *   return <AskAiComponent courseId={courseId} lessonId={lessonId} />;
 * }
 * ```
 */
export function useAiContext(): AiContextValue {
  const context = useContext(AiContext);

  if (context === null) {
    throw new Error(
      'useAiContext must be used within an <AiProvider>. ' +
        'Make sure <AiProvider> wraps the component tree that uses AI features.'
    );
  }

  return context;
}

// ---------------------------------------------------------------------------
// Default export (the context object itself, for advanced use-cases)
// ---------------------------------------------------------------------------

export default AiContext;
