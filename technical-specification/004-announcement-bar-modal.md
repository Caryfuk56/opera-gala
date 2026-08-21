# Task

Announcement bar and first-visit important notice modal

---

# Goal

Replace the current full-height homepage `ImportantMessages.astro` section with a compact localized announcement bar and an accessible modal.

After implementation, an active important message is visible immediately at the very top of the homepage, opens as a modal on the user's first visit for that specific message ID, remains available through the bar after dismissal, and keeps full content in the existing important message content source.

---

# Requirements

- Rework `ImportantMessages.astro` from a large section into a compact announcement bar.
- The bar must render above the hero and above the fixed navigation/header visual layer.
- Preserve the existing important messages color direction, especially `bg-accent-wine`.
- The bar must show only a short notice, not the full message body.
- The bar must include a localized "details" link to the localized practical information route.
- If an active message exists, the homepage modal opens automatically only when that message ID has not been dismissed in `localStorage`.
- Modal content must include title, full body, practical information link, optional concert detail link, and a close control.
- Dismissal state must be keyed by message ID, not by a single global boolean.
- A new message ID must cause the modal to open again.
- `localStorage` and browser APIs must be used only in client-side code.
- Keep CZ/EN support consistent with the current URL-driven localization.
- Do not introduce unrelated refactors or a broad new data system.

---

# Existing Implementation

- `src/pages/[lang]/index.astro` imports `ImportantMessages.astro` and currently renders it after `<ConcertsPreview lang={lang} />`.
- `src/layouts/Layout.astro` renders `<Header lang={lang} />` before `<main>`, and the header is fixed with `top-0`.
- `src/components/sections/Hero.astro` is the first homepage visual section, uses `min-h-screen`, and has top padding intended for the fixed header.
- `src/components/sections/ImportantMessages.astro` currently:
  - loads `importantMessages/messages` through `getEntry`;
  - filters by `message.lang === lang`;
  - sorts by `publishedAt`;
  - renders all message content in a large `section` with `bg-accent-wine py-20 lg:py-28`;
  - has a small inline script only for "load more".
- `src/content/importantMessages/messages.json` already contains localized structured body content with inline link parts.
- `src/content/config.ts` defines the `importantMessages` data collection but currently only validates `lang`, `title`, `publishedAt`, and `body`.
- `src/i18n/cs.ts` and `src/i18n/en.ts` contain UI labels under `importantMessages`, currently only `title` and `loadMore`.
- `src/i18n/index.ts` provides `getI18n`, `getPath`, and URL language helpers.
- Practical information pages already exist at `src/pages/[lang]/practical-info.astro` and content already exists in `src/content/pages/cs/practical-info.md` and `src/content/pages/en/practical-info.md`.
- Concert detail routes exist as `src/pages/[lang]/concert/[id].astro`; homepage code already derives the next concert ID from Google Calendar when env vars are available.
- Existing dialog-like patterns:
  - `Header.astro` has an Astro mobile menu dialog with focus management, Escape close, body scroll lock, and a focus trap.
  - `GalleryOverlay.tsx` has a React modal for gallery-only behavior.
- There is no test runner configured in `package.json`; available scripts are `dev`, `lint`, `build`, `preview`, and `astro`.

---

# Architecture Decision

Keep `ImportantMessages.astro` as an Astro component backed by the existing `importantMessages` content collection. Extend the existing data shape instead of creating a separate announcement system.

Use Astro-rendered markup for both the announcement bar and modal shell. Add a small scoped inline client script inside `ImportantMessages.astro` for modal state, focus management, Escape handling, focus trapping, body scroll locking, overlay close behavior, and `localStorage` dismissal keyed by message ID. React is not needed because the interaction is small, isolated, and matches existing Astro progressive enhancement patterns.

To satisfy "above hero / navigation", add a named slot to `Layout.astro` before `Header` and render `ImportantMessages` into that slot from `src/pages/[lang]/index.astro`. Since `Header.astro` is currently `fixed top-0`, update `Header.astro` to support an offset when an announcement bar is present, or use a wrapper/body state set by the bar. Prefer an explicit prop such as `hasAnnouncementBar?: boolean` on `Layout` passed down to `Header` if the final implementation can keep it simple. Avoid global layout hacks that affect pages without an announcement.

