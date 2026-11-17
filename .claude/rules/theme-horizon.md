# Theme file — Horizon by Shopify

Verified facts about the base theme and how to work with it, used by every other rule file through the fixed headings **T1–T17**.

**Contract for replacing this file:** a theme file for another theme is named `theme-<theme>.md`, keeps headings T1–T17 with the same numbers and topics, in this order (the other rule files refer to them by number), and holds only facts and working conventions for that theme — nothing about a specific project. Write "Not applicable" under a heading the theme has no equivalent for. Keep exactly one `theme-*.md` in `.claude/rules/`. Facts that differ in a given repo go in `03-project.md` → "Theme-file deviations", not here.

Facts below were verified on Horizon **4.5.0** (github.com/Shopify/horizon, November 2026). Horizon changes fast between versions — re-verify against the repo, above all T7 (colors), which changed in 2026.

**How Horizon differs from feature-rich themes:** Horizon has few, generic sections, and almost everything on a page is built from **theme blocks** nested inside them (text, button, icon, image, group, product card…). There are no "Design 1–12" style selects, no tablet column setting and no separate mobile spacing. To get output as organized and as merchant-friendly as a feature-rich theme, follow the build strategy and settings standard in **T8**.

## T1. Identity

- `config/settings_schema.json` → `theme_info`: `theme_name` "Horizon", `theme_author` "Shopify", `theme_version` 4.x.
- Docs: https://help.shopify.com/manual/online-store/themes · source: https://github.com/Shopify/horizon
- Online Store 2.0 with theme blocks everywhere: sections render `{% content_for 'blocks' %}`, most sections accept `@theme` and `@app` blocks, and blocks nest inside blocks.
- Free Shopify theme that receives updates — every edit to a theme file makes updates harder to merge, so keep native-file changes minimal and gated (01 §4).

## T2. Namespace

- **No global prefix.** Classes, custom elements and snippets use plain names (`section`, `spacing-style`, `product-card`, `slideshow-component`, `text-component`). Private blocks start with `_`.
- Because there is no namespace, check every new class, element and variable name against the theme with grep before using it. A session name must not equal a common theme word (`section`, `header`, `card`, `product`, `group`, `text`).

## T3. Breakpoints and column settings

- Layout breakpoints: **750px** (`min-width: 750px` / `max-width: 749px`) and **990px** (`min-width: 990px` / `max-width: 989px`). Tiers: mobile < 750 · tablet 750–989 · desktop ≥ 990. A few components use extra widths (1200, 1400, 1600) — follow them only inside those components.
- Some layouts respond to **container queries**, not the viewport (`@container resource-list …`, `@container resource-list-carousel …`): test cards at real container widths.
- Column settings: `columns` (desktop range) and `mobile_columns` (`1` / `2`); carousels add `mobile_card_size` (`60cqw` / `44cqw`). **There is no tablet column setting** — see T8.
- JS helpers in `@theme/utilities`: `isMobileBreakpoint()`, `isDesktopBreakpoint()`, `mediaQueryLarge`.

## T4. Global CSS loader

- `snippets/stylesheets.liquid` (rendered in `<head>` from `layout/theme.liquid`): preloads `overflow-list.css` and loads `base.css`.
- Add the session CSS line (05 §3) after the `base.css` line in this snippet, after any other session's line.

## T5. Theme stylesheets

- Never edit `assets/base.css`, `assets/overflow-list.css`, `assets/template-giftcard.css`, or any `{% stylesheet %}` tag in theme files.
- **Section, block and snippet CSS lives in `{% stylesheet %}` tags** (150+ files). Shopify bundles them into one `styles.css`, subsets it per page, and injects it through `{{ content_for_header }}` — which comes **after** `stylesheets.liquid` in `<head>`. So theme component CSS always loads after your session file and wins every tie: always out-rank (01 §5).
- Liquid isn't rendered inside `{% stylesheet %}` / `{% javascript %}` tags.
- Theme CSS uses native CSS nesting (`&:hover`, `&.spacing-style` in `base.css`), so the session file may use it too.
- Many components set their values through **inline `style` attributes** holding CSS variables (`spacing-style`, `layout-panel-style`, `size-style`, `gap-style`, `border-override`) — see T15.

