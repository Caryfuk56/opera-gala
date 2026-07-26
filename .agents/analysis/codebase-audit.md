# Codebase Audit

## Executive Summary

Overall code quality is reasonable for a small Astro site: most page composition is static, components are readable, and React is mostly limited to gallery interaction. Broad refactoring is not justified.

The main concerns are targeted: calendar fetch failures are currently collapsed into empty/404 states, a public practical-info route appears incomplete, the lint quality gate is broken, SEO metadata is too thin for the stated project rules, and some i18n/accessibility strings are still hardcoded inside components.

Astro check completed successfully with 0 errors and 5 hints. `pnpm lint` currently fails before linting source files because of ESLint React Hooks plugin registration.

## Blocking Findings

### [AUDIT-001] Calendar API failures are reported as empty state or 404

**Location:** `src/utils/googleCalendar.ts:45-47`, `src/utils/googleCalendar.ts:73-75`, `src/pages/[lang]/concert.astro:29-31`, `src/pages/[lang]/concert/[id].astro:30-32`  
**Category:** Correctness / Error Handling  
**Confidence:** Confirmed

**Problem**

`fetchUpcomingEvents` catches all fetch errors and returns `[]`. `fetchEventById` catches all fetch errors and returns `null`. Callers wrap these calls in `try/catch`, but those catches will not run because the utility swallows the error.

**Why it matters**

A failed Google Calendar request is indistinguishable from “no upcoming concerts.” On detail pages, transient API failure becomes a 404, which can mislead users and search engines.

**Recommended direction**

Let calendar utilities distinguish not-found from request failure, either by throwing non-404 errors or returning a typed result state.

**Planner task**

Plan a calendar data error contract so list pages can show load errors and detail pages only return 404 for actual missing events.

## High Priority Findings

### [AUDIT-002] Practical info route loads content but does not render it

**Location:** `src/pages/[lang]/practical-info.astro:13-19`, `src/pages/[lang]/practical-info.astro:35-47`  
**Category:** Correctness / Content Rendering  
**Confidence:** Confirmed

**Problem**

The route fetches `pages/${lang}/practical-info` and reads `sections`, but renders only a `PageHeader` and a generic `<h1>`. The section content is unused.

**Why it matters**

The nav exposes Practical Info as a public page, but the page cannot show the content collection data it loads.

**Recommended direction**

Render practical-info content using the same static content-section approach as the about page, or remove unused content loading if the page is intentionally a placeholder.

**Planner task**

Plan practical-info rendering using existing content collection and `Section.astro` patterns.

### [AUDIT-003] ESLint quality gate is misconfigured

**Location:** `eslint.config.mjs:26-37`  
**Category:** Tooling / Maintainability  
**Confidence:** Confirmed

**Problem**

`pnpm lint` fails with: rule `react-hooks/rules-of-hooks` cannot find plugin `react-hooks`. The config registers the imported plugin as `reactHooks`, while the recommended rules reference `react-hooks/...`.

**Why it matters**

Lint cannot run at all, so style and React/Astro issues are not being checked.

**Recommended direction**

Register the React Hooks plugin under the rule namespace expected by its config.

**Planner task**

Fix ESLint plugin registration and verify `pnpm lint` reaches source diagnostics.

### [AUDIT-004] SEO metadata is below project requirements

**Location:** `src/layouts/Layout.astro:8-30`, route usage in `src/pages/[lang]/*.astro`  
**Category:** SEO / Architecture  
**Confidence:** Confirmed

**Problem**

`Layout.astro` only supports `title` and optional meta description. It does not render canonical URLs or Open Graph metadata. Most routes pass no description.

**Why it matters**

This conflicts with the project rule that every page should provide title, description, canonical URL, and Open Graph metadata.

**Recommended direction**

Extend layout metadata props conservatively and update pages to pass localized descriptions.

**Planner task**

Plan a minimal shared SEO metadata contract for localized Astro pages.

### [AUDIT-005] Gallery API is client-fetched despite server-rendered Astro setup

**Location:** `src/pages/[lang]/gallery.astro:16-21`, `src/components/gallery/GalleryPage.tsx:59-89`  
**Category:** Astro Architecture / Performance  
**Confidence:** High

**Problem**

The full gallery page hydrates with `client:load` and fetches `/api/gallery` in the browser. The app is already `output: "server"` with a Netlify adapter, so the page can likely fetch Cloudinary data server-side and hydrate only the modal behavior.

**Why it matters**

Users receive a loading skeleton and extra client JavaScript for data fetching that could happen before HTML is sent.

**Recommended direction**

Move gallery data loading to the Astro page or a server utility, then keep React only for image modal interaction.

**Planner task**

Investigate server-rendering gallery data while preserving interactive overlay behavior.

## Minor Findings

### [AUDIT-006] Some interactive labels bypass i18n

**Location:** `src/components/layout/Header.astro:31`, `src/components/layout/Header.astro:41`, `src/components/gallery/GalleryOverlay.tsx:152-217`, `src/components/gallery/InlineMiniGallery.tsx:196`, `src/components/gallery/InlineMiniGallery.tsx:269`  
**Category:** i18n / Accessibility  
**Confidence:** Confirmed

**Problem**

Several `aria-label` values are hardcoded in Czech inside shared components.

**Why it matters**

English pages expose Czech screen-reader labels, violating the URL-driven i18n rule.

**Recommended direction**

Add accessibility labels to the dictionaries and pass them into components.

**Planner task**

Plan localized accessibility labels for header and gallery controls.

### [AUDIT-007] Gallery image contracts are duplicated and weak in places

