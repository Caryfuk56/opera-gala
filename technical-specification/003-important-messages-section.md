# Task

Important messages section

---

# Goal

Add a new homepage section for important visitor notices.

After implementation, the homepage can show a localized `ImportantMessages.astro` section immediately after `ConcertsPreview`. The section is controlled by a temporary constant on the homepage, renders notice content from JSON, shows three messages initially, reveals additional messages with a "load more" control when needed, and links the Czech notice text "Prakticke informace" to the localized practical information page.

The practical information content must also be updated to clearly state that the concert venue is changing to the Valtice Castle Baroque Theatre.

---

# Requirements

- Create a new section component named `ImportantMessages.astro` in `src/components/sections`.
- Follow the existing section patterns in `src/components/sections`.
- Use Astro as the rendering layer.
- Do not introduce a React island.
- Use one accent background color, preferably `bg-accent-deep` or `bg-accent-wine`.
- Use a contrasting text color and larger text sizing than normal body copy.
- Place the section on the localized homepage immediately after `ConcertsPreview`.
- Add a temporary `const` on `src/pages/[lang]/index.astro` that enables or disables the section.
- Section title:
  - Czech: `Dulezita upozorneni`
  - English equivalent must be localized.
- Each message must render:
  - message title
  - publication date
  - message body
- Show three messages initially.
- If more than three messages exist, show a localized "load more" button.
- Store message content in JSON, not hardcoded inside the component.
- Support i18n for section UI labels and message content.
- The first Czech message must use the supplied content and publication date `20. 8. 2026`.
- In the first Czech message, `Prakticke informace` must link to the localized practical information page.
- Update `src/content/pages/cs/practical-info.md` with the venue-change information.
- Update `src/content/pages/en/practical-info.md` with equivalent venue-change information or pause for approved English wording before implementation.
- Respect Tailwind semantic tokens and extend the theme only if a missing semantic value is truly needed.

---

# Existing Implementation

- The localized homepage is `src/pages/[lang]/index.astro`.
- Homepage sections are imported and rendered in order:
  - `Hero`
  - `ConcertsPreview`
  - `AboutProject`
  - `EnsemblePreview`
  - `VenuePreview`
  - `GalleryPreview`
  - `Partners`
- `ConcertsPreview.astro` is a static Astro section using `bg-bg-primary`, container spacing, i18n strings, and no React.
- Other preview sections use direct Astro markup, semantic headings, Tailwind tokens, and localized links through `getPath`.
- `src/i18n/cs.ts` and `src/i18n/en.ts` hold UI labels and SEO text.
- `src/i18n/index.ts` provides `getI18n`, `getPath`, and localized route helpers.
- Content pages are stored in `src/content/pages/{lang}` and loaded through the `pages` content collection.
- `src/content/config.ts` already defines `pages` and `partners` collections.
- `src/pages/[lang]/practical-info.astro` renders markdown from `src/content/pages/{lang}/practical-info.md` through the shared `Section.astro`.
- Tailwind already defines accent tokens:
  - `bg-accent`
  - `bg-accent-deep`
  - `bg-accent-wine`
  - `bg-accent-wine-deep`

---

# Architecture Decision

Use a new Astro section backed by a data collection or typed JSON helper.

The section content is static data and should render server-side as HTML. React is not needed. The only interactive behavior is revealing more messages, which can be handled with a tiny progressive enhancement script inside `ImportantMessages.astro` or with a no-JS-friendly native disclosure pattern if the final design allows it.

Recommended content model: create localized JSON data under `src/content/important-messages`, either as one data collection containing localized fields or as separate locale-aware data entries. The component should receive `lang`, select the matching messages, and render only messages for the current URL language.

Keep UI labels such as section title and load-more text in `src/i18n/cs.ts` and `src/i18n/en.ts`. Keep editorial message bodies in JSON content.

---

# Impact Analysis

## Files to Modify

- `src/pages/[lang]/index.astro`
- `src/i18n/cs.ts`
- `src/i18n/en.ts`
- `src/content/config.ts`
- `src/content/pages/cs/practical-info.md`
- `src/content/pages/en/practical-info.md`

## Files to Create

- `src/components/sections/ImportantMessages.astro`
- `src/content/important-messages/messages.json` or equivalent localized JSON data file
- Optional narrow helper, for example `src/utils/importantMessages.ts`, only if JSON selection/validation would otherwise clutter the component

## Files Unaffected

- Existing React gallery components should not change.
- Existing calendar utilities should not change.
- Existing page routing should not change.
- No static assets are required.

---

# Risk Analysis

