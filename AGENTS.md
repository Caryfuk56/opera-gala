# AGENTS.md – Astro Project Guidelines

## 1. Project Context

This project is a **static-first website built with Astro**.
Primary goals:

* clarity
* performance
* minimal JavaScript
* clean, maintainable structure

Astro is the **default rendering layer**.
React is used **only when interactivity is required**.

Tailwind CSS is used for styling.

---

## 2. Core Principles (DO NOT BREAK)

* Prefer **Astro components over framework components**
* Prefer **static rendering** over client-side JS
* Use React **only for interactive islands**
* Keep JavaScript minimal and intentional
* Favor simple, readable solutions over clever abstractions

---

## 3. Theming & Tailwind Tokens (MUST FOLLOW)
- Do not hardcode colors or fonts in Tailwind classes.
- Always use the semantic theme tokens defined in `tailwind.config.*`:
  - Backgrounds: `bg-bg-primary`, `bg-bg-secondary`
  - Text: `text-text-primary`, `text-text-secondary`
  - Accents: `bg-accent`, `text-accent`, `bg-accent-deep`
- Fonts:
  - Headings must use `font-heading`
  - Body text must use `font-body`
- If a new visual value is needed, extend the theme instead of inline values.

---

## 4. Component Strategy

### Astro Components (default)

Use `.astro` components for:

* layout
* pages
* static UI
* content rendering
* composition of sections

Astro components:

* may contain HTML + Tailwind
* may import other Astro components
* may import React components **only when needed**

Do NOT:

* simulate React patterns inside Astro
* over-abstract layout into JS logic

---

### React Components (islands only)

Use React **only** when one of these is true:

* user interaction (click, toggle, filter)
* client-side state
* dynamic behavior not possible with HTML/CSS

Rules:

* React components must be **small and focused**
* One responsibility per component
* No layout logic inside React unless unavoidable
* Use the appropriate Astro client directive:

  * `client:load`
  * `client:idle`
  * `client:visible`

Default to **`client:visible`** unless there is a reason not to.

---

## 5. Styling Rules (Tailwind)

* Use Tailwind utility classes
* Do not write custom CSS unless absolutely necessary
* Avoid inline styles
* Avoid deeply nested utility chains

Guidelines:

* Prefer composition over long class strings
* Extract repeated patterns into components
* Use consistent spacing and typography scales

Dark mode is the **default design**.

---

## 6. File & Folder Structure

Follow this structure strictly:

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

* `layouts/` → page shells
* `components/sections/` → page-level sections
* `components/ui/` → small reusable UI primitives
* `pages/` → routing only, minimal logic
* `content/` → markdown or content collections

Do NOT:

* mix layout logic into pages
* put React components into `pages/`

---

## 7. Content & Data

* Prefer **Astro Content Collections** or markdown files
* Avoid hardcoded content inside components
* Keep content and presentation separated

Data rules:

* Static data → markdown / JSON
* No runtime fetching unless explicitly required
* No unnecessary client-side data loading

---

## 8. Code Style & Quality

General rules:

* Prefer explicit code over magic
* Avoid premature abstraction
* Keep components small
* Avoid deep nesting

React-specific:

* Avoid inline anonymous functions in JSX
* Extract logic into hooks/helpers
* Avoid complex conditionals inside JSX
* Prefer early returns

Astro-specific:

* Keep frontmatter minimal
* Do not replicate React state patterns
* Use Astro’s strengths, not workarounds

---

## 9. Agent Execution Rules (IMPORTANT)

When working as an AI agent:

* Touch **only files explicitly mentioned**
* Do not refactor unrelated code
* Do not introduce new dependencies without approval
* Do not “improve” architecture unless asked
* Prefer minimal diffs

If unsure:

* Ask for clarification
* Do NOT guess

---

## 10. What NOT to Do

* Do not turn Astro into a React app
* Do not add global JS without reason
* Do not invent patterns not present in the codebase
* Do not optimize prematurely
* Do not over-engineer

---

## 11. Success Criteria

A change is considered successful if:

* it is readable
* it is minimal
* it aligns with Astro’s philosophy
* it does not introduce unnecessary JS
* it can be understood by a human in one pass

---

## 12 i18n Rules (MUST FOLLOW)

- Do not duplicate pages per language.
- Use dynamic `[lang]` route parameters.
- All text content must come from language dictionaries.
- Do not use client-side state for language switching.
- Language switching is handled via URL paths only.

---

## Final Note

This project values:

> **clarity over cleverness**
> **intent over automation**
> **design over framework tricks**

AI is a tool, not the author.
