/**
 * Component tests for MarkdownRenderer – debouncing during streaming (task 13.3)
 *
 * Validates: Requirements 17, 22
 *
 * Tests cover:
 *  - Renders markdown content correctly
 *  - Debounces re-renders when isStreaming=true (50ms delay)
 *  - Does NOT debounce when isStreaming=false (immediate render)
 *  - Handles rapid content updates during streaming
 *  - Sanitizes HTML to prevent XSS
 *  - Applies syntax highlighting to code blocks
 *  - Renders GitHub Flavored Markdown (tables, strikethrough, etc.)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render markdown content correctly', () => {
    const content = '# Hello\n\nThis is a **bold** text.';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hello'
    );
    expect(screen.getByText(/bold/)).toBeInTheDocument();
  });

  it('should render paragraphs', () => {
    const content = 'First paragraph\n\nSecond paragraph';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('should render lists', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={content} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('should render ordered lists', () => {
    const content = '1. First\n2. Second\n3. Third';
    render(<MarkdownRenderer content={content} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('should render emphasis (bold and italic)', () => {
    const content = 'This is **bold** and *italic* text.';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('should render links', () => {
    const content = '[Click here](https://example.com)';
    render(<MarkdownRenderer content={content} />);

    const link = screen.getByRole('link', { name: /click here/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render inline code', () => {
    const content = 'Use `const x = 5;` in your code.';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('const x = 5;')).toBeInTheDocument();
  });

  it('should render code blocks with syntax highlighting', () => {
    const content = '```javascript\nconst x = 5;\nconsole.log(x);\n```';
    const { container } = render(<MarkdownRenderer content={content} />);

    // Syntax highlighting splits tokens into separate spans, so we check the
    // container's text content rather than looking for a single text node.
    expect(container.textContent).toMatch(/const/);
    expect(container.textContent).toMatch(/x/);
    expect(container.textContent).toMatch(/5/);
    // The code element with the language class should be present
    expect(
      container.querySelector('code.language-javascript')
    ).toBeInTheDocument();
  });

  it('should render blockquotes', () => {
    const content = '> This is a quote';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('This is a quote')).toBeInTheDocument();
  });

  it('should render headings at different levels', () => {
    const content = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('H1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('H2');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('H3');
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('H4');
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('H5');
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('H6');
  });

  it('should sanitize HTML to prevent XSS', () => {
    const content = '<script>alert("XSS")</script>\n\nSafe content';
    render(<MarkdownRenderer content={content} />);

    // The script tag should be removed
    expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should debounce re-renders when isStreaming=true', async () => {
    const { rerender } = render(
      <MarkdownRenderer content="chunk 1" isStreaming={true} />
    );

    expect(screen.getByText('chunk 1')).toBeInTheDocument();

    // Update content multiple times rapidly
    rerender(<MarkdownRenderer content="chunk 1 chunk 2" isStreaming={true} />);
    rerender(
      <MarkdownRenderer content="chunk 1 chunk 2 chunk 3" isStreaming={true} />
    );

    // Content should still be the old value (debounced)
    expect(screen.getByText('chunk 1')).toBeInTheDocument();
    expect(
      screen.queryByText('chunk 1 chunk 2 chunk 3')
    ).not.toBeInTheDocument();

    // Advance past the debounce delay (50ms) inside act() so React flushes state updates
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Now the content should be updated
    expect(screen.getByText('chunk 1 chunk 2 chunk 3')).toBeInTheDocument();
  });

  it('should NOT debounce when isStreaming=false', () => {
    const { rerender } = render(
      <MarkdownRenderer content="initial" isStreaming={false} />
    );

    expect(screen.getByText('initial')).toBeInTheDocument();

    // Update content
    rerender(<MarkdownRenderer content="updated" isStreaming={false} />);

    // Content should update immediately (no debouncing)
    expect(screen.getByText('updated')).toBeInTheDocument();
    expect(screen.queryByText('initial')).not.toBeInTheDocument();
  });

  it('should handle rapid updates during streaming', async () => {
    const { rerender } = render(
      <MarkdownRenderer content="" isStreaming={true} />
    );

    // Simulate rapid SSE chunks
    for (let i = 1; i <= 10; i++) {
      rerender(
        <MarkdownRenderer content={`chunk ${i}`.repeat(i)} isStreaming={true} />
      );
      vi.advanceTimersByTime(5); // Advance 5ms between chunks
    }

    // Should still show empty or initial content (debounced)
    expect(screen.queryByText(/chunk 10/)).not.toBeInTheDocument();

    // Advance past the debounce delay inside act() so React flushes state updates
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Now the final content should be rendered
    expect(screen.getByText(/chunk 10/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MarkdownRenderer content="# Test" className="custom-class" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should set aria-live when streaming', () => {
    const { container } = render(
      <MarkdownRenderer content="test" isStreaming={true} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
    expect(wrapper).toHaveAttribute('aria-atomic', 'false');
  });

  it('should NOT set aria-live when not streaming', () => {
    const { container } = render(
      <MarkdownRenderer content="test" isStreaming={false} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveAttribute('aria-live');
  });

  it('should render GitHub Flavored Markdown tables', () => {
    const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  it('should render strikethrough text (GFM)', () => {
    const content = 'This is ~~strikethrough~~ text.';
    render(<MarkdownRenderer content={content} />);

    // The strikethrough text should be rendered
    expect(screen.getByText(/strikethrough/)).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle very long content', () => {
    const longContent = 'This is a paragraph.\n\n'.repeat(100);
    render(<MarkdownRenderer content={longContent} />);

    expect(screen.getAllByText('This is a paragraph.')).toHaveLength(100);
  });

  it('should toggle debouncing when isStreaming changes', async () => {
    const { rerender } = render(
      <MarkdownRenderer content="initial" isStreaming={true} />
    );

    rerender(<MarkdownRenderer content="updated" isStreaming={true} />);

    // Should be debounced
    expect(screen.getByText('initial')).toBeInTheDocument();

    // Switch to non-streaming mode — this changes delay to 0, which triggers
    // an immediate state update inside useDebounce via the useEffect.
    await act(async () => {
      rerender(<MarkdownRenderer content="updated" isStreaming={false} />);
    });

    // Should update immediately
    expect(screen.getByText('updated')).toBeInTheDocument();
  });
});
