# Frontend Design Pattern

## Scope

This document defines the visual identity and implementation patterns for BBF Labs frontend applications. It serves as a source of truth for UI consistency and data flow.

## Visual Identity (Aesthetic)

### 1) "No Rounded Stuff" (Sharp Edges)

- All components must use **zero border radius** (`radius: 0`).
- This applies to buttons, cards, inputs, dialogs, and sidbars.
- Implementation: `--radius: 0rem;` in `globals.css`.

### 2) High-Tech Color Palette (oklch)

- The UI follows a high-tech, minimal aesthetic using modern `oklch` colors.
- **Primary Accent**: Neon Blue (`oklch(55.08% 0.24318 261.968)`).
- **Backgrounds**: Deep slate/navy for dark mode, high-tech gray/blue for light mode.
- **Borders**: Subtle, defined by `oklch` tokens for clarity without bulk.

### 3) Typography & Spacing

- Use clean, sans-serif fonts (e.g., Geist Sans).
- Minimalist spacing to maintain a "dense but breathable" data-heavy interface.

## Core Implementation Patterns

### 1) Component Strategy

- **Atomic Design**: Build small, reusable primitives before assembling complex features.
- **Shadcn UI**: Use customized Shadcn primitives with sharp edges and oklch colors.
- **Deterministic UI**: UI should reflect backend state precisely; avoid optimistic updates for critical business logic unless requested.

### 2) Data Flow & State

- **TanStack Query**: Primary orchestrator for server state (fetching, caching, syncing).
- **Hooks-First**: Business logic stays in custom hooks (e.g., `useSessions`, `useAuth`); components remain lean and focused on rendering.
- **Contexts**: Use React Context sparingly, primarily for global cross-cutting concerns (auth, theme, sockets).

### 3) Real-time Interaction (SSE)

- Use Server-Sent Events (SSE) for streaming AI responses or real-time updates.
- Centralize stream handling in specialized hooks to avoid logic duplication.

## Session UX (Specific Contract)

### 1) AI-Owned Titles

- Session titles are generated server-side after the first message.
- Frontend must not persist local titles; it should display the backend `title` or a safe fallback.

### 2) Chat-First Interface

- Bottom-anchored, full-width chat inputs.
- Streaming-friendly message layouts (append-only logic).

## Do / Don’t

### Do

- Use existing design tokens from `globals.css`.
- Keep page components thin; logic belongs in hooks or services.
- Ensure accessibility and keyboard navigation.

### Don’t

- **Don’t add border radius** to any element.
- Don’t use `px` for spacing/sizing where `rem` or tokens are available.
- Don’t fork style patterns between different app sections.

---

_Last Updated: 2026-03-18_
