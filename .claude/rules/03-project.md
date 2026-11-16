# 03 — Project facts

Facts specific to this project. Where this file and the theme file disagree, **this file wins**. Change it only when the developer asks; propose new facts under "Suggested rule updates" in your final report.

## 1. Identity

- Project: **Snosha** · repo `shopifydevegMS/snosha` (https://github.com/shopifydevegMS/snosha.git, branch `main`) · Shopify theme: **Not verified** — the repo doesn't name the store theme; confirm in Shopify admin → Online Store → Themes.
- Base theme: **Horizon 4.4.0 by Shopify** (from `config/settings_schema.json` → `theme_info`). Theme file in use: `.claude/rules/theme-horizon.md`.
- GitHub sync: **Not detected** — `git log` (as of 2026-11-16) has one commit, `735f73b push horizon theme`, and no "Update from Shopify for theme …" commits. Treat the repo as manually pushed; whether the store theme is connected to this repo through the Shopify GitHub integration is unverified.
- **No project plan file** unless the developer asks. Figma is the section inventory; each task's final report is the record.

## 2. Language and direction

- Content language and direction: **Arabic (RTL)**. Target storefront language: Arabic.
- Storefront locales: the 47 stock Horizon storefront files in `locales/*.json` — default `en.default.json`; RTL ones `ar.json`, `he.json`, `ur.json`. Schema locales: 36 stock `locales/*.schema.json` files, default `en.default.schema.json` (includes `ar.schema.json`). No project locale keys exist yet.
- Default locale and resulting page direction: the theme's default locale file is **English (`en.default.json`, LTR)**. The page `dir` follows the storefront locale (`layout/theme.liquid`: `dir="{{ request.locale.direction | default: 'ltr' }}"`). The store's primary published language is set in Shopify admin and **can't be read from the repo — unverified**. If Arabic is the primary storefront language, pages render `dir="rtl"`; any English/LTR locale renders the Arabic content inside an LTR page, so 04 §3 applies to every project section either way.
- Check every layout change in: **Arabic (`ar`, RTL)** and **English (`en`, LTR)**.

## 3. Figma

- File: `1fqyznLFgS65tTjGvBYPBm` ("Snosha") — https://www.figma.com/design/1fqyznLFgS65tTjGvBYPBm/Snosha?node-id=0-1. Figma pages: "Page 1" (`0:1`, holds the homepage frames), "Page 2" (`761:3819`, not registered).

| Page | Desktop (1480px) | Mobile (390px) |
| --- | --- | --- |
| Homepage → `templates/index.json` | [`190:3767`](https://www.figma.com/design/1fqyznLFgS65tTjGvBYPBm/Snosha?node-id=190-3767) "Homepage — Desktop" | [`190:4082`](https://www.figma.com/design/1fqyznLFgS65tTjGvBYPBm/Snosha?node-id=190-4082) "Homepage — Mobile" |

- Page frames are **context only**; implementation always uses the exact desktop + mobile node of the one target section.
- Frames **without Auto Layout** (rebuild per 02 §1.1): both homepage page frames and **every section frame** use vertical Auto Layout (checked with `layoutMode` on 2026-11-16). Inside sections, these absolute-positioned composites have no Auto Layout: desktop `Hero Stage` (190:3791 — product photo, rings, spec chips), `F1 Stage` (350:4611), `Wave Back`/`Wave Front`, `Before After Slider` (364:4550), collections `Arrow · Next/Prev` (190:3838, 190:3841); mobile `Hero Stage` (335:3961), `F1 Backdrop` (390:4658), `F1 Stage` (390:4659), `Before After Slider` (340:7018), `Bundle Visual` (190:4319 — image + 3 hotspots), carousel `Progress` bars. Icon `vector` / `art` / `Thumb` frames also have none (icon graphics only). Re-check per section node.
- Design notes (skipped section numbers, desktop-only / mobile-only sections, hidden layers not to build):
  - Figma section order (same on desktop and mobile): 01 Announcement Bar · 02 Header · 02 Navigation (desktop only) · 03 Hero + Trust · 05 Collections · 06 Featured Collection · F1 Banner (unnumbered) · 06 Featured Collection · 2 · 09 Before After · 12 Reels · 08 Choose Your Care · 11 Bundle · 13 Blog · 10 Why SNOSHA · 14 FAQ · 15 Footer. Numbers **04 and 07 don't exist**, and the numbers don't follow page order — use the frame order.
  - **Desktop only:** `02 Navigation` (190:3776 — the menu bar under the header). Mobile has a menu icon in `02 Header` instead. **Mobile only:** carousel progress bars (Collections, both Featured Collections, Reels, Choose Your Care, Blog), "Link" rows under the Featured Collections and Blog carousels, and the three hotspots on the Bundle image.
  - **Hidden layers (not built):** `Link` in `10 Why SNOSHA` (desktop 190:4029, mobile 190:4366).
  - Fonts used in the design: **Cairo** (Regular, Medium, SemiBold, Bold) — different from the theme's current Inter; not changed at setup.
  - Interactions (carousels, before/after slider, hotspots, FAQ, reels playback) are not defined in node metadata — confirm per section; don't infer from screenshots.
- Currency shown in the design: **EGP** (e.g. "EGP 2499", "EGP 3100"; announcement text "… 2000 جنيه فأكثر") — placeholder values; never hardcode a currency symbol from the design.

## 4. Fonts and colors

- Current fonts: body `inter_n4`, subheading `inter_n5`, heading `inter_n7`, accent `inter_n7` (stock Horizon preset; from `config/settings_data.json`). Figma uses Cairo — verify per node.
- Global colors (schemes or palette, per theme file → T7): **color palette** (no `color_scheme_group`), stock values: `background` #ffffff · `foreground` #000000 · `color1` #333333 · `color2` #DFDFDF. One hardcoded global: `badge_sold_out_background_color` #eef1ea. Re-check `config/settings_data.json` every task.
- `config/settings_data.json` is a single-line JSON file with **no** leading `/* … */` banner, LF line endings. `templates/*.json` have the banner.

## 5. Theme-file deviations

Facts in the theme file that are different in this repo (filled during setup; this list wins over the theme file):

- **Version:** the repo runs Horizon **4.4.0**; the theme file was verified on 4.5.0. All other T1–T17 facts checked during setup on 2026-11-16 match, except the items below.
- **T6 / T8 / T15 — spacing scale breakpoint:** `--spacing-scale` (on `.spacing-style`) and `--gap-scale` (on `.gap-style, .layout-panel-flex`) are 0.7 **below 990px** — mobile **and** tablet — and 1.0 from 990px (`assets/base.css` ~L1096–1104, ~L1183–1190). They don't switch at 750px.
- **T11 — slideshow event:** "slideshow select" is not a static on `ThemeEvents`; use `SlideshowSelectEvent.eventName` (`'slideshow:select'`) from `@theme/events`.
- **T17:** `sections/section-rendering-quick-add.liquid` doesn't exist; only `sections/section-rendering-product-card.liquid` does.

## 6. Project findings

Verified facts and lessons from this project, one line each with the date and what proved it (added only when the developer asks): none yet.