Model one active announcement per language for the modal/bar. If multiple active messages are present, the component should deterministically select the newest by `publishedAt` and optionally ignore the rest for the bar/modal.

---

# Impact Analysis

## Files to Modify

- `src/components/sections/ImportantMessages.astro`
- `src/content/importantMessages/messages.json`
- `src/content/config.ts`
- `src/i18n/cs.ts`
- `src/i18n/en.ts`
- `src/pages/[lang]/index.astro`
- `src/layouts/Layout.astro`
- `src/components/layout/Header.astro`

## Files to Create

- Optional: `src/utils/importantMessages.ts`
- Optional: a test file only if the Coder first adds an approved test setup.

## Files Unaffected

- `src/components/gallery/GalleryModal.tsx` and `src/components/gallery/GalleryOverlay.tsx` should not be reused or modified for this task.
- `src/utils/googleCalendar.ts` should not change unless the final content requires deriving a concert URL automatically, which is not recommended for this urgent task.
- `src/content/pages/*/practical-info.md` already contains the venue-change content and does not need changes unless editorial copy changes.
- Other page routes and SEO metadata should remain unchanged.

---

# Risk Analysis

- Header placement is the main layout risk. A fixed `top-0` header will visually collide with a top announcement unless its offset/spacing is handled deliberately.
- Modal accessibility is the main interaction risk. The implementation must trap focus, restore focus after close, close on Escape, lock background scroll, and prevent interaction with background content.
- `inert` is useful for background interaction blocking but needs a fallback plan because older browsers may not fully support it. Use `aria-hidden`/focus trap/body scroll lock as the baseline; use `inert` only as progressive enhancement if practical.
- `localStorage` can throw in privacy-restricted contexts. Wrap reads/writes in `try/catch` and fail open by showing the modal if storage cannot be read.
- Content collection schema changes can break existing JSON if required fields are added without updating all localized entries.
- The current console output shows mojibake for Czech content in PowerShell, but the project files appear to contain localized content. The Coder should preserve UTF-8 and avoid re-encoding files accidentally.
- There is currently no test framework. Adding one requires a dependency decision and should be explicit, not hidden inside this urgent UI change.

---

# Implementation Strategy

Extend the existing important message data model with announcement-specific fields while keeping the structured `body.parts` representation:

- `id`: stable unique string for the announcement version, shared conceptually across languages or locale-suffixed if easier.
- `active`: boolean.
- `shortMessage`: localized compact bar copy.
- `practicalInfoUrl`: route slug such as `practical-info`.
- `concertUrl`: optional route slug such as `concert/<id>`.

Update `ImportantMessages.astro` to select the newest active message for the current `lang`. If none exists, render nothing.

Render the component as:

- a top announcement bar using `bg-accent-wine`, compact desktop padding/height, semantic text, and localized links;
- a modal container rendered in the HTML but initially hidden;
- modal body generated from the selected message's structured paragraphs;
- links resolved with `getPath(lang, slug)` for internal slugs.

Client-side behavior:

- On `DOMContentLoaded` and `astro:page-load`, initialize each `[data-important-announcement]` once.
- Read `localStorage.getItem("opera-gala-dismissed-announcement-id")`.
- If stored ID differs from the active `announcement.id`, open the modal.
- On close, write the active ID to the same storage key.
- Keep the announcement bar visible after close.
- Store and restore the previously focused element.
- Focus the close button or dialog title on open.
- Trap Tab/Shift+Tab inside the dialog.
- Close on Escape and overlay click.
- Lock body scroll while open and restore it on close.
- Mark the modal hidden when closed and visible when open.
- Ensure setup is safe during Astro SSG by keeping all browser APIs inside the inline script.

i18n strategy:

- Keep editorial text in `src/content/importantMessages/messages.json`, one entry per locale.
- Keep UI labels in `src/i18n/cs.ts` and `src/i18n/en.ts`, for example details link, close modal label, modal description label if needed, and optional concert detail link label.
- Use `getPath(lang, ...)` for internal localized routes.
- Do not add duplicate language-specific pages; keep existing `[lang]` routes.

Responsive strategy:

