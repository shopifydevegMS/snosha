# 04 — Area rules

Theme-specific details for each area are in the theme file under the T-heading named.

## 1. Schema, Theme Editor, localization

- Keep merchant content editable where practical: headings, text, labels, buttons, links, images (desktop + mobile), icons, videos/posters, products, collections, repeated cards, backgrounds, alignment, layout, spacing, width, visibility.
- Valid JSON (one stray comma breaks the page). No duplicate IDs. Clear, short labels within Shopify limits. Sensible defaults. Empty settings never produce broken markup.
- **New `range`:** `min`, `max`, `default` all on the step grid; at most 101 steps. Changing an existing range's `min`/`step` must keep every saved value valid across `templates/*.json` and `sections/*-group.json`.
- Blocks for repeatable content; `image_picker` instead of hardcoded images; Shopify video settings; product/collection pickers are authoritative for title and URL (no parallel manual title/link).
- Every section needs a valid preset that renders sanely.
- Don't add settings with no merchant value. Reuse the theme's section scaffold (theme file → T8) instead of inventing new systems.
- **Localization:** merchant-edited content needs no locale keys. Theme-owned UI strings use `{{ '<session>_ns.key' | t }}` — add **your own `<session>_` keys only**, to `en.default.json` first, then every peer locale with the identical path (missing peer → default-language fallback; a key only in a non-default locale never shows). Edits follow 05 §4–§5.
- **Schema labels:** match the file you're editing (plain text vs `"t:"` keys); never reference a `t:` key that doesn't exist.
- **Schema locale files (developer decision):** add or change `<session>_` schema keys **only** in `locales/en.default.schema.json` and `locales/ar.schema.json`. Never edit any other `locales/*.schema.json` file — other admin languages fall back to English. `MatchingTranslations` results from `shopify theme check` for those other schema locales are expected: report them, don't fix them.

## 2. Breakpoints and responsive

- Use only the theme's layout breakpoints (theme file → T3). A Figma frame width is not a breakpoint.
- Figma desktop frames → desktop tier; mobile frames → mobile tier. Tablet is usually not designed: infer it from Figma Auto Layout behavior (hug/fill/wrap), content constraints, the theme's tablet column defaults and fluid sizing — never just enlarged mobile or shrunk desktop.
- Never write a rule that only works at the screenshot width; no magic widths.
- A new breakpoint desyncs grid, type tokens and utilities — only as a flagged, approved exception.
- Check widths: 320, 375, 390, each breakpoint and the pixel below it, and the Figma desktop frame width.

## 3. RTL / LTR

- Direction mechanism and alignment-setting semantics: theme file → T10. Project languages and default locale: `03-project.md` §2.
- **When content is authored in an RTL language but the page direction follows a locale that can be LTR**, for every project section:
  1. Declare `direction: rtl; unicode-bidi: isolate` **once at each text-content boundary** (card / column / content wrapper). Don't rely on page `dir`, one wrapper rule, or per-leaf selector lists.
  2. **Direction and alignment are separate decisions.** Never bundle `text-align` into the direction rule. Centered elements stay centered; only edge-aligned content gets `start`/`end`.
  3. Keep geometry tracks (grids, flex rows, slider viewport/track) separate. Pin a track's direction only when a physical order must hold in every locale. Never override a slider's own container/track direction when its JS follows page `dir`.
  4. Allowed pattern: `direction: ltr` on a **geometry-only** container, `direction: rtl` restored on each text child. Document it.