## T6. Design tokens and color variables

- Global variables come from `snippets/theme-styles-variables.liquid` and `snippets/color-palette.liquid`.
- Colors: `--color-background`, `--color-foreground`, `--color-border`, `--color-primary-button-*`, `--color-secondary-button-*`, `--color-input-*`, `--color-variant-*`… These hold **full color values** (`#hex` / `rgb(...)`): use `var(--color-foreground)` directly. Each base color also has an `-rgb` triplet for opacity: `rgb(var(--color-foreground-rgb) / var(--opacity-40))`.
- Sections and blocks re-scope colors through a `.color-custom-<id>` class (from `snippets/contrast-override.liquid`), so `var(--color-foreground)` inside a section already gives that section's text color.
- Typography: `--font-body--family|style|weight`, `--font-heading--family|style|weight`, `--font-accent--*`, `--font-h1--spacing`…`--font-h6--spacing`, `--font-size--*`.
- Spacing: `--gap-3xs`…`--gap-3xl`, `--padding-3xs`…`--padding-5xl`, `--margin-2xs`…`--margin-6xl`, `--spacing-scale` (0.7 below 750px), `--gap-scale`.
- Layout: `--page-width`, `--page-margin` (16px mobile, 40px from 750px), `--page-content-width`, `--util-page-margin-offset`.
- Opacity steps: `--opacity-*`.

## T7. Colors

- **Horizon 4.x uses a color palette, not color schemes.** `config/settings_schema.json` has one `color_palette` setting (`settings.color_palette.background`, `.foreground`, `.color1`, `.color2`… — named entries saved in `config/settings_data.json`), plus global color settings for page, buttons, inputs, variants, drawers, popovers, badges.
- Sections and blocks apply colors with their own `color` settings — e.g. `background_color` on sections, `background_color` / `text_color` on blocks, `custom_button_background` / `custom_button_text` on buttons — usually blank ("Default") so they inherit, and with defaults that may reference the palette (`"default": "{{ settings.color_palette.foreground }}"`).
- **Smart contrast:** when a section or block gets a custom background, `contrast-override` picks a readable text color automatically unless a text color is set. Check the rendered text color, not just the background.
- **Older Horizon versions** (before the 2026 color-palette change) use `color_scheme_group` schemes instead. If `settings_schema.json` contains `color_scheme_group`, record that in `03-project.md` → "Theme-file deviations" and use the scheme workflow: existing scheme through the section's scheme setting → new scheme `scheme-<session>-<purpose>` → one-off color setting.
- **Order of choice** when Figma needs a color (palette version):
  1. Leave the native color setting blank when the inherited color already matches Figma.
  2. Set the native color setting of that section or block (`background_color`, `text_color`, button colors…) to the Figma value — this is native merchant-facing configuration, not hardcoding. Prefer a value that is in the palette.
  3. A color Figma uses across several sections that the palette doesn't have → add it as a new palette entry in `config/settings_data.json` (additive, 01 §6), then use it.
  4. A color no native setting can reach (e.g. a decorative line inside a block) → a `<session>` color setting next to your design option, default = the Figma value or a palette reference, emitted as a `--<session>-` variable.
  - Never write a color value in CSS.

## T8. Section scaffold and build strategy