- Desktop bar should be visually compact, approximately 36-44 px when text fits.
- Mobile bar may wrap to two lines and use slightly larger vertical padding for readability.
- Modal should use fixed overlay, constrained width, `max-h` below viewport height, and internal vertical scrolling for long content.
- Avoid placing long notice text over the hero image.

---

# Implementation TODO

- [ ] Extend `src/content/config.ts` important message schema with `id`, `active`, `shortMessage`, `practicalInfoUrl`, and optional `concertUrl`.
- [ ] Update all entries in `src/content/importantMessages/messages.json` to include the new fields.
- [ ] Use a stable active ID such as `venue-change-2026-08-20` for this announcement.
- [ ] Keep the existing structured `body.parts` content and existing practical-info inline link.
- [ ] Add localized UI labels in `src/i18n/cs.ts` and `src/i18n/en.ts` for details, close notice modal, practical information link, and concert detail link.
- [ ] Refactor `src/components/sections/ImportantMessages.astro` to select the newest active message for the current language.
- [ ] Replace the large section markup with compact top-bar markup using `bg-accent-wine` and existing text/accent tokens.
- [ ] Add modal markup in `ImportantMessages.astro` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `hidden` initial state.
- [ ] Render title, full body paragraphs, practical info link, optional concert detail link, and close button inside the modal.
- [ ] Add scoped inline client script in `ImportantMessages.astro` for open/close, Escape, focus restore, focus trap, scroll lock, and `localStorage` dismissal by ID.
- [ ] Remove obsolete "load more" behavior from `ImportantMessages.astro`; the new UX shows one active announcement, not an archive.
- [ ] Add a named top slot to `src/layouts/Layout.astro` before the header, or an equivalent minimal layout mechanism.
- [ ] Update `src/pages/[lang]/index.astro` to render `ImportantMessages` into that top slot and remove its old position after `ConcertsPreview`.
- [ ] Update `Layout.astro` and `Header.astro` so the fixed header sits below the announcement bar on the homepage and remains unchanged on pages without the bar.
- [ ] Verify the announcement bar remains visible after modal dismissal.
- [ ] Verify `/cs/practical-info`, `/en/practical-info`, and optional `/[lang]/concert/<id>` links are generated through `getPath`.
- [ ] Run `pnpm.cmd lint`.
- [ ] Run `pnpm.cmd build`.
- [ ] Manually inspect Czech and English homepages at desktop, tablet, and mobile widths.
- [ ] Manually verify keyboard behavior: auto-open, Tab trap, Shift+Tab trap, Escape close, close button focus, and focus restoration.

---

# Validation Checklist

- [ ] The announcement bar appears above the hero and is not covered by the fixed header.
- [ ] The header remains usable and visually correct with and without the bar.
- [ ] The bar is compact on desktop and readable on mobile.
- [ ] The bar does not include the full long message.
- [ ] The bar details link points to the localized practical information page.
- [ ] First visit with a new active ID opens the modal automatically.
- [ ] Closing the modal writes that exact ID to `localStorage`.
- [ ] Reloading with the same dismissed ID does not auto-open the modal.
- [ ] Changing the announcement ID causes the modal to auto-open again.
- [ ] The bar remains visible after modal close.
- [ ] Modal title, full content, practical info link, optional concert link, and close control are present.
- [ ] Modal has correct dialog semantics and accessible naming.
- [ ] Escape closes the modal.
- [ ] Keyboard focus stays inside the modal while open.
- [ ] Focus returns to the previous element after close when possible.
- [ ] Background content cannot be interacted with while the modal is open.
- [ ] No React island was introduced for this interaction.
- [ ] No hardcoded user-facing CZ/EN strings were added directly in component markup.
- [ ] Tailwind semantic tokens are used for styling.
- [ ] `pnpm.cmd lint` passes or any blocker is documented.
- [ ] `pnpm.cmd build` passes or any blocker is documented.

---

# Notes

- This supersedes the older archive-style "Important messages section" behavior from `technical-specification/003-important-messages-section.md`.
- Do not add Playwright/Vitest dependencies without approval. If tests are required beyond manual validation, propose a separate small test-setup task first.
- If the concrete concert detail URL is not known at implementation time, leave `concertUrl` absent and render only the practical information link plus the persistent bar.
- The current practical-info markdown already contains matching venue-change information in both languages, so this task can focus on moving homepage presentation into the bar/modal pattern.
