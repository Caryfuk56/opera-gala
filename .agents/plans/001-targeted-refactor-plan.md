# Task

Targeted refactor plan from `codebase-audit.md`

---

# Goal

Create an implementation plan for the confirmed audit findings in `.agents/analysis/codebase-audit.md`.

After implementation, the project should preserve its static-first Astro architecture while improving calendar error handling, restoring lint, rendering practical-info content, improving page metadata, localizing interactive labels, tightening gallery data contracts, and reducing lifecycle risk in the parallax helper.

---

# Requirements

- Address audit findings in priority order without broad redesign.
- Preserve Astro as the default rendering layer.
- Use React only for gallery interactions that require client-side state.
- Keep user-facing text and accessible labels in the existing i18n dictionaries.
- Keep styling in Tailwind utilities and existing semantic theme tokens.
- Add tests only where they protect behavior identified by the audit.
- Avoid new dependencies unless a later implementation step proves one is required and the user approves it.
- Do not refactor unrelated components.

---

# Existing Implementation

- Calendar data is handled in `src/utils/googleCalendar.ts`.
- Calendar list rendering appears in `src/components/sections/ConcertsPreview.astro` and `src/pages/[lang]/concert.astro`.
- Calendar detail rendering appears in `src/pages/[lang]/concert/[id].astro`.
- Practical info content is loaded from `src/content/pages/{lang}/practical-info.md` by `src/pages/[lang]/practical-info.astro`, but its sections are not rendered.
- Rich content section rendering already exists in `src/pages/[lang]/about.astro` using `marked` and `src/components/ui/Section.astro`.
- Shared page shell metadata is centralized in `src/layouts/Layout.astro`.
- Gallery data is fetched by `src/pages/api/gallery.ts`, while `src/components/gallery/GalleryPage.tsx` fetches `/api/gallery` in the browser with `client:load`.
- Gallery modal interaction is split across `GalleryPage.tsx`, `GalleryModal.tsx`, `GalleryOverlay.tsx`, and `InlineMiniGallery.tsx`.
- ESLint configuration is in `eslint.config.mjs`; `pnpm lint` currently fails before source linting.
- Parallax behavior is embedded in `src/components/ui/Section.astro`.

---

# Architecture Decision

Use targeted changes, not a redesign.

The first implementation pass should restore the developer feedback loop and fix user-visible correctness:

1. Restore lint.
2. Make calendar fetch outcomes explicit.
3. Render practical-info content.

The second pass should improve architecture and maintainability:

1. Extend SEO metadata through `Layout.astro`.
2. Localize accessible labels through i18n.
3. Tighten gallery data contracts and move full-page gallery data loading toward server-rendered Astro where practical.
4. Guard or simplify the parallax loop.

Calendar and content rendering should remain Astro/server-side. Gallery modal behavior should remain React because it manages modal state, keyboard handling, swipe gestures, and loaded image state.

---

# Impact Analysis

## Files to Modify

- `eslint.config.mjs`
- `src/utils/googleCalendar.ts`
- `src/components/sections/ConcertsPreview.astro`
- `src/pages/[lang]/concert.astro`
- `src/pages/[lang]/concert/[id].astro`
- `src/pages/[lang]/practical-info.astro`
- `src/layouts/Layout.astro`
- `src/pages/[lang]/index.astro`
- `src/pages/[lang]/about.astro`
- `src/pages/[lang]/artists.astro`
- `src/pages/[lang]/concert.astro`
- `src/pages/[lang]/gallery.astro`
- `src/pages/[lang]/contact.astro`
- `src/pages/[lang]/practical-info.astro`
- `src/i18n/cs.ts`
- `src/i18n/en.ts`
- `src/components/layout/Header.astro`
- `src/components/gallery/GalleryOverlay.tsx`
- `src/components/gallery/InlineMiniGallery.tsx`
- `src/components/gallery/GalleryModal.tsx`
- `src/components/gallery/GalleryPage.tsx`
- `src/pages/api/gallery.ts`
- `src/components/ui/Section.astro`

## Files to Create

- A focused test file for calendar utilities, location to follow the existing test setup once lint/tooling is restored.
- Optionally `src/types/gallery.ts` or `src/components/gallery/types.ts` for shared gallery data types.
- Optionally a server gallery utility if Cloudinary fetching is reused between `src/pages/api/gallery.ts` and `src/pages/[lang]/gallery.astro`.

## Files Unaffected

- `src/components/sections/Hero.astro` unless SEO descriptions are sourced from i18n route metadata.
- `src/components/sections/AboutProject.astro`
- `src/components/sections/EnsemblePreview.astro`
- `src/components/sections/VenuePreview.astro`
- `src/components/sections/Partners.astro`
- Existing assets in `src/assets` and `public`.

---

# Risk Analysis

- Calendar error handling can change user-visible states on concert pages. Tests should lock down empty result, upstream failure, and not-found behavior.
- Practical-info rendering may expose incomplete content. The coder should verify both `cs` and `en` content entries exist before relying on them.
- SEO metadata touches the shared layout and all localized routes. Keep the prop contract small to avoid churn.
- Gallery server rendering depends on Cloudinary environment variables and Netlify runtime behavior. If server rendering is not reliable in the current hosting setup, keep the API route but remove duplicated types first.
- Localized accessibility labels affect screen-reader behavior; ensure defaults exist for both languages.
- Parallax changes affect visual behavior on content pages using `background: "parallax"`.