**Native scaffold (reuse it, never re-invent it):**
- Generic section wrapper `snippets/section.liquid`: `.section.section--{{ section_width }}` (`page-width` / `full-width`) on a 3-column CSS grid (margin / content / margin), background media, border, overlay, then `.spacing-style.layout-panel-flex` holding the blocks.
- Shared section settings: `section_width`, `section_height` (+ `section_height_custom`), `content_direction` (`column` / `row`), `vertical_on_mobile`, alignment selects, `gap`, `background_color` / `background_media` / `background_image` / `video`, `toggle_overlay` / `overlay_*`, `border*`, `border_radius`, `padding-block-start`, `padding-block-end`.
- Spacing helper: `{% render 'spacing-style', settings: section.settings %}` in a `style` attribute on a `.spacing-style` element. Values above 20px are multiplied by `--spacing-scale` (0.7 below 750px), so mobile padding shrinks automatically.
- Layout helpers: `layout-panel-style`, `gap-style`, `size-style`, `border-override`, `typography-style`.
- Blocks: `{% content_for 'blocks' %}` (dynamic) and `{% content_for 'block', type: '…', id: '…' %}` (static — must be declared in the preset with the same id). A block's `type` is its filename minus `.liquid`; `_` blocks are private.
- Image helpers: `snippets/image.liquid`, `snippets/media.liquid`, `snippets/icon-or-image.liquid`; `placeholder_svg_tag` for blank pickers.

**Build strategy (how to reach Figma with the existing-first ladder):**
1. **Configure native first.** Most Figma sections can be built from a native section (`section`, `hero`, `product-list`, `collection-list`, `slideshow`, `carousel`, `media-with-content`, `marquee`, `product-hotspots`, `featured-product`…) plus nested native blocks (`group`, `text`, `button`, `icon`, `image`, `video`, `spacer`, `_divider`). This is ladder step 1 — the result lives in the template JSON (01 §8).
2. **Native settings before CSS.** Use block settings for typography (`type_preset` h1–h6 / paragraph / rte, `font`, `font_size`, `line_height`, `letter_spacing`, `case`), width, alignment, padding, colors and borders before writing any CSS.
3. **Design option for what settings can't reach.** Add your design option (01 §4) on the section (and, if needed, on a repeated block) and style the rest in your session CSS.
4. **Repeated card structures** (a feature card, ingredient card, testimonial card…): first a `group` block holding `icon` / `image` / `text` blocks, configured once and repeated in the template. If the merchant would have to manage more than two nesting levels per card, or the card needs a fixed structure, create a private block `blocks/_<name>.liquid` (unprefixed — 05 §1; ladder step 6) that renders the native snippets inside and exposes flat settings (icon / image_picker, title, text, link).
5. **No section-level design select exists** in Horizon sections — always add one via 01 §4 (`design`; check the id is unused first).

**Settings standard for project additions** (so merchants get the controls a feature-rich theme gives) — add only what the Figma design actually needs, all defaulting to native behavior:
- **Tablet columns:** when Figma's desktop columns don't fit at 750–989px, add `<session>_columns_tablet` (range) next to the native `columns`, active only with your design option.
- **Mobile spacing:** native padding scales by 0.7 below 750px. When the mobile Figma value differs from that, add `<session>_padding_mobile_top` / `<session>_padding_mobile_bottom` ranges (blank or off = native scaling).
- **Card controls:** card radius, card padding, image aspect ratio, icon size — as ranges/selects on the repeated block, only when Figma needs them and no native setting exists.
- Group settings under `header` settings with clear labels; keep `range` values on step (01 §8).

## T9. Typography

- Global fonts: `type_body_font`, `type_subheading_font`, `type_heading_font`, `type_accent_font` (font pickers in Theme settings → Typography), plus per-level size, line height, letter spacing and case for h1–h6 and paragraph.
- Variables: `--font-body--family`, `--font-heading--family`, `--font-accent--family` (and `--style`, `--weight`).
- In text blocks, choose a `type_preset` (`h1`–`h6`, `paragraph`, `rte`) that matches Figma before switching to `custom` with `font` / `font_size` overrides.

## T10. Direction (RTL / LTR)

- `<html dir="{{ request.locale.direction | default: 'ltr' }}">` in `layout/theme.liquid` — direction follows the storefront locale automatically. Arabic (`ar.json` / `ar.schema.json`) and Hebrew ship with the theme; editor labels are translated.
- If the default locale is LTR (e.g. English) and content is authored in an RTL language, the page is LTR — apply 04 §3.
- Theme CSS mixes logical properties with `[dir='rtl']` overrides (35 in theme CSS). Layout alignment settings use flex values (`flex-start` / `center` / `flex-end`), which follow the writing direction; the text block uses Shopify's `text_alignment` setting type. Check the rendered result in both directions.
- JS: `isRTL()` and `getDirectionMultiplier()` from `@theme/utilities`.

## T11. JavaScript

- **No minified files** — every `assets/*.js` is readable, but every one is a shared theme file: never edit any of them. Extend behavior from your session JS (05 §3) by importing from the import map and subclassing.
- Import map in `snippets/scripts.liquid`: `@theme/component`, `@theme/events`, `@theme/utilities`, `@theme/dialog`, `@theme/focus`, `@theme/morph`, `@theme/section-renderer`, `@theme/section-hydration`, `@theme/money-formatting`, `@theme/product-form`, `@theme/variant-picker`, `@theme/media-gallery`, `@theme/quick-add`, `@theme/scrolling`, `@theme/scroll-container`, `@theme/performance`, `@theme/theme-drawer`… plus `@shopify/events` (Shopify standard events, from the CDN).
- Components extend `Component` from `@theme/component`: child elements are reached through `ref="name"` attributes (`this.refs.name`; `ref="items[]"` for arrays), and declarative listeners use `on:click="/method"`-style attributes. Copy an existing component (e.g. `assets/marquee.js`) for structure, and register with `if (!customElements.get('<session>-x')) customElements.define(…)`.
- Events: `ThemeEvents` in `@theme/events` (media started playing, quantity selector update, zoom media, mega menu hover, cart section restored, slideshow select) and **Shopify standard events** from `@shopify/events` for commerce: `StandardEvents.cartLinesUpdate`, `cartDiscountUpdate`, `cartNoteUpdate`, `productSelect`, `searchUpdate`… Never hardcode event strings.
- Helpers in `@theme/utilities`: `debounce`, `throttle`, `requestIdleCallback`, `yieldToMainThread`, `fetchConfig`, `prefersReducedMotion`, `onDocumentLoaded`, `isClickedOutside`, `isRTL`, `isMobileBreakpoint`, `ResizeNotifier`, `preloadImage`… Money: `formatMoney()` from `@theme/money-formatting`.
- Section re-rendering uses `@theme/section-renderer` and DOM morphing (`@theme/morph`): your JS must survive a section's DOM being morphed (idempotent `connectedCallback`, no cached nodes outside refs).
- Theme-wide scripts load as modules from `snippets/scripts.liquid`; a few sections load their own module scripts.

## T12. Sliders and carousels

- `slideshow-component` (`assets/slideshow.js`) rendered by `snippets/slideshow.liquid` (params: slides, controls, autoplay, infinite, `slideshow_gutters`, slide_count, slide_size…) with `slideshow-arrows` / `slideshow-controls` snippets (dots or counter). Also `layered-slideshow-component`, `marquee-component`, `scroll-hint` / scroll container.
- Native carousels: `product-list`, `collection-list` (`layout_type: carousel`, `carousel_on_mobile`), `carousel` section, `slideshow` section — rendered through `snippets/resource-list-carousel.liquid`.
- **Carousel edges:** native resource carousels already run through the page margin — `resource-list-carousel` passes `slideshow_gutters: 'start end'` and offsets with `--util-page-margin-offset`. **Don't apply any edge fix to them.** A custom carousel must render through `snippets/slideshow.liquid` with `slideshow_gutters: 'start end'` to get the same behavior; never one-sided negative margins or `100vw`.
- Slider direction follows `isRTL()` — never override track direction.

## T13. Product cards, price, cart