- Logical properties (`margin-inline`, `padding-inline`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`). Physical values only with an explicit direction-class override and a reason.
- Theme alignment settings may be **logical** ("left" = `start`): in RTL content "right" then aligns to the left edge. Check the generated class before picking a value.
- **Mixed RTL text + numbers** (discounts, ratings, quantities): keep semantic order, give the element `direction: rtl; unicode-bidi: isolate` (or wrap the number in `<bdi>`); never `row-reverse` or reordering as a bidi fix.
- In JS, read `document.documentElement.getAttribute('dir')` (or the theme's helper) — never re-detect.
- Validate in every locale listed in `03-project.md` §2.

## 4. Typography

- Never hardcode `font-family`. Order: theme typography classes → theme font variables (theme file → T9) → inherit.
- Never put Liquid in a static `.css` asset (it isn't processed). Use inline `{% style %}`.

## 5. Section architecture and blank states

- One stable outer wrapper; keep `#shopify-section-{{ section.id }}` identity and `block.shopify_attributes`.
- No empty containers; semantic heading order; accessible buttons/links.
- Works when blocks are added, removed, reordered; no dependency on preset block IDs.
- Start new section files with a `<!-- name.liquid -->` comment.
- **Blank states are part of the deliverable:** empty picker in the editor (`request.design_mode`) → onboarding placeholder; on the live storefront → usually hide the section rather than render a broken link/price/image.

## 6. Images and assets

- No hardcoded final Figma images. Prefer `image_picker` → product images → collection images → metaobjects/metafields → asset files in the repo only when required (naming: 05 §1).
- Separate desktop/mobile images: mobile is an override falling back to desktop (`<picture>` + `<source media="(max-width: …)">`, or `image_mb | default: image`).
- `image_tag` / `image_url` with `widths`/`sizes` and explicit `width`/`height`; lazy-load below the fold; avoid layout shift; correct alt text.
- `placeholder_svg_tag` so a blank picker never breaks.
- Don't export what CSS can draw. Decorative elements: pseudo-elements where fitting, `pointer-events: none`, `aria-hidden="true"`. Meaningful images are never CSS backgrounds.

## 7. Sliders and carousels

- Slider components and the carousel edge fix: theme file → T12.
- Before touching a slider, inspect its DOM contract, init, data attributes, responsive config, navigation, pagination, editor re-init and destroy/rebuild.
- Preserve drag, swipe, keyboard, navigation, pagination, resize, dynamic blocks, editor reload. Init is idempotent and re-runs on `shopify:section:load`.
- **No second slider library.** No fake fixed card widths. Don't override internal slider variables without checking their use.
- Don't convert a grid to a slider, or a slider to a grid, unless asked.
- Restyle arrows/dots only inside your scope; keep the native elements (semantics, `aria-*`, `disabled` at ends, keyboard, RTL chevron flip).
- Slide counts come from the theme's column settings. A "peek" card: scoped slide `flex-basis` under your class on mobile, letting the native slider place it.
- Apply the theme's carousel edge fix to every product/collection/card carousel when the theme file defines one.

## 8. Product cards, money, cart

- Card dispatcher, card snippets, price snippets and cart flow: theme file → T13.
- Inspect all card snippets, dispatchers, schema options, editor selectors, and every card context (homepage, collection, search, related, quick view), plus wishlist, compare, ratings, badges, swatches, price, compare-at, sold-out, choose-options, add-to-cart, cart drawer.
- **Never assume the next card number.** Numbering is local to that exact dispatcher/selector: find the next free value there (including other sessions' additions); never reuse or hijack an occupied one.
- Pick the base by real markup and behavior, not looks. Preserve all native card functionality.
- Different add-to-cart position in Figma → reuse and reposition the native add-to-cart snippet; extend it with optional params that default to native behavior.
- Title clamps only inside your card scope with real-DOM selectors.
- A change to a shared sub-snippet hits every card — verify each variant still composes.
- Money only through the theme's canonical price snippets (Liquid `| money` filters on raw values) and its JS money formatter on raw integer cents. Never parse numbers from formatted text; never compute totals/tax/discounts client-side; never add another price snippet; never hardcode currency strings.
- Cart changes go through the theme's AJAX + Section Rendering + event flow; reuse its cart components.

## 9. Video and media

- Media components and their traps: theme file → T14.
- Reuse existing video/media implementations. Preserve poster, play/pause, a11y, mobile and editor behavior.
- **No autoplay** and no `video.play()` on load unless asked. No decorative play button without function.
- When the theme has a specialized media-commerce component (e.g. shoppable video), reuse its media lifecycle, product connection, add-to-cart path and slider; keep its full schema; add project presentation additively. Never trade a working player for a static wrapper or rebuild it from generic cards or third-party libraries.
- Verify real playback in the live preview; CSS can silently kill interaction.

## 10. JavaScript

- Editable vs minified files, module map, event bus, helpers: theme file → T11.
- **No JS when HTML/CSS or existing components can do it.** Never rewrite working JS for a visual change.
- Your JS goes in `assets/<session>.js` only (loading: 05 §3). Never edit the theme's shared JS files or another session's file. To change a base component's behavior, subclass it in your file.
- Before adding JS, find the closest existing isolated Web Component in the repo and copy its pattern: guarded `customElements.define` with a `<session>-` element name (grep all `assets/*.js` incl. minified bundles to avoid collisions), resilient + idempotent `connectedCallback` (rAF retry until children exist), per-instance state, full cleanup (listeners, observers, timers, rAF) in `disconnectedCallback`.
- Section-scoped listeners acting only inside your `<session>-` scope, no `document`-level state, no globals, JS identifiers prefixed (`<session>Slider`), no new libraries, progressive enhancement, keyboard support, the theme's helpers and event bus (never hardcoded event strings when the theme defines constants).
- Editor-only code: guard with `Shopify.designMode` / `request.design_mode`; react to `shopify:section:*` and `shopify:block:*` events.

## 11. Accessibility

- Semantic HTML, heading order, real `button`s, alt text, keyboard, visible focus, `aria-label` where needed, form labels, contrast. Keep native `sr-only` / `aria-*`.
- Decorative SVG/icons: `aria-hidden="true"`, empty `alt`, `pointer-events: none`.
- Duplicated visual content (e.g. a marquee's second track) is `aria-hidden` and never carries `block.shopify_attributes`.
- `prefers-reduced-motion` gets a truly static fallback.
- Keep focus management in dialog/drawer components.

## 12. Performance

Prefer existing assets, responsive images, Shopify image filters, lazy loading, minimal JS and DOM duplication, the theme's debounce/throttle/cache helpers. Avoid huge images, duplicated desktop/mobile markup, images without dimensions, new libraries, big inline scripts, repeated loops over the same data. No premature micro-optimization.

## 13. Page isolation

Every task names its out-of-scope areas.
- **Homepage:** no product/collection pages, no unrelated homepage sections.
- **Product page:** no main product form, variant selection, price, quantity, gallery or add-to-cart unless in scope.
- **Collection page:** no filters, sorting, search, pagination, grid/list controls or heading unless in scope. Reuse native facets — restyle, don't rebuild.
- **Shared globals** (announcement bar, header, footer, cart drawer, mobile toolbar) are cross-page: separate task, gated by a design option, verified on other pages and instances.

## 14. Integrations, metafields, security

- Metafields: reference by exact `namespace.key`, confirm usage by grepping theme code, guard the absent case (theme file → T16).
- App markup (wishlist, subscriptions, reviews, `@app` blocks) isn't theme-owned — keep extension points, don't restyle or rewire. Anything needing real reviews is blocked until the merchant names the app.
- Never expose secrets, tokens, customer data, private URLs or env values. `.shopify/` is local state — never reference or surface it.
- Never hardcode, regenerate, strip, relocate or log a theme license/activation code (theme file → T16).

**Don't implement when:** the task is audit/plan only · it needs renaming/removing a persisted identifier · it means editing minified output · it touches license code or exposes secrets · the active code path can't be confirmed · it depends on a blocked decision — implement the rest and report the blocked part.

## 15. Prohibited (summary)

- Editing any file before you have a session name; touching another session's files or gated blocks.
- Full site in one task; unrelated sections; starting the next section.
- Duplicating a section to edit it; skipping ladder steps; duplicating/creating a section without approval.
- Deleting/renaming setting IDs, removing blocks, resetting Customizer or template JSON.
- Hardcoding merchant images or editable content; inventing testimonials/reviews/marketing copy.
- Estimating values from screenshots when node data exists; treating mobile as scaled desktop; ignoring tablet.
- Copying absolute x/y or fixed frame sizes from frames without Auto Layout; adding a breakpoint.
- Broad selectors, global slider styling, a second slider library, grid↔slider conversion without instruction.
- Replacing native functionality with weaker custom code; inventing or hijacking card numbers.
- Breaking swipe/drag; autoplaying video.
- Unnecessary JS or libraries; editing minified or shared theme JS; broad refactors; overwriting manual changes; touching unrelated templates.
- Editing files through shell commands; rewriting whole existing files; restoring old versions.
- Claiming unperformed testing; running `shopify theme check -a`.
- A Figma asset URL in any production file.
- Editing `settings_data.json` beyond an additive color entry, or any theme stylesheet.
- Hardcoded colors, fonts or unneeded color settings; Liquid in a static `.css`.
- A class without the `<session>-` prefix; project CSS outside `assets/<session>.css`; a rule not anchored on your class; an ungated project class in an original file.
- `block.shopify_attributes` on a decorative copy.
- Editing `CLAUDE.md` or `.claude/rules/` without an explicit request.
