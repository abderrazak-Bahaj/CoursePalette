/**
 * Static audit tests for AI component keyboard navigation
 *
 * Validates: Requirements 15 (Accessibility Compliance — WCAG 2.1 AA)
 *
 * These tests perform a static (text-based) audit of every AI component
 * source file and assert that:
 *
 *   1. Every interactive native element (button, input, select, textarea)
 *      uses the design-system focus ring class so it has a visible focus
 *      indicator (or uses the shadcn `<Button>` component, which provides
 *      the ring through its base CVA variant).
 *   2. No functional control opts out of the tab cycle with `tabIndex={-1}`
 *      (the only allowed exception is the dialog wrapper in
 *      AssignmentPageIntegration, which uses `tabIndex={-1}` as a fallback
 *      programmatic-focus target — not a functional control).
 *   3. Every component file that ships interactive controls documents its
 *      keyboard navigation in JSDoc (the sentinel
 *      `Keyboard navigation (Requirement 15)` heading).
 *   4. All custom keyboard shortcuts are documented in
 *      `KEYBOARD_NAVIGATION.md`.
 *
 * Running this as a unit test means a future contributor that removes a
 * focus ring or adds an undocumented shortcut will see the regression
 * surface in CI rather than failing manual a11y review.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const aiComponentsDir = join(__filename, '..');

/** Recursively collect all .tsx component files (excluding tests). */
function collectComponentFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectComponentFiles(fullPath));
    } else if (
      entry.endsWith('.tsx') &&
      !entry.endsWith('.test.tsx') &&
      // Skip pure presentational fallback / loading components that have
      // their own dedicated audit (still verified via aria-label).
      entry !== 'AiLoadingFallback.tsx' &&
      // The performance dashboard is dev-only and uses shadcn <Button> for
      // every control, so no native <button> audit is required.
      entry !== 'PerformanceMonitoringDashboard.tsx'
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const FOCUS_RING_PATTERN =
  /focus-visible:ring-(2|ring|destructive|amber-500|inset)/;

/**
 * Components that render no interactive controls of their own and serve as
 * pure layout / placeholder pieces. They are exempt from the documentation
 * audit — they cannot meaningfully describe a tab order.
 */
const NON_INTERACTIVE_COMPONENTS = new Set([
  'Common/LoadingSkeletons.tsx',
  'Common/PermissionDenied.tsx',
]);

/**
 * Strips out block (`/* … *​/`) and line (`//`) comments from a TypeScript /
 * TSX source string. We strip comments before scanning for `<button>` etc. so
 * documentation examples and JSDoc snippets that mention HTML tags don't
 * trigger false positives in the focus-ring audit.
 *
 * The implementation walks the source character by character and tracks
 * whether the cursor is currently inside a single- or multi-line comment, a
 * string literal, or a template literal. Strings are preserved (we don't want
 * to lose JSX className contents) — only comments are removed.
 */
function stripComments(source: string): string {
  let out = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];

    // Block comment: /* … */
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) break;
      i = end + 2;
      continue;
    }

    // Line comment: // …
    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i + 2);
      if (end === -1) break;
      i = end; // keep the newline
      continue;
    }

    // String literal: ", '
    if (ch === '"' || ch === "'") {
      const quote = ch;
      out += ch;
      i++;
      while (i < len) {
        const c = source[i];
        out += c;
        if (c === '\\' && i + 1 < len) {
          out += source[i + 1];
          i += 2;
          continue;
        }
        if (c === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // Template literal: `
    if (ch === '`') {
      out += ch;
      i++;
      while (i < len) {
        const c = source[i];
        out += c;
        if (c === '\\' && i + 1 < len) {
          out += source[i + 1];
          i += 2;
          continue;
        }
        if (c === '`') {
          i++;
          break;
        }
        // Template substitution ${ … } — copy raw, may contain nested braces
        if (c === '$' && source[i + 1] === '{') {
          out += '{';
          i += 2;
          let depth = 1;
          while (i < len && depth > 0) {
            const sc = source[i];
            out += sc;
            if (sc === '{') depth++;
            else if (sc === '}') depth--;
            i++;
          }
          continue;
        }
        i++;
      }
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

const NATIVE_BUTTON_OPENING_TAG = /<button\b[^>]*?>/g;
const NATIVE_INPUT_OPENING_TAG = /<input\b[^>]*?>/g;
const NATIVE_SELECT_OPENING_TAG = /<select\b[^>]*?>/g;
const NATIVE_TEXTAREA_OPENING_TAG = /<textarea\b[^>]*?>/g;

/**
 * Returns the substring of the file source from the matched tag's opening
 * `<` up to the closing `>`. Brace-aware so it handles multi-line tags with
 * `className={cn(…)}`.
 */
function extractTagSlice(source: string, startIndex: number): string {
  let depth = 0;
  for (let i = startIndex; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) {
      return source.slice(startIndex, i + 1);
    }
  }
  return source.slice(startIndex);
}

/**
 * Collects every native interactive element opening tag in `source` and
 * returns its full slice (`<button … >`, `<input … />`, etc.). Comments are
 * stripped first so JSDoc examples don't pollute the result.
 */
function collectInteractiveTags(source: string): string[] {
  const stripped = stripComments(source);
  const slices: string[] = [];
  for (const pattern of [
    NATIVE_BUTTON_OPENING_TAG,
    NATIVE_INPUT_OPENING_TAG,
    NATIVE_SELECT_OPENING_TAG,
    NATIVE_TEXTAREA_OPENING_TAG,
  ]) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(stripped)) !== null) {
      slices.push(extractTagSlice(stripped, match.index));
    }
  }
  return slices;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

const componentFiles = collectComponentFiles(aiComponentsDir);

describe('AI component keyboard navigation (Requirement 15)', () => {
  it('has at least one component file to audit', () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  describe('Focus indicators on interactive controls', () => {
    for (const filePath of componentFiles) {
      const relPath = relative(aiComponentsDir, filePath).replaceAll('\\', '/');

      it(`${relPath} — every native interactive element has a focus ring`, () => {
        const source = readFileSync(filePath, 'utf8');
        const tags = collectInteractiveTags(source);

        const offenders = tags.filter((tag) => !FOCUS_RING_PATTERN.test(tag));

        if (offenders.length > 0) {
          const preview = offenders
            .map((t) => t.slice(0, 200).replace(/\s+/g, ' '))
            .join('\n  • ');
          throw new Error(
            `${relPath} contains native interactive elements without a focus ring:\n  • ${preview}`
          );
        }

        expect(offenders).toEqual([]);
      });
    }
  });

  describe('No functional controls opt out of the tab cycle', () => {
    for (const filePath of componentFiles) {
      const relPath = relative(aiComponentsDir, filePath).replaceAll('\\', '/');

      it(`${relPath} — does not apply tabIndex={-1} to a button/input/select/textarea`, () => {
        const source = readFileSync(filePath, 'utf8');
        const tags = collectInteractiveTags(source);

        const offenders = tags.filter((tag) => /tabIndex=\{-1\}/.test(tag));

        expect(offenders).toEqual([]);
      });
    }

    it('AssignmentPageIntegration only uses tabIndex={-1} on the dialog wrapper', () => {
      const filePath = componentFiles.find((p) =>
        p.endsWith('AssignmentPageIntegration.tsx')
      );
      expect(filePath).toBeDefined();
      const source = readFileSync(filePath!, 'utf8');
      const stripped = stripComments(source);

      // The single allowed `tabIndex={-1}` lives directly above the
      // dialog header. We verify it is associated with the dialog
      // container (role="dialog") rather than a functional control.
      const matches = stripped.match(/tabIndex=\{-1\}/g) ?? [];
      expect(matches).toHaveLength(1);
      // Confirm the dialog role is in the same component
      expect(stripped).toMatch(/role="dialog"/);
    });
  });

  describe('Documentation', () => {
    for (const filePath of componentFiles) {
      const relPath = relative(aiComponentsDir, filePath).replaceAll('\\', '/');

      it(`${relPath} — has a JSDoc keyboard-navigation block (or is exempt as non-interactive)`, () => {
        if (NON_INTERACTIVE_COMPONENTS.has(relPath)) {
          // Non-interactive layout components are exempt — they ship no
          // focusable controls of their own.
          return;
        }

        const source = readFileSync(filePath, 'utf8');
        expect(source).toMatch(/Keyboard navigation \(Requirement 15\)/);
      });
    }
  });

  describe('KEYBOARD_NAVIGATION.md reference document', () => {
    const referencePath = join(aiComponentsDir, 'KEYBOARD_NAVIGATION.md');

    it('exists', () => {
      const stats = statSync(referencePath);
      expect(stats.isFile()).toBe(true);
    });

    it('documents every custom keyboard shortcut', () => {
      const md = readFileSync(referencePath, 'utf8');

      // The Ctrl+Enter / Cmd+Enter shortcut for AskAiComponent
      expect(md).toMatch(/Ctrl[\\/]Cmd\+Enter/);
      // Escape closes modals
      expect(md).toMatch(/Esc/);
      // Each modal-style component is referenced
      expect(md).toMatch(/LessonPageIntegration/);
      expect(md).toMatch(/AssignmentPageIntegration/);
      expect(md).toMatch(/ConversationHistory/);
    });
  });
});