- Cards are **composed from blocks**: `_product-card` (inside `product-list` and collection grids) and the standalone `product-card` block, each holding child blocks — `_product-card-gallery`, `product-title`, `price`, `swatches`, `review`, `sku`, `text`, `_product-card-group`, `buy-buttons` (in `_product-card`), `custom-liquid`, `@app`. Rendering: `snippets/product-card.liquid`; collection/search grid: `snippets/product-grid.liquid` from `sections/main-collection.liquid` / `search-results.liquid`; other resources: `snippets/resource-card.liquid`.
- A different card design = configure its child blocks and order in the template JSON first; then your design option on `_product-card` (or the section) for what settings can't reach. Global card settings: `quick_add`, `mobile_quick_add`, `show_second_image_on_hover`, `product_card_carousel`, `product_corner_radius`, `card_corner_radius`, `card_hover_effect`, badge settings.
- Price: `snippets/price.liquid` (cards and product info), `snippets/format-price.liquid` (formatting, with the currency-code settings), `snippets/unit-price.liquid`; JS `formatMoney()` in `@theme/money-formatting`; `product-price` component updates prices on variant change.
- Add to cart: `add-to-cart` / `buy-buttons` blocks, `product-form-component`, `quick-add-component`, `fly-to-cart`.
- Cart: `cart-items-component`, `cart-drawer-component`, `cart-icon`; listen to `StandardEvents.cartLinesUpdate` etc. Cart type and drawer behavior come from global settings (`cart_type`, `auto_open_cart_drawer`).

## T14. Media and video

- Blocks: `image`, `video`, `_media-without-appearance`, `_product-media-gallery`; snippets `media.liquid`, `video.liquid`, `background-media.liquid`; components `deferred-media`, `video-background-component`, `media-gallery`, `zoom-dialog`, `drag-zoom-wrapper`, `product-model`.
- `hero` supports two media slots with separate mobile media (`custom_mobile_media`, `*_mobile` settings) — reuse it for desktop/mobile image pairs.
- Media playback emits `ThemeEvents.mediaStartedPlaying`.

## T15. Known traps

- **Inline CSS variables win over your stylesheet variables.** Components get `--padding-block-start`, `--gap`, widths and alignment as inline `style` variables. Redefining the variable on the same element in CSS loses; set the **property** itself (higher specificity) or change the native setting instead.
- Component CSS from `{% stylesheet %}` always loads after your file (T5) — double the scope class.
- `--spacing-scale` shrinks padding below 750px: a Figma mobile padding equal to the desktop value will look smaller unless handled (T8 settings standard).
- Section content sits in the middle column of the `.section` grid; full-bleed children need the theme's full-width classes or `section_width: full-width`, not negative margins.
- The header is measured by `ResizeObserver`s that write `--header-height` / `--header-group-height` (`assets/header.js`, `layout/theme.liquid`) → no border, padding or margin added to `header-component`; use `box-shadow: inset` for hairlines.
- `accordion-custom` controls `<details>` — check `assets/accordion-custom.js` before sizing or padding `<details>`; style `summary` and the content instead.
- `overflow-list` uses a declarative shadow root — style it only through its `part` names (`::part(list)`, `::part(more)`…) and variables.
- Custom backgrounds trigger smart contrast (T7) — your text colors may be replaced if you only change the background.
- Container queries (T3) mean a card can switch layout at a container width, not a viewport breakpoint.

## T16. Integrations, metafields, license

- Metafields read by the theme: `product.metafields.reviews.rating`, `reviews.rating_count` (standard review metafields used by the `review` block), `metafields.shopify.disclosure`. Confirm others by grepping theme code.
- `@app` blocks are accepted by most sections and by `group` / product-card blocks.
- No license or activation code.

## T17. Legacy and near-duplicate files

- `blocks/product-card.liquid` (standalone) vs `blocks/_product-card.liquid` (inside lists) — different settings and children.
- `_content` vs `_content-without-appearance`, `_media-without-appearance` vs `image` / `video`, `_heading` vs `text` with a heading preset.
- `sections/section-rendering-product-card.liquid` / `section-rendering-quick-add.liquid` serve the Section Rendering API — not page sections.
- `sections/_blocks.liquid` is the generic blocks-only section.
- Several editorial/bento grid snippets (`editorial-*-grid`, `bento-grid`) belong to `layout_type` options of list sections.
- Always confirm the active path by grepping `templates/` and `sections/*-group.json`.