**Location:** `src/components/gallery/GalleryPage.tsx:7-11`, `src/components/gallery/GalleryOverlay.tsx:4-9`, `src/components/gallery/GalleryModal.tsx:5-10`, `src/components/gallery/InlineMiniGallery.tsx:72-85`  
**Category:** Types / Duplication  
**Confidence:** Confirmed

**Problem**

`GalleryImage` is duplicated across gallery components, and `InlineMiniGallery` maps API resources with `(res: any)` and empty alt/title values.

**Why it matters**

Changes to gallery data shape can drift between components, and empty image alt/title metadata lowers accessibility quality.

**Recommended direction**

Share a small gallery type module and type the API resource shape used by both gallery views.

**Planner task**

Plan a small shared gallery data contract without over-abstracting presentation components.

### [AUDIT-008] Parallax script can start repeated animation loops

**Location:** `src/components/ui/Section.astro:117-154`  
**Category:** Performance / Lifecycle  
**Confidence:** Medium

**Problem**

`initParallax` starts a recursive `requestAnimationFrame` loop and is also registered on `astro:page-load`. There is no guard or cancellation. Astro check also reports unused `scrollY` at line 123.

**Why it matters**

If Astro page transitions are enabled later, repeated page loads could accumulate animation loops.

**Recommended direction**

Guard initialization or avoid the perpetual loop unless parallax elements exist and need animation.

**Planner task**

Review parallax lifecycle and simplify it to one active loop.

# Testing Gaps

| Area | Location | Missing behavior coverage | Recommended test level | Priority |
| ---- | -------- | ------------------------- | ---------------------- | -------- |
| Calendar fetching | `src/utils/googleCalendar.ts` | API failure vs empty results vs 404 | Unit | High |
| Event parsing | `src/utils/googleCalendar.ts:131-183` | Ticket/program/subtitle parsing edge cases | Unit | High |
| Gallery grouping | `src/pages/api/gallery.ts` | Tag fallback, sorting, pagination | Unit | Medium |
| Gallery heading formatting | `src/components/gallery/GalleryPage.tsx:21-31` | Slug-to-date/title formatting | Unit | Minor |
| Practical info rendering | `src/pages/[lang]/practical-info.astro` | Content sections appear when present | Integration | High |

Most important: test the calendar utility before refactoring its error contract, because that behavior directly affects public concert routes.

# Refactoring Candidates

## Candidate: Calendar Data Contract

**Related findings:** AUDIT-001  
**Goal:** Make fetch failure, empty results, and not-found explicit.  
**Expected scope:** `src/utils/googleCalendar.ts`, concert list/detail pages, `ConcertsPreview.astro`.  
**Risk:** Medium.  
**Recommended order:** First.

## Candidate: Static Content Page Rendering

**Related findings:** AUDIT-002  
**Goal:** Reuse the about-page content-section rendering pattern for practical info.  
**Expected scope:** `src/pages/[lang]/practical-info.astro`, possibly a shared content section renderer.  
**Risk:** Low.  
**Recommended order:** After calendar fix or independently.

## Candidate: Gallery Data Boundary

**Related findings:** AUDIT-005, AUDIT-007  
**Goal:** Fetch gallery data server-side where practical and share minimal gallery types.  
**Expected scope:** gallery API/server utility, gallery page, gallery React components.  
**Risk:** Medium.  
**Recommended order:** After lint is restored.

# Things That Should NOT Be Refactored

The general Astro page composition is fine. Components like `Hero.astro`, `ConcertPanel.astro`, `PageHeader.astro`, and `ArtistMedallion.astro` are focused enough for the current site.

React usage in `GalleryOverlay` and `GalleryModal` is justified because modal state, keyboard handling, swipe handling, and thumbnail loading are real client interactions.

# Planner Backlog

## P1 - Fix Calendar Error Semantics

**Source findings:** AUDIT-001  
**Objective:** Prevent API failures from becoming empty lists or false 404s.  
**Constraints:** Preserve static-first Astro rendering and localized messages.  
**Planner should investigate:** How Netlify/server rendering should surface upstream API failures.  
**Acceptance direction:** Concert pages distinguish load error, no events, and missing event.

## P1 - Restore Lint

**Source findings:** AUDIT-003  
**Objective:** Make `pnpm lint` usable again.  
**Constraints:** Keep current ESLint 9 flat config.  
**Planner should investigate:** Correct plugin namespace for `eslint-plugin-react-hooks`.  
**Acceptance direction:** Lint runs against source files.

## P2 - Render Practical Info Content

**Source findings:** AUDIT-002  
**Objective:** Make practical-info display its content collection.  
**Constraints:** Use Astro components and existing dictionaries/content collections.  
**Planner should investigate:** Whether to extract shared markdown-section rendering from about page.  
**Acceptance direction:** Practical-info renders localized page content.

## P2 - Improve SEO Metadata

**Source findings:** AUDIT-004  
**Objective:** Add canonical and Open Graph metadata.  
**Constraints:** Localized routes need unique metadata.  
**Planner should investigate:** Where page descriptions should live.  
**Acceptance direction:** Layout supports the required metadata and pages pass it.

## P3 - Tighten Gallery Architecture

**Source findings:** AUDIT-005, AUDIT-007  
**Objective:** Reduce client data fetching and strengthen gallery types.  
**Constraints:** Keep React only for interaction.  
**Planner should investigate:** Whether Cloudinary calls can be reused by API and Astro page.  
**Acceptance direction:** Gallery data shape is typed once and full gallery avoids unnecessary `client:load` data fetching.

# Final Assessment

**Refactoring recommendation:** TARGETED

Implementation work can continue, but calendar error semantics and lint should be addressed first because they affect user-visible behavior and developer feedback. Add focused unit tests around calendar parsing/fetch behavior before structural refactoring. Practical-info rendering and SEO metadata are straightforward follow-up tasks.