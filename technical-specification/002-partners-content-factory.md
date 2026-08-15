# Task

Partners content factory

---

# Goal

Replace the placeholder partner logo boxes in `Partners.astro` with real partner definitions loaded from `src/content/partners`.

After implementation, partner logos should be data-driven from JSON, rendered statically in Astro, preserve their image ratio, link to partner websites, and expose the partner name as a hover tooltip.

---

# Requirements

- Store partner definitions in `src/content/partners`.
- Use JSON for partner definitions.
- Support this structure:
  - `name: string`
  - `imgPath: string`
  - `url: string`
  - `dimensions?: { width: string; height: string }`
- Add two partners:
  - `Ticketportal`
    - `url`: `https://www.ticketportal.cz/`
    - `imgPath`: `src/assets/PLG_ticketportal_rgb_main_dark-mode.png`
  - `Zámek Valtice`
    - `url`: `https://www.zamek-valtice.cz/`
    - `imgPath`: `src/assets/NPU-zamek_valtice-CMYK.jpg`
- Images should have sensible default display dimensions.
- Image aspect ratio must be preserved.
- Optional dimensions must allow manual override per partner.
- On hover, the partner name should be visible as a tooltip.
- Partner logos should be clickable links.
- No React island or client JavaScript should be introduced.
- Keep Tailwind theme-token conventions where styling is static.

---

# Existing Implementation

- `src/components/sections/Partners.astro` renders five placeholder boxes using `Array.from({ length: 5 })`.
- The section title already uses `t.partners.title`.
- Both requested assets exist in `src/assets`:
  - `PLG_ticketportal_rgb_main_dark-mode.png`
  - `NPU-zamek_valtice-CMYK.jpg`
- `src/content/config.ts` currently defines only the `pages` content collection.
- Existing project pattern favors Astro components and static rendering for non-interactive content.

---

# Architecture Decision

Use Astro static rendering with a small partner data factory/helper.

The JSON file should remain the source of truth for partner metadata. A small TypeScript helper should load/resolve partner definitions and map `imgPath` strings to imported Astro image metadata using `import.meta.glob` or another Astro-compatible static asset mechanism.

`Partners.astro` should stay responsible only for rendering the section. It should not contain the partner data inline.

Do not use React. Native HTML links, images, and the `title` attribute are sufficient for the hover tooltip requirement.

---

# Impact Analysis

## Files to Modify

- `src/components/sections/Partners.astro`
- `src/content/config.ts`

## Files to Create

- `src/content/partners/partners.json`
- `src/utils/partners.ts` or equivalent small helper/factory

## Files Unaffected

- i18n dictionaries should not need new keys unless the Coder decides a non-native custom tooltip needs localized text. The partner names themselves come from content data.
- No page routes should need modification.
- No React gallery components should be touched.

---

# Risk Analysis

- Dynamic image paths in JSON cannot be passed directly to static imports unless resolved through an Astro-compatible asset map. The helper must fail clearly if a configured `imgPath` is unknown.
- Manual dimensions are content-controlled strings. Keep usage constrained to logo sizing only.
- If both width and height are provided, the rendered image should still preserve aspect ratio by fitting inside a sized container rather than stretching the image.
- External links should include `target="_blank"` only if paired with `rel="noopener noreferrer"`. Opening in the same tab is also acceptable if consistent with project preference.
- Native `title` tooltip is simple and meets the requirement, but it is not a full accessible tooltip pattern. The image/link must still have meaningful `alt` or `aria-label`.

---

# Implementation Strategy

Create a JSON file under `src/content/partners` containing the two partner definitions.

Extend `src/content/config.ts` with a `partners` data collection schema matching the requested shape. This keeps the content model explicit even if the Coder imports JSON directly.

Create a small helper/factory that:

- reads partner definitions,
- validates or types the shape,
- resolves each `imgPath` to the corresponding Astro image import,
- applies default display dimensions when `dimensions` is absent,
- exposes a render-ready list to `Partners.astro`.

Update `Partners.astro` to render the list as linked logos in a wrapping flex/grid layout. Use static dimensions/defaults, `object-contain`, and a wrapper that preserves ratio. Use the partner name for `alt`, link label, and hover tooltip.

---

# Implementation TODO

- [ ] Add `src/content/partners/partners.json` with Ticketportal and Zámek Valtice.
- [ ] Extend `src/content/config.ts` with a `partners` data collection schema.
- [ ] Create a small partner factory/helper for resolving JSON definitions to render-ready logo data.
- [ ] Ensure the helper has a default dimensions policy for logos without overrides.
- [ ] Ensure invalid `imgPath` values fail clearly during build/render.
- [ ] Update `Partners.astro` to remove placeholder boxes.
- [ ] Render each partner as an anchor containing an image.
- [ ] Preserve aspect ratio with `object-contain` and constrained sizing.
- [ ] Support optional width/height override without stretching the image.
- [ ] Add a hover tooltip using the partner `name`.
- [ ] Add meaningful `alt` text and accessible link labels.
- [ ] Add `rel="noopener noreferrer"` for any `target="_blank"` partner links.
- [ ] Run `pnpm.cmd exec tsc --noEmit --pretty false`.
- [ ] Run `pnpm.cmd lint`.
- [ ] Run `pnpm.cmd exec astro check`.
- [ ] Run `pnpm.cmd build` as environment permits.
- [ ] Visually inspect the partners section at desktop and mobile widths.

---

# Validation Checklist

Before implementation is considered complete, verify:

- [ ] `Partners.astro` no longer renders placeholder `Logo 1` boxes.
- [ ] Both requested partners render with real logos.
- [ ] Partner logos link to the configured URLs.
- [ ] Hovering a logo shows the partner name.
- [ ] Logos preserve their aspect ratio.
- [ ] Manual dimensions can be set in JSON without image distortion.
- [ ] The partner data is not hardcoded in `Partners.astro`.
- [ ] No React or client JavaScript was introduced.
- [ ] Accessibility requirements remain satisfied.
- [ ] Type checking, linting, and Astro check pass.
- [ ] Build is attempted and any environment-specific failure is reported clearly.

---

# Notes

- Prefer `src/content/partners/partners.json` for the JSON file.
- Suggested default logo sizing: a constrained logo area with `max-height` and `max-width`, using `object-contain`.
- The native `title` attribute is sufficient for the requested hover tooltip unless the Coder has a simple CSS-only tooltip pattern already available.
