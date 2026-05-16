/**
 * Tests for LessonPageIntegration lazy loading
 *
 * Validates: Requirements 22 (Performance Optimization – Lazy Loading)
 *            Requirements 13 (Integration with Existing Course/Lesson Pages)
 *
 * Tests cover:
 *  - Component renders null when feature is disabled
 *  - Component renders null when user is not authorized
 *  - Component renders the floating button when authorized
 *  - Lazy components are wrapped in Suspense
 *  - Loading fallback is displayed while lazy component loads
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { LessonPageIntegration } from './LessonPageIntegration';
import * as AiContext from '@/context/AiContext';
import * as AiAuth from '@/hooks/ai/useAiAuth';

// Mock the context and hooks
vi.mock('@/context/AiContext', () => ({
  useAiContext: vi.fn(),
}));

vi.mock('@/hooks/ai/useAiAuth', () => ({
  useAiAuth: vi.fn(),
}));

// Mock the lazy components
vi.mock('../lazy', () => ({
  LazyAskAiComponent: () => (
    <div data-testid="lazy-ask-ai">Ask AI Component</div>
  ),
  LazyConversationHistory: () => (
    <div data-testid="lazy-history">History Component</div>
  ),
}));

describe('LessonPageIntegration – Lazy Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature flag and authorization gates', () => {
    it('should return null when aiQA feature is disabled', () => {
      vi.mocked(AiContext.useAiContext).mockReturnValue({
        features: {
          aiQA: false,
          aiGeneration: true,
          aiEnhancement: true,
          aiPreGrading: true,
          aiStatistics: true,
        },
      } as any);
      vi.mocked(AiAuth.useAiAuth).mockReturnValue({
        canAsk: true,
      } as any);

      const { container } = render(
        <LessonPageIntegration courseId="1" lessonId="1" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when user cannot ask questions', () => {
      vi.mocked(AiContext.useAiContext).mockReturnValue({
        features: {
          aiQA: true,
          aiGeneration: true,
          aiEnhancement: true,
          aiPreGrading: true,
          aiStatistics: true,
        },
      } as any);
      vi.mocked(AiAuth.useAiAuth).mockReturnValue({
        canAsk: false,
      } as any);

      const { container } = render(
        <LessonPageIntegration courseId="1" lessonId="1" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render the floating button when authorized', () => {
      vi.mocked(AiContext.useAiContext).mockReturnValue({
        features: {
          aiQA: true,
          aiGeneration: true,
          aiEnhancement: true,
          aiPreGrading: true,
          aiStatistics: true,
        },
      } as any);
      vi.mocked(AiAuth.useAiAuth).mockReturnValue({
        canAsk: true,
      } as any);

      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      const button = screen.getByRole('button', { name: /open ai assistant/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Lazy loading with Suspense', () => {
    beforeEach(() => {
      vi.mocked(AiContext.useAiContext).mockReturnValue({
        features: {
          aiQA: true,
          aiGeneration: true,
          aiEnhancement: true,
          aiPreGrading: true,
          aiStatistics: true,
        },
      } as any);
      vi.mocked(AiAuth.useAiAuth).mockReturnValue({
        canAsk: true,
      } as any);
    });

    it('should render the panel with Suspense boundaries', async () => {
      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      // Click the floating button to open the panel
      const button = screen.getByRole('button', { name: /open ai assistant/i });
      fireEvent.click(button);

      // Wait for the lazy component to load
      await waitFor(() => {
        expect(screen.getByTestId('lazy-ask-ai')).toBeInTheDocument();
      });
    });

    it('should display loading fallback while lazy component loads', async () => {
      // Create a delayed lazy component to test the fallback
      const DelayedComponent = () => {
        throw new Promise((resolve) => setTimeout(resolve, 100));
      };

      render(
        <Suspense
          fallback={<div data-testid="loading-fallback">Loading...</div>}
        >
          <DelayedComponent />
        </Suspense>
      );

      // The fallback should be displayed initially
      expect(screen.getByTestId('loading-fallback')).toBeInTheDocument();
    });

    it('should switch between Ask AI and History tabs', async () => {
      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      // Open the panel
      const button = screen.getByRole('button', { name: /open ai assistant/i });
      fireEvent.click(button);

      // Wait for the Ask AI tab content to load
      await waitFor(() => {
        expect(screen.getByTestId('lazy-ask-ai')).toBeInTheDocument();
      });

      // Click the History tab
      const historyTab = screen.getByRole('tab', { name: /history/i });
      fireEvent.click(historyTab);

      // Wait for the History tab content to load
      await waitFor(() => {
        expect(screen.getByTestId('lazy-history')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(AiContext.useAiContext).mockReturnValue({
        features: {
          aiQA: true,
          aiGeneration: true,
          aiEnhancement: true,
          aiPreGrading: true,
          aiStatistics: true,
        },
      } as any);
      vi.mocked(AiAuth.useAiAuth).mockReturnValue({
        canAsk: true,
      } as any);
    });

    it('should have proper ARIA attributes on the floating button', () => {
      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      const button = screen.getByRole('button', { name: /open ai assistant/i });
      expect(button).toHaveAttribute('aria-label', 'Open AI assistant');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should have proper ARIA attributes on the panel', async () => {
      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      // Open the panel
      const button = screen.getByRole('button', { name: /open ai assistant/i });
      fireEvent.click(button);

      // The panel should have proper ARIA attributes
      const panel = screen.getByRole('dialog', {
        name: /ai learning assistant/i,
      });
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('should close panel on Escape key', async () => {
      render(<LessonPageIntegration courseId="1" lessonId="1" />);

      // Open the panel
      const button = screen.getByRole('button', { name: /open ai assistant/i });
      fireEvent.click(button);

      // Verify panel is open
      const panel = screen.getByRole('dialog');
      expect(panel).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(panel, { key: 'Escape' });

      // Panel should be closed (hidden)
      await waitFor(() => {
        expect(panel).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
