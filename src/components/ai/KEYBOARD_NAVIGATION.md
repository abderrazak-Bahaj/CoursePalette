# AI Components — Keyboard Navigation Reference

**Validates:** Requirement 15 (Accessibility Compliance — WCAG 2.1 AA)

This document is the single source of truth for keyboard navigation in the AI
integration. It consolidates the per-component JSDoc keyboard sections so QA,
designers, and screen-reader users can verify behavior without reading every
file.

Per-component implementation details remain in each file's top-of-file JSDoc
block (search for "Keyboard navigation (Requirement 15)").

---

## 1. Global Conventions

All AI components follow the same conventions to keep keyboard interaction
predictable across the feature.

### 1.1 Tab order

- DOM order **always** matches the visual layout. We never use `order-*` /
  flexbox `order` to reposition focusable controls without also reordering the
  DOM.
- We never apply `tabIndex={-1}` to functional controls. The only exception is
  the dialog container itself in `AssignmentPageIntegration` (see §3.2) — the
  dialog wrapper is given `tabIndex={-1}` so it can receive programmatic focus
  when there is no focusable child, but it is **not** part of the tab cycle.
- Decorative elements (icons, status indicators, blinking cursors, charts) are
  marked `aria-hidden="true"` so they never appear in the tab order or steal
  screen-reader attention.

### 1.2 Visible focus indicators

Every focusable control exposes the design-system focus ring:

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring        /* token --ring → meets WCAG 2.1 AA contrast */
focus-visible:ring-offset-1    /* (or ring-offset-2 for dense layouts)      */
```

Destructive actions (Retry on error, Dismiss on rate-limit alert) use
`focus-visible:ring-destructive` for higher visual weight. The shadcn
`<Button>` component defines the same ring in its base CVA variant, so any
component using `<Button>` automatically inherits it.

For Windows High Contrast Mode we add `forced-colors:` fallbacks
(`forced-colors:border-[ButtonText]`, `forced-colors:bg-[Highlight]`, etc.) on
the badge / decision controls in `QuestionEnhancer`, `PreGradeReview`,
`AssignmentGenerator`, and `RateLimitAlert` so those controls remain visible
when the OS forces system colors.

### 1.3 Touch / activation targets

All buttons that ship with custom styling include `min-h-[44px]` (and
`min-w-[44px]` for square icon buttons) to satisfy WCAG 2.5.5 / Requirement
16.4. The shadcn `<Button>` default size is also ≥ 44 px tall.

### 1.4 Activation keys

- All `<button>` controls activate on **Enter** and **Space** (native
  behavior). No JavaScript fallback is needed.
- All form fields submit their parent form on **Enter** (native), except in
  the AI Q&A textarea where plain Enter inserts a newline so multi-line
  questions can be typed (see §2.1).

---

## 2. Per-component Tab Order

### 2.1 `AskAiComponent` (StudentQA)

```text
[rate-limit dismiss button (when shown)]
  → [response region]                   (read-only, not focusable)
  → [Retry button (when error)]
  → [textarea — ai-question-input]
  → [Submit button — "Ask AI"]
```

**Custom shortcut:**

- `Ctrl+Enter` / `Cmd+Enter` inside the textarea submits the question.
  Plain Enter inserts a newline so users can type multi-line questions.
  The shortcut only fires when the form is in a submittable state
  (`canSubmit === true`); otherwise the keypress falls through to the
  browser default. The hint `Press Ctrl+Enter to submit` is rendered
  visibly next to the character counter and surfaced via
  `aria-describedby="ai-question-hint"`.

### 2.2 `ConversationHistory` (StudentQA)

```text
[Clear-History trigger (opens AlertDialog)]
  → [Retry button (when error)]
  → [Previous button]
  → [Next button]
