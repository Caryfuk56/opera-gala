# AGENTS.md – Astro Project Guidelines

# 1. Project Context

This project is a **static-first website built with Astro**.

Primary goals:

- clarity
- performance
- accessibility
- maintainability
- minimal JavaScript

Astro is the **default rendering layer**.

React is used **only when interactivity is required**.

Tailwind CSS is used for styling.

---

# 2. Architecture Overview

The project follows a **static-first architecture**.

Rendering priority:

1. Static HTML (Astro)
2. Progressive enhancement
3. React islands when interaction is required

Data flow:

```
Content Collections / Markdown
            ↓
      Astro Components
            ↓
        Astro Pages
            ↓
 Optional React Islands
```

Favor Astro's strengths instead of recreating SPA architecture.

---

# 3. Core Principles (DO NOT BREAK)

- Prefer **Astro components** over framework components.
- Prefer **static rendering** over client-side rendering.
- Use React **only for interactive islands**.
- Keep JavaScript minimal and intentional.
- Favor readability over clever abstractions.
- Prefer explicit code over implicit behavior.

---

# 4. Theming & Tailwind Tokens (MUST FOLLOW)

Do not hardcode colors or fonts in Tailwind classes.

Always use semantic theme tokens defined in the Tailwind configuration.

Backgrounds:

- `bg-bg-primary`
- `bg-bg-secondary`

Text:

- `text-text-primary`
- `text-text-secondary`

Accents:

- `bg-accent`
- `text-accent`
- `bg-accent-deep`

Fonts:

- Headings → `font-heading`
- Body → `font-body`

If a new visual value is required, extend the theme instead of using inline values.

---

# 5. Component Strategy

## Astro Components (default)

Use `.astro` components for:

- layouts
- pages
- static UI
- content rendering
- section composition

Astro components may:

- contain HTML + Tailwind
- import other Astro components
- import React components only when necessary

Do NOT:

- simulate React patterns inside Astro
- move presentation logic into JavaScript
- over-abstract layouts

---

## React Components (interactive islands)

Use React only when one of the following is required:

- user interaction
- client-side state
- browser APIs
- behavior impossible with HTML/CSS

Rules:

- components should be small
- one responsibility per component
- avoid layout responsibilities
- keep business logic isolated

Hydration priority:

1. `client:visible`
2. `client:idle`
3. `client:load`

Use the lightest hydration strategy possible.

---

# 6. Styling Rules

- Prefer Tailwind utilities.
- Avoid custom CSS unless necessary.
- Avoid inline styles.
- Keep utility chains readable.
- Extract repeated patterns into reusable components.

Dark mode is the default design.

---

# 7. File & Folder Structure

```
src/
  components/
    layout/
    sections/
    ui/
  layouts/
  pages/
  content/
  styles/
```

Rules:

- layouts → page shells
- sections → page-level content
- ui → reusable primitives
- pages → routing only
- content → markdown and collections

Do NOT:

- place React components inside pages
- mix layout logic into routing
- duplicate reusable UI

---

# 8. Content Strategy

Content should remain separate from presentation.

Prefer:

- Astro Content Collections
- Markdown
- JSON

Avoid hardcoded content inside components.

Static content belongs in content files, not UI components.

---

# 9. Accessibility Rules

Accessibility is mandatory.

Prefer semantic HTML before ARIA.

Every interactive element should:

- support keyboard navigation
- expose visible focus
- include accessible labels where required
- remain usable with screen readers

---

# 10. SEO Rules

Every page should provide:

- unique page title
- meta description
- canonical URL
- Open Graph metadata
- proper heading hierarchy

Avoid duplicate metadata.

---

# 11. Performance Rules

Performance is a primary goal.

Prefer:

- static rendering
- CSS over JavaScript
- minimal hydration
- minimal client bundles

Avoid unnecessary runtime behavior.

---

# 12. Naming Conventions

Use consistent naming throughout the project.

Components:

- PascalCase

Astro Components:

- `ComponentName.astro`

React Components:

- `ComponentName.tsx`

Helpers:

- camelCase

Hooks:

- `useSomething.ts`

Constants:

- UPPER_SNAKE_CASE only when appropriate

---

# 13. Error Handling

Never silently ignore errors.

Prefer explicit failures over hidden fallbacks.

If assumptions are violated:

- fail clearly
- surface useful information
- avoid masking unexpected states

---

# 14. Code Style & Quality

General rules:

- keep components focused
- avoid deep nesting
- avoid premature abstraction
- prefer composition
- optimize for readability

React:

- avoid complex JSX
- prefer early returns
- extract reusable logic into hooks or helpers

Astro:

- keep frontmatter minimal
- avoid recreating React patterns

---

# 15. Definition of Done

A task is complete only if:

- architecture remains consistent
- no unnecessary JavaScript was introduced
- accessibility is preserved
- semantic HTML is used
- Tailwind theme tokens are respected
- duplicated code was not introduced
- changes remain minimal and understandable

---

# 16. Agent Execution Rules

When working as an AI agent:

- modify only requested files
- avoid unrelated refactoring
- avoid architectural changes unless requested
- do not introduce dependencies without approval
- prefer minimal diffs

If requirements are unclear:

Ask before implementing.

Never guess.

Specialized agent behavior is defined in:

```
.agents/agents/
```

Switch to agent mode according prompt keywords PLANNER, REVIEWER, CODER

## PLANNER
path: `.agents/agents/planner.md`

## CODER
path: `.agents/agents/coder.md`

## REVIEWER
path: `.agents/agents/rivewer.md`

---

# 17. What NOT to Do

- Do not turn Astro into a React application.
- Do not introduce unnecessary JavaScript.
- Do not invent new architectural patterns.
- Do not optimize prematurely.
- Do not over-engineer.
- Do not duplicate components or content.

---

# 18. Success Criteria

A successful implementation is:

- readable
- minimal
- maintainable
- performant
- accessible
- aligned with Astro philosophy

It should be understandable in a single pass.

---

# 19. i18n Rules (MUST FOLLOW)

- Do not duplicate pages per language.
- Use dynamic `[lang]` routes.
- Keep all text inside language dictionaries.
- Do not use client-side language switching.
- Language is determined by the URL.

---

# Final Note

This project values:

> clarity over cleverness  
> simplicity over abstraction  
> intent over automation  
> architecture over shortcuts

AI is a collaborator, not the architect.