# Task

Technical audit remediation plan

---

# Goal

Convert the audit findings into an ordered implementation plan that improves correctness, SEO, performance, accessibility, and developer experience while preserving the project's Astro-first architecture.

After implementation, calendar failures should be handled correctly, lint should run, public pages should have stronger SEO metadata, static pages should be explicitly prerendered where appropriate, gallery content should be less dependent on client-side fetching, and shared UI/accessibility issues should be cleaned up.

---

# Requirements

- Address findings in value-versus-effort order, not by broad refactoring.
- Keep Astro as the default rendering layer.
- Use React only for gallery/modal interactions that require client state.
- Do not introduce new dependencies unless a specific implementation blocker appears.
- Preserve localized `[lang]` routes and URL-driven language selection.
- Keep changes incremental and independently verifiable by batch.
- Add focused tests for regression-prone utility behavior where the project test setup allows it.
- Respect Tailwind semantic theme tokens when touching styling.

---

# Existing Implementation

- `src/utils/googleCalendar.ts` owns Google Calendar fetching, event date helpers, description parsing, and program sanitization.
- `src/pages/[lang]/concert.astro`, `src/pages/[lang]/concert/[id].astro`, and `src/components/sections/ConcertsPreview.astro` consume calendar data.
- `src/layouts/Layout.astro` renders only title and optional description metadata.
- Localized routes use `getStaticPaths`, but `astro.config.mjs` uses Netlify server output, so static paths are ignored unless pages opt into prerendering.
- `eslint.config.mjs` imports `eslint-plugin-react-hooks` but registers it under a namespace that does not match the plugin's recommended rules.
- `src/pages/[lang]/gallery.astro` hydrates `GalleryPage` with `client:load`; `GalleryPage.tsx` fetches `/api/gallery` in the browser.
- Gallery API grouping and Cloudinary search live in `src/pages/api/gallery.ts`.
- Gallery resource/image types are duplicated across gallery React components.
- Header and gallery controls include hardcoded Czech accessibility labels.
- `InlineMiniGallery.tsx` uses clickable thumbnail `div` elements.
- `Section.astro` and `VenuePreview.astro` contain custom parallax scripts.
- `Footer.astro` has an external link without `rel="noopener noreferrer"`.
- `CtaButton.astro` contains hardcoded colors outside theme tokens.

---

# Architecture Decision

Use a staged remediation plan with four independent batches.

1. Correctness and quality gates first: fix calendar error semantics and restore lint feedback before broader changes.
2. SEO foundation second: extend the shared Astro layout metadata contract and explicitly classify static/runtime routes.
3. Gallery performance and accessibility third: server-render gallery data where possible while retaining React for modal behavior.
4. Shared UI polish last: clean up lower-risk accessibility, lifecycle, security, and theme-token issues.

This keeps the implementation small, reviewable, and aligned with the existing Astro architecture. React remains limited to interactive gallery islands. Data fetching should move server-side only where it improves indexability or removes unnecessary browser work.

---

# Impact Analysis

## Files to Modify

- `src/utils/googleCalendar.ts`
- `src/pages/[lang]/concert.astro`
- `src/pages/[lang]/concert/[id].astro`
- `src/components/sections/ConcertsPreview.astro`
- `eslint.config.mjs`
- `src/layouts/Layout.astro`
- `src/i18n/cs.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`
- `astro.config.mjs`
- `src/pages/[lang]/index.astro`
- `src/pages/[lang]/about.astro`
- `src/pages/[lang]/artists.astro`
- `src/pages/[lang]/gallery.astro`
- `src/pages/[lang]/practical-info.astro`
- `src/pages/[lang]/contact.astro`
- `src/pages/[lang]/program.astro`
- `src/pages/api/gallery.ts`
- `src/components/gallery/GalleryPage.tsx`
- `src/components/gallery/GalleryModal.tsx`
- `src/components/gallery/GalleryOverlay.tsx`
- `src/components/gallery/InlineMiniGallery.tsx`
- `src/components/layout/Header.astro`
- `src/components/layout/Footer.astro`
- `src/components/ui/Section.astro`
- `src/components/sections/VenuePreview.astro`
- `src/components/ui/CtaButton.astro`
- `tailwind.config.mjs`

## Files to Create

- A small shared gallery type/helper module if needed, for example `src/utils/gallery.ts` or `src/types/gallery.ts`.
- Optional SEO helper module if `Layout.astro` metadata logic becomes too large, for example `src/utils/seo.ts`.
- Optional focused test files for calendar parsing/fetching and gallery grouping if test tooling is already available or added by project decision.

## Files Unaffected

- Static asset files should not need changes except if a social preview image is selected from existing assets.
- Existing markdown content should only be touched if page descriptions need to be completed.
- React modal behavior should remain conceptually intact; only props/types/accessibility should change.

---

# Risk Analysis

- Calendar error contract changes affect all concert surfaces. The Coder must preserve empty-state behavior for real empty event lists.
- Lint config repair may reveal unrelated diagnostics. Treat newly surfaced source lint findings as separate work unless they block the planned batches.
- SEO metadata needs a reliable canonical origin. If no production URL is configured, the Coder should add a single project-level constant or environment variable rather than hardcoding URLs in pages.
- Prerendering must be applied selectively. Concert detail routes may need to remain server-rendered because event IDs come from Google Calendar.
- Gallery server rendering can accidentally duplicate Cloudinary fetch logic. Shared helper extraction should stay narrow.
- Parallax lifecycle changes require visual review because they can alter page feel.
- Theme-token cleanup in CTA buttons may slightly change visual output; verify against existing design.