---

# Implementation Strategy

## Phase 1: Restore Safety Nets

Fix `eslint.config.mjs` so `pnpm lint` can run. Then add focused tests for the calendar utility before changing its error contract.

## Phase 2: Correct User-Visible Behavior

Update calendar utilities so request failures are not swallowed as empty arrays or `null`. Adjust concert list and detail pages to show localized load errors while preserving 404 only for actual missing event IDs.

Render practical-info sections using the existing content collection and `Section.astro` pattern. Prefer extracting shared content-section rendering only if duplication with `about.astro` becomes meaningful during implementation.

## Phase 3: Metadata and i18n Cleanup

Extend `Layout.astro` with a minimal metadata contract for description, canonical URL, and Open Graph values. Update localized routes to pass descriptions from content or i18n.

Move hardcoded header and gallery `aria-label` values into `cs.ts` and `en.ts`, then pass them through component props where needed.

## Phase 4: Gallery Boundary Cleanup

Introduce a small shared gallery type contract. Remove `any` from gallery resource mapping. Keep React for modal/overlay behavior.

Investigate whether Cloudinary resource loading can be moved to a server utility used by both the API route and gallery page. If yes, render grouped gallery data from Astro and hydrate only modal controls. If no, preserve the API route but still share types and improve alt/title generation.

## Phase 5: Parallax Lifecycle Cleanup

Review `Section.astro` parallax initialization. Ensure only one animation loop is active per page lifecycle, or replace the perpetual loop with a lighter scroll-driven approach if sufficient.

---

# Implementation TODO

- [ ] Fix React Hooks plugin registration in `eslint.config.mjs`.
- [ ] Run `pnpm lint` and record any source diagnostics as follow-up work unless they are directly caused by this refactor.
- [ ] Add calendar utility tests for successful event lists, empty event lists, upstream fetch failure, event detail 404, and event detail upstream failure.
- [ ] Change `fetchUpcomingEvents` so upstream failures are distinguishable from empty results.
- [ ] Change `fetchEventById` so only Google Calendar 404 returns not-found, while other failures remain failures.
- [ ] Update `ConcertsPreview.astro` and `src/pages/[lang]/concert.astro` to show localized load errors only for actual failures.
- [ ] Update `src/pages/[lang]/concert/[id].astro` to reserve 404 for missing event IDs and actual upstream 404 responses.
- [ ] Render `src/pages/[lang]/practical-info.astro` sections using existing content collection data and `Section.astro`.
- [ ] Remove unused practical-info local `Section` type if no longer needed.
- [ ] Extend `Layout.astro` with canonical and Open Graph metadata props.
- [ ] Add or reuse localized page descriptions for every route using `Layout.astro`.
- [ ] Update each localized route to pass the required metadata.
- [ ] Add localized accessibility label groups to `src/i18n/cs.ts` and `src/i18n/en.ts`.
- [ ] Replace hardcoded Czech labels in `Header.astro`, `GalleryOverlay.tsx`, and `InlineMiniGallery.tsx`.
- [ ] Create or select a shared gallery type location.
- [ ] Replace duplicated `GalleryImage` and `GalleryResource` definitions where it improves consistency.
- [ ] Remove `any` from `InlineMiniGallery.tsx` resource mapping.
- [ ] Ensure gallery images have meaningful alt/title values or intentional decorative empty alt text.
- [ ] Investigate moving full gallery data loading from client fetch to Astro/server-side rendering.
- [ ] If server rendering is adopted, update `src/pages/[lang]/gallery.astro` and `GalleryPage.tsx` so the page no longer needs `client:load` for data fetching.
- [ ] Guard or simplify the parallax loop in `Section.astro`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm astro check`.
- [ ] Run relevant tests once test coverage is added.

---

# Validation Checklist

- [ ] `pnpm lint` starts and completes source linting.
- [ ] Calendar list pages distinguish empty calendars from failed calendar requests.
- [ ] Concert detail pages return 404 only for missing routes/events, not generic upstream failures.
- [ ] Practical-info renders localized content from content collections.
- [ ] Every localized page has title, description, canonical URL, and Open Graph metadata.
- [ ] English pages no longer expose Czech-only interactive `aria-label` text.
- [ ] Gallery React code keeps only necessary client-side interaction.
- [ ] Gallery data types are not duplicated unnecessarily.
- [ ] Parallax behavior does not create repeated unmanaged animation loops.
- [ ] Astro-first architecture is preserved.
- [ ] No unrelated visual redesign is introduced.

---

# Notes

Prioritize `AUDIT-003` before broader work so lint can be used as a feedback loop. Prioritize `AUDIT-001` before gallery or metadata cleanup because it affects correctness of public concert flows.

Do not split static Astro components just because they are moderately sized. The audit explicitly found that the current general Astro composition is acceptable.