```

**No custom shortcuts.** The Clear-History confirmation uses Radix
`AlertDialog`, which natively traps focus, closes on **Escape**, and returns
focus to the trigger.

### 2.3 `StreamingResponse` (StudentQA)

Renders no interactive elements. Focus passes through it untouched, so the
parent form's tab order (`AskAiComponent`) is preserved.

### 2.4 `AssignmentGenerator` (TeacherTools)

```text
[rate-limit dismiss button (when shown)]
  → [#gen-num-questions]
  → [#gen-max-score]
  → [#gen-difficulty]
  → [Generate button]
  → [Reset button (when present)]
  → [Retry button (when error)]
  → [question 1 collapse toggle]
  → [#question-text-1]
  → [option-A text]
  → [option-B text]
  → [option-C text]
  → [option-D text]
  → [#question-points-1]
  → … (repeat for each question)
  → [Save Assignment button]
```

**No custom shortcuts.** Form Enter submits the form via native browser
behavior.

### 2.5 `QuestionEnhancer` (TeacherTools)

For each suggested field (question, options, points):

```text
[Accept ✓ button]   ← 44×44 px circular control, aria-pressed
  → [Reject ✗ button]  ← 44×44 px circular control, aria-pressed
```

After all field decisions:

```text
[Save Changes button]
  → [Re-enhance button]
  → [Discard button]
```

**No custom shortcuts.** Activation is via Enter / Space.

### 2.6 `PreGradeReview` (TeacherTools)

```text
[Retry button (when fetch error)]
  → [Generate Pre-grade button (empty state)]
  → [Accept AI Score]   (aria-pressed)
  → [Modify Score]      (aria-pressed, aria-expanded, aria-controls=modify-score-panel)
  → [Re-grade]
  → [#custom-score-input    (in Modify mode)]
  → [#score-rationale       (in Modify mode)]
  → [Save Grade]
```

**No custom shortcuts.**

### 2.7 `AiUsageStatistics` (AdminDashboard)

```text
[7d]  → [14d]  → [30d]  → [60d]  → [90d]   (Days filter, aria-pressed each)
  → [Retry button (only when error)]
```

The bar chart is non-interactive and `aria-hidden="true"`. A
screen-reader-only `<table>` provides equivalent data.

**No custom shortcuts.**

### 2.8 `RateLimitAlert` (Common)

```text
[Dismiss × button]
```

The countdown also auto-dismisses when the timer reaches zero. **No custom
shortcuts.**

### 2.9 `ErrorBoundary` (Common)

Renders a `<Button>` (Try Again) whose tab order depends on where the boundary
is mounted. **No custom shortcuts.** Activates on Enter / Space.

### 2.10 `MarkdownRenderer` (Common)

Renders no interactive controls of its own. Anchor (`<a>`) elements inside
markdown content are styled with the design-system focus ring and open
external links in a new tab with `rel="noopener noreferrer"`.

---

## 3. Modals / Dialogs (Focus Trapping)

We ship three modal-style components. Each one **traps focus** while open and
returns focus to its trigger on close.

### 3.1 `LessonPageIntegration` — slide-over panel

- Trigger: floating "Open AI assistant" button (bottom-right, fixed).
- Panel: `role="dialog"` + `aria-modal="true"` + `aria-label="AI Learning Assistant"`.
- On open: focus moves to the first focusable element (the close button).
- Tab / Shift+Tab: focus cycles inside the panel only.
- **Escape**: closes the panel.
- Body scroll is locked while open.
- Closed state: panel uses the `inert` attribute (where supported) plus
  `aria-hidden` so assistive tech does not see the hidden panel.
- The footer renders `Press Esc to close` so the shortcut is discoverable.

Tab order inside the panel:

```text
[Close × button]
  → [Ask AI tab]
  → [History tab]
  → (Tab-panel content — AskAiComponent or ConversationHistory tab order)
```

### 3.2 `AssignmentPageIntegration` — modal dialog

- Trigger: "Enhance with AI" button.
- Modal: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to
  the visible heading.
- On open: focus moves to the first focusable child (the close button).
- Tab / Shift+Tab: focus cycles inside the modal.
- **Escape**: closes the modal.
- Backdrop click also closes the modal (Escape is the keyboard equivalent).
- Body scroll is locked while open.
- The dialog container itself uses `tabIndex={-1}` so it can receive
  programmatic focus when no child is focusable, but it never appears in the
  Tab cycle.

Tab order inside the modal:

```text
[Close × button]
  → (Lazy-loaded QuestionEnhancer tab order — see §2.5)
```

### 3.3 `ConversationHistory` — Clear-History confirmation

Uses the Radix `AlertDialog` primitive, which provides:

- Focus trap inside the dialog.
- **Escape** closes (and returns focus to the trigger).
- Initial focus on the **Cancel** button (least-destructive default).

Tab order inside the dialog:

```text
[Cancel button]
  → [Clear History button (destructive)]
```

### 3.4 `SubmissionPageIntegration` — collapsible (NOT a modal)

This is **not** a dialog and does **not** trap focus. The collapsible header
is a normal `<button>` with `aria-expanded` / `aria-controls` pointing to the
panel. The surrounding submission page remains interactive while the panel is
expanded.

### 3.5 `DashboardIntegration` — wrapper section

Pure wrapper. Adds no interactive controls of its own; tab order is inherited
from `AiUsageStatistics`.

---

## 4. Custom Keyboard Shortcuts (Summary)

| Component                           | Shortcut         | Action                            |
| ----------------------------------- | ---------------- | --------------------------------- |
| `AskAiComponent` (textarea)         | `Ctrl/Cmd+Enter` | Submit question                   |
| `LessonPageIntegration` (panel)     | `Esc`            | Close panel                       |
| `AssignmentPageIntegration` (modal) | `Esc`            | Close modal                       |
| `ConversationHistory` (AlertDialog) | `Esc`            | Close confirmation (Radix native) |

There are intentionally no other custom shortcuts. All other interaction
relies on native browser behavior (Tab to move focus, Enter / Space to
activate buttons, Enter to submit forms).

---

## 5. Manual QA Checklist

Use this checklist to verify keyboard navigation when reviewing PRs that
touch any AI component:

1. Unplug the mouse. Reach every interactive control with **Tab** alone.
2. Confirm every focused control shows the focus ring (look for the
   `--ring`-coloured outline; in dark mode it is a soft blue).
3. Confirm focus order matches the visual top-to-bottom, left-to-right flow.
4. Open every modal / panel and verify Tab / Shift+Tab stays inside.
5. Press **Escape** in every modal / panel and verify it closes and focus
   returns to the trigger.
6. In `AskAiComponent`, type a question and press **Ctrl+Enter** — the form
   should submit. Press plain **Enter** — a newline should be inserted.
7. Run the Storybook a11y addon (or browser extension axe-core) on each
   component story and confirm there are no contrast or focus violations.

If any check fails, file a regression bug referencing this document.