---

# Implementation Strategy

Implement in batches.

Batch 1 creates a safer calendar data boundary and restores developer feedback. Calendar utility functions should either throw meaningful errors or return a typed result that distinguishes success, empty, not found, and upstream failure. Callers should render localized list errors and only 404 true missing detail events.

Batch 2 extends shared SEO capabilities in Astro. `Layout.astro` should own the common metadata rendering and pages should pass localized titles/descriptions. Static pages should explicitly opt into prerendering; runtime pages should be intentionally left server-rendered.

Batch 3 changes gallery data flow. Move Cloudinary/gallery fetching and grouping into a reusable server-side utility where practical. Render gallery sections in Astro or server-prepared data so initial HTML contains meaningful content. Keep React for thumbnail modal state, keyboard navigation, and overlay interactions. Convert inline thumbnail controls to semantic buttons and type the shared gallery contract.

Batch 4 applies small shared cleanup: localized aria labels, parallax lifecycle guard/cleanup, safe external-link attributes, and CTA token normalization.

---

# Implementation TODO

- [ ] Batch 1: Update calendar utility error contract.
- [ ] Batch 1: Update concert list, concert detail, and homepage preview callers to use the new contract.
- [ ] Batch 1: Ensure list pages show load errors for upstream failures and empty states only for true empty results.
- [ ] Batch 1: Ensure detail pages return 404 only for confirmed missing event IDs.
- [ ] Batch 1: Add focused tests for calendar fetch outcomes and description parsing if test tooling is available.
- [ ] Batch 1: Fix React Hooks ESLint plugin namespace in `eslint.config.mjs`.
- [ ] Batch 1: Run `pnpm.cmd lint` and triage any newly surfaced diagnostics separately.
- [ ] Batch 2: Define a minimal SEO metadata prop contract for `Layout.astro`.
- [ ] Batch 2: Add canonical URL, meta description fallback, Open Graph metadata, and Twitter card metadata.
- [ ] Batch 2: Add localized metadata strings for pages that currently lack descriptions.
- [ ] Batch 2: Add language alternate handling consistently with existing i18n routing.
- [ ] Batch 2: Classify routes as static or runtime.
- [ ] Batch 2: Add `prerender = true` to static localized pages where appropriate.
- [ ] Batch 2: Keep dynamic concert routes server-rendered unless a reliable build-time event ID strategy is chosen.
- [ ] Batch 2: Add `MusicEvent` JSON-LD on concert detail pages using only real event data.
- [ ] Batch 2: Add Organization/Place structured data only where supported by existing content.
- [ ] Batch 3: Extract shared gallery resource/response types.
- [ ] Batch 3: Remove `any` from inline gallery resource mapping.
- [ ] Batch 3: Share Cloudinary gallery fetch/grouping logic between API and server-rendered gallery page.
- [ ] Batch 3: Render gallery headings and thumbnail data in initial HTML.
- [ ] Batch 3: Remove or reduce `client:load` from the full gallery page.
- [ ] Batch 3: Preserve React modal behavior for image opening, closing, keyboard navigation, and swipe handling.
- [ ] Batch 3: Convert inline gallery thumbnail clickable `div` elements to buttons.
- [ ] Batch 3: Add localized accessible labels for gallery thumbnail and navigation controls.
- [ ] Batch 4: Move hardcoded header/gallery aria labels into dictionaries.
- [ ] Batch 4: Add `rel="noopener noreferrer"` to footer external links.
- [ ] Batch 4: Guard or clean up parallax scroll/animation listeners.
- [ ] Batch 4: Respect reduced-motion preferences for parallax where feasible.
- [ ] Batch 4: Move CTA hardcoded colors into Tailwind theme tokens or named token-backed classes.
- [ ] Final: Run TypeScript, lint, and build/check commands as environment permits.
- [ ] Final: Manually inspect key pages in Czech and English: home, concert list, concert detail, gallery, about, practical info.

---

# Validation Checklist

Before implementation is considered complete, verify:

- [ ] Calendar API failure does not render as a true empty state.
- [ ] Calendar event lookup failure does not become a false 404.
- [ ] `pnpm.cmd lint` loads configuration successfully.
- [ ] `pnpm.cmd exec tsc --noEmit --pretty false` passes.
- [ ] Static localized routes no longer emit ignored `getStaticPaths()` warnings.
- [ ] Every public page has title, description, canonical, and Open Graph metadata.
- [ ] Concert detail pages include valid structured data based on real page content.
- [ ] Gallery content appears in initial HTML or is otherwise intentionally justified.
- [ ] React remains limited to real interactive gallery/modal behavior.
- [ ] Inline gallery thumbnails are keyboard accessible.
- [ ] English pages do not expose Czech-only aria labels.
- [ ] External blank-target links include safe `rel` attributes.
- [ ] Tailwind theme tokens are used for touched styling.
- [ ] Changes remain minimal and follow `AGENTS.md`.

---

# Notes

- Existing TypeScript check passed before planning.
- `astro check` and build may hit Netlify `.netlify` Windows permission/symlink issues; treat those as environment/tooling validation blockers unless reproduced in CI.
- Do not broaden this work into a redesign. The existing Astro page composition is mostly appropriate.
- If implementation time is limited, complete Batch 1 first, then Batch 2 metadata, then the gallery work.