- The requested "load more" behavior introduces client-side behavior. Keep it minimal and scoped to this section.
- If JavaScript is disabled, hidden messages may be inaccessible unless the implementation uses a progressive enhancement strategy. Prefer rendering all messages in the HTML and hiding extras only when the enhancement script runs, or use an accessible native pattern.
- The project requires i18n. English message copy was not provided, so implementation must either add an approved English translation or ask for it before publishing.
- Message bodies include an inline localized link. Avoid brittle string replacement when possible; represent body content as structured blocks or markdown and sanitize/render it through an existing safe pattern.
- Styling on an accent background must maintain sufficient contrast for body text, dates, and links.
- Date formatting should not depend on browser locale if the date is pre-rendered. Store an ISO date such as `2026-08-20` and render it according to `lang`.
- Updating practical-info content may duplicate the same notice. Keep it concise and make sure it still reads naturally with the existing content.

---

# Implementation Strategy

Add `ImportantMessages.astro` as a static Astro section that accepts `lang`.

The component should load localized message data, select messages for the current language, and render them in publication order. Render the first three messages as initially visible. If more messages exist, render a localized button that reveals the remaining messages. The enhancement should preserve keyboard accessibility, update `hidden` or equivalent state correctly, and avoid a React bundle.

Use theme tokens for styling. A likely visual direction is `bg-accent-wine` or `bg-accent-deep` for the section, `text-text-primary` or another existing high-contrast token for primary text, and restrained contrast for dates. If contrast is insufficient, extend Tailwind with a semantic token rather than hardcoding arbitrary colors.

Store editorial notices in JSON. For the first notice, store the Czech title, ISO publication date, and body content with a structured link target for `practical-info`. UI labels remain in i18n dictionaries.

Update the localized homepage to import the section and place it immediately after `<ConcertsPreview lang={lang} />`, guarded by a temporary constant such as `const showImportantMessages = true;`.

Update practical-info markdown for Czech and English so the venue-change information is visible on the practical information page.

---

# Implementation TODO

- [ ] Add localized UI keys for important messages in `src/i18n/cs.ts` and `src/i18n/en.ts`.
- [ ] Add a data collection schema for important messages in `src/content/config.ts`, or document why a typed JSON helper is sufficient.
- [ ] Create JSON content for important messages with localized message data.
- [ ] Store dates in machine-readable ISO format and render localized display dates in the component.
- [ ] Represent the `Prakticke informace` link in a structured way or render message markdown through an existing safe markdown path.
- [ ] Create `src/components/sections/ImportantMessages.astro`.
- [ ] Render the section title, message title, publication date, and body content with semantic HTML.
- [ ] Style the section with an accent background token and high-contrast text.
- [ ] Show three messages initially.
- [ ] Add a localized "load more" control only when more than three messages exist.
- [ ] Implement the reveal behavior as minimal progressive enhancement inside the Astro component.
- [ ] Ensure the reveal control is keyboard accessible and has a visible focus state.
- [ ] Import `ImportantMessages.astro` in `src/pages/[lang]/index.astro`.
- [ ] Add a temporary homepage constant to enable or disable the section.
- [ ] Render the section immediately after `ConcertsPreview`.
- [ ] Update Czech practical-info content with the venue-change notice.
- [ ] Update English practical-info content with equivalent localized wording, or request approved English copy before implementing.
- [ ] Run `pnpm.cmd lint`.
- [ ] Run `pnpm.cmd typecheck` if available, otherwise run `pnpm.cmd exec astro check` or the closest existing project check.
- [ ] Run `pnpm.cmd build` as environment permits.
- [ ] Inspect the homepage in Czech and English at mobile and desktop widths.

---

# Validation Checklist

Before implementation is considered complete, verify:

- [ ] The homepage section appears immediately after concerts when the temporary constant is enabled.
- [ ] The section is absent when the temporary constant is disabled.
- [ ] The section title is localized.
- [ ] The first Czech notice uses the supplied content and date.
- [ ] `Prakticke informace` links to `/cs/practical-info`.
- [ ] English pages do not show Czech UI labels.
- [ ] Only three messages are visible initially when more than three exist.
- [ ] The load-more button appears only when needed.
- [ ] Revealed messages are keyboard and screen-reader accessible.
- [ ] No React island or unnecessary client JavaScript was introduced.
- [ ] Tailwind theme tokens are used for touched styling.
- [ ] Practical-info content clearly communicates the venue change.
- [ ] Lint/type/build validation has been attempted and any blockers are reported.

---

# Notes

- The user-provided Czech copy contains public-facing diacritics. Keep content files encoded as UTF-8 and preserve the wording exactly except for the structured link.
- The supplied request repeats the placement sentence; treat it as one requirement.
- The current terminal output displays some existing Czech files with mojibake, but the source files may still be UTF-8. The Coder should verify encoding before editing localized content.
- Suggested data shape can stay simple: an array of messages with `lang`, `title`, `publishedAt`, and body blocks, or one object keyed by language.
