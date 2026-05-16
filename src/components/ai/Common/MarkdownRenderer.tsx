/**
 * MarkdownRenderer component
 *
 * Renders markdown content with:
 * - GitHub Flavored Markdown (remark-gfm)
 * - HTML sanitization to prevent XSS (rehype-sanitize)
 * - Syntax highlighting for code blocks (react-syntax-highlighter)
 * - Accessible semantic HTML
 * - Debounced re-renders when streaming (via shared useDebounce utility)
 *
 * Keyboard navigation (Requirement 15):
 * - This component renders no interactive controls of its own. Anchor (`<a>`)
 *   elements emitted by the markdown pipeline are the only focusable
 *   elements; they receive the design-system focus ring
 *   (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
 *   focus-visible:ring-offset-1`) and external links open in a new tab via
 *   `target="_blank" rel="noopener noreferrer"`.
 * - The component preserves natural tab order — links inside markdown
 *   appear in document order between any surrounding controls.
 * - No `tabIndex` overrides are applied.
 * - No custom keyboard shortcuts are defined.
 *
 * @see Requirements 17
 * @see Requirements 22 (Performance Optimization – Debouncing)
 * @see Requirements 15 (Accessibility Compliance)
 */

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { MarkdownRendererProps } from '../../../services/ai/types';
import { useDebounce } from '../../../utils/ai/debounce';

// ---------------------------------------------------------------------------
// Custom markdown component renderers
// ---------------------------------------------------------------------------

/**
 * Builds the `components` map passed to ReactMarkdown.
 * Each renderer applies Tailwind CSS classes for consistent styling.
 */
function buildComponents(): Components {
  return {
    // Headings
    h1: ({ children }) => (
      <h1 className="mb-4 mt-6 text-2xl font-bold leading-tight text-foreground first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-5 text-xl font-semibold leading-tight text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-3 text-base font-semibold text-foreground first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-1 mt-2 text-sm font-semibold text-foreground first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-1 mt-2 text-xs font-semibold text-muted-foreground first:mt-0">
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p className="mb-3 leading-relaxed text-foreground last:mb-0">
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="mb-3 list-disc space-y-1 pl-6 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 list-decimal space-y-1 pl-6 text-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    // Emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground">{children}</em>
    ),

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className="my-4 border-border" />,

    // Links — open external links in a new tab
    a: ({ href, children }) => {
      const isExternal =
        href != null &&
        (href.startsWith('http://') || href.startsWith('https://'));
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          {children}
        </a>
      );
    },

    // Inline code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className ?? '');
      const language = match ? match[1] : undefined;
      const isBlock = Boolean(language);

      if (isBlock) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="my-3 overflow-x-auto rounded-md text-sm"
            showLineNumbers={false}
            wrapLongLines={false}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      // Inline code
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Pre (wraps fenced code blocks when no language is specified)
    pre: ({ children }) => (
      <pre className="my-3 overflow-x-auto rounded-md bg-muted p-4 text-sm">
        {children}
      </pre>
    ),

    // Tables (GFM)
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border last:border-0">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-semibold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-foreground">{children}</td>
    ),
  };
}

// Memoize the components map — it never changes between renders.
const MARKDOWN_COMPONENTS = buildComponents();

// Rehype and remark plugin arrays are stable references to avoid re-creating
// them on every render.
const REHYPE_PLUGINS = [rehypeSanitize];
const REMARK_PLUGINS = [remarkGfm];

// ---------------------------------------------------------------------------
// MarkdownRenderer
// ---------------------------------------------------------------------------

/**
 * Renders a markdown string with syntax highlighting and XSS sanitization.
 *
 * When `isStreaming` is true the content is debounced (50 ms) to avoid
 * triggering a full re-render on every incoming SSE chunk.
 *
 * Wrapped with React.memo so parent components that pass stable `content`
 * and `isStreaming` props (e.g. ConversationHistory message items) do not
 * cause unnecessary re-renders of the markdown pipeline.
 *
 * @example
 * ```tsx
 * <MarkdownRenderer content={aiResponse} isStreaming={isStreaming} />
 * ```
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming = false,
  className,
}: MarkdownRendererProps): JSX.Element {
  // Debounce content updates while streaming to reduce render pressure.
  // When not streaming we pass delay=0 so the value updates immediately.
  const debouncedContent = useDebounce(content, isStreaming ? 50 : 0);

  // The content we actually render: debounced during streaming, live otherwise.
  const renderedContent = isStreaming ? debouncedContent : content;

  return (
    <div
      className={className}
      // Announce content updates to screen readers when streaming.
      aria-live={isStreaming ? 'polite' : undefined}
      aria-atomic={isStreaming ? 'false' : undefined}
    >
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;
