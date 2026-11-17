# 01 — Core rules (non-negotiable)

These apply to every prompt: new sections, follow-ups, bugfixes and design-driven changes. `<session>` is your session name (05 §1).

## 1. Scope limits

- **One section per task, one page at a time.** Never implement the whole site.
- Never inspect, redesign or fix unrelated sections during a single-section task — note problems in the report only.
- Never start the next section. Stop and report.
- Audit / plan / report-only task → no implementation file edits.
- Never claim something was tested when it was only read.

## 2. Source of truth and conflicts

1. The section's exact Figma desktop **and** mobile nodes are primary. Both are authoritative; mobile is not scaled desktop.
2. Read values from node data via Figma MCP (`get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot`). Never measure screenshots when node data exists.
3. Cropped screenshots = visual confirmation. Full-page links/screenshots = general context only. Never use a page node in place of available section nodes.
4. Node vs screenshot disagree → node wins; flag it.
5. **The developer's latest explicit instruction overrides older instructions.**
6. Non-Figma order: current developer request → `03-project.md` → the other rule files → the theme file → verified **active** repo code → verified Shopify/Liquid behavior → general practice → stated assumptions (lowest).
7. Unresolvable conflict: state it, cite evidence for each side, mark **Needs verification**, take the least destructive path.

## 3. Existing-first ladder

Use the **earliest** step that safely satisfies the design. Move down only after showing, in the report, why the current step can't do it.

1. Existing section / block / snippet / setting / class / component **as-is**.
2. Existing structure + **scoped CSS only**.
3. An **instance-specific design option** (§4).
4. A **new schema setting beside** existing settings.
5. A **new schema option beside** existing options.
6. **Extend** the closest block/snippet safely.
7. **Duplicate** the closest block/snippet only when extension is unsafe — as a new unprefixed file (05 §1); record the steps tried and why each failed in the final report, then proceed.
8. **Carefully modify an original section** — minimal, gated (§4), impossible to isolate otherwise.
9. **Duplicate a section** — only for a materially different structure that can't be another instance. **Ask the developer first.**
10. **Create a new section** — last resort. **Ask the developer first.**

**Approval rule:** steps 9 and 10 are the only ladder steps that need approval (the other critical stops are in 05 §2). Adding a `<session>-` class, writing CSS in your session file, adding a design option or an additive setting, extending or duplicating a block/snippet — all normal work: do it and report it.

- **Never duplicate a section just to edit it.** Changes to an existing section go through steps 1–8.
- Skipping steps is a failure even if the result looks right.
- "The design looks different", "it's easier", "it keeps the original untouched" are **not** reasons to duplicate.
- An additive setting defaulting to blank/false is almost always safer than a duplicate — prove it by listing every instance of the file in `templates/*.json` and `sections/*-group.json` and confirming the default is inert for each.
- Same principle for every file type (section, snippet, block, component, JS, CSS): reuse → extend → duplicate → create. Justify any new file. Avoid duplicate code, helper files, wrappers, custom elements and abstractions.
- An approved new or duplicated section is a new unprefixed file (05 §1) that still uses the theme's conventions (theme file → T8 scaffold, image filters, placeholders, the theme's color system, container classes, block lifecycle, tokens) and leaves shared files untouched.

## 4. Design options, and original theme files stay reusable

**Project styling is switched on by a design option, never by a "Custom CSS class" text setting.**

- **The section already has a design/style select** (any id or label, e.g. `*_des`, `*_style`, "Product design"): add **one option beside the existing ones**; never add a second design select.
  - Numeric select: the next free number, label in the same style as the existing options (options 1–11 → `{ "value": "12", "label": "Design 12" }`).
  - Named select: `{ "value": "<session>", "label": "Design <n>" }`, where `<n>` is the next free design number among the existing labels.
  - **Labels never contain the session name (developer decision — important).** Merchants see plain numbered designs: "Design 1", "Design 2"… — never "Design - dev1" or "design-dev1". The session name stays only in the technical `value`.
  - Never change or remove existing options or the default.
- If the new value builds on an existing design, share its code path (`when '7', '12'`) to keep native markup, and keep your options inactive for the native value.
- **No design/style select at all:** add as the first setting:

```json
{
  "type": "select",
  "id": "design",
  "label": "Design",
  "default": "default",
  "options": [
    { "value": "default", "label": "Default" },
    { "value": "<session>", "label": "Design 1" }
  ]
}
```

- The next session adding a design to the same select uses the next number: `{ "value": "<its-session>", "label": "Design 2" }`.

- If `design` is already a native setting with another purpose, use id `custom_design` (label "Custom design"). If another session already added such a select, add your option to it.
- The option adds your scope class to the **outermost section wrapper**, keeping native classes: `{% if section.settings.design == '<session>' %} <session>-hero-slider{% endif %}`. All your CSS for the section is anchored on it.
- A new option value may have no native CSS of its own: reproduce the base layout inside your scope in your CSS file instead of editing native snippets.
- Markup that must differ (e.g. a Figma arrow SVG) sits in the same condition, native markup in `{% else %}`.
- Turn the option on for the live instance in the JSON (§8) — never a class string.
- **Blocks** (heading / text / button) may keep an optional `custom_class` text setting when one block type plays several roles (badge, description, mobile description). Ask before converting a block to design options.
- **No exceptions for single-instance sections** (header, announcement bar, footer). Never hardcode a project class on a wrapper.
- **Another session already added a design option to the same section** — compare your Figma node with what that option renders:
  - **Different look** (a different design of the section): add your own option beside theirs, with the next free number after theirs. Never change or remove their option or gated blocks.
  - **Same look** (the same Figma design): **reuse their option** — don't add a second one, because one instance can only use one option at a time. Set your instance to their value. If the same design needs extra or changed styling, that is a change to another session's work: ask the developer (05 §2).

**Original theme files must render byte-for-byte like the base theme for any instance that hasn't opted in** (`sections/`, `blocks/`, `snippets/`):

- Every `<session>-` class, project attribute or project markup is inside a condition on a setting/option that is off, blank or `default` by default. Never an unconditional `class="<session>-x …"`.
- New snippet params default to native behavior when not passed.
- New settings default to `false`, blank or `default`. Never change an existing setting's default, `min`/`max` or options in a way that changes rendering.
- Your JS acts only inside a `<session>-` scope (`closest('.<session>-x')`) or on a `<session>-` element.
- Before done: `git diff -- sections blocks snippets | grep '^+' | grep '<session>-'` — every hit is inside a condition, a `<session>-` element, or a Liquid comment.

## 5. CSS rules

All your CSS is additive and lives in `assets/<session>.css` (ownership and loading: 05 §3), so deleting that one file removes everything your session styled.

- Every new class starts with `<session>-` (BEM `__element` / `--modifier` after it is fine); every new custom property with `--<session>-`. Grep the repo first to confirm the name is unused and doesn't collide with the theme namespace (theme file → T2).
- **Every rule is anchored on a `<session>-` class** (`.<session>-pagination`, `.<session>-collection .<native-card-class>`). A theme selector without a project ancestor is not allowed.
- To restyle a theme element, add a project class to its markup (or to a wrapper, via the design option) and keep its native classes.
- Never edit the theme's stylesheets (theme file → T5) or other sessions' CSS files.
- Group the file by feature with a comment header (`/* ==== <session>-pagination — collection page ==== */`) so one feature can be removed alone.
- **Values needing Liquid** (per-instance settings, `section.id`, setting colors) go in an inline `{% style %}` in the section, emitting **only `--<session>-` variables**, scoped to `#shopify-section-{{ section.id }}`. Spacing uses the theme's spacing helper (theme file → T8).
- The file loads on every page: keep it lean — no duplicate or leftover rules.
- Use native CSS nesting only if the theme's own CSS uses it (theme file → T5).
- **Out-rank the native rule, don't tie it.** Your file loads in `<head>`; many section stylesheets load later in `<body>` (theme file → T5, T15). On equal specificity the native rule wins silently. For each overridden property:
  1. Find the native selector(s) (grep `assets/*.css`, incl. the section's own stylesheet).
  2. Use higher specificity: double the scope class (`.<session>-faq.<session>-faq .item`) or add one more real DOM class.
  3. `!important` only against an `#id` selector or inline style, with a comment why.
  4. Confirm with `getComputedStyle` in the browser before reporting done.
- **Don't pad, size or border an element native JS animates or measures** — check theme file → T15 and the component's code (`style.height`, `animate()`, `ResizeObserver`) first; put spacing on inner parts; use `box-shadow: inset …` for hairlines.
- Custom elements that must clip need `display: block` (an inline box doesn't clip and reads `clientWidth` 0).
- Never add `overflow-x` to `html`/`body`; contain overflow inside the section.
- No hardcoded colors (§6), fonts, spacing, radii or widths where a token exists (theme file → T6). Logical properties first. No high-specificity chains or `nth-child` beyond need.

| Need | Location |
| --- | --- |
| Any project rule (section, block, card, override) | `assets/<session>.css`, anchored on a `<session>-` class |
| Values that need Liquid | inline `{% style %}`, `--<session>-` variables only, scoped to `#shopify-section-{{ section.id }}` |
| Truly global value | ask the developer — global tokens are a shared, protected change |

## 6. Colors come from the theme's color system

- Every color comes from the theme's global color system (color schemes, a color palette, or whatever the theme uses) and the variables it produces. Which system the theme uses, its variables and format, how a section applies it, and the **order of choice** when Figma needs a color the system doesn't have: theme file → T6, T7.
- A new global color entry (a new scheme, a new palette color) is allowed when the theme file's order of choice reaches it: add it **additively** in `config/settings_data.json`, with a `<session>` part in its ID where the format allows IDs, report its hex values (from Figma node data) and where it's used, and follow 05 §4–§5 for the edit. If the file changed in a way you can't merge safely, ask the developer to add it in Theme settings → Colors instead.
- Never edit an existing global color's value for one section. No color settings "just in case". Never hardcode a color in CSS.

## 7. Preservation of merchant data

- Preserve all schema settings, block types, setting IDs, option values, presets, defaults, functionality (product/variant, AJAX, cart drawer, slider, editor reload, localization, a11y), Customizer data, template JSON, picked products/collections, images, videos, links, configured blocks, and manual code.
- Setting `id`s, block `type`s, event constants and token names are an **append-only contract** with the JSON data and imports. Never rename or delete them; never simplify a base by removing controls; add beside.
- Never reset an instance to preset/defaults; never discard merchant content; never remove or reorder unrelated JSON entries.
- Editor JSON (`templates/*.json`, `sections/*-group.json`, `config/settings_data.json`) is **data, not source**. Put behavior in `.liquid` + schema. Touch template JSON only to wire/fill the target instance (§8). Touch `settings_data.json` only to add a global color entry (§6).
- Files may contain manual changes that differ from the vanilla theme: keep them; never reset a file to a clean vendor version. Editor syncs may change files under you — trust the current file and note the drift.

## 8. Fill the template with the Figma content

A section task is **not done** until the live instance looks like Figma out of the box. After the code, edit the instance in the JSON that renders it (`templates/index.json` for the homepage, `sections/header-group.json` / `footer-group.json`, `templates/<page>.json` otherwise), following 05 §4–§5:

- **Content:** headings, text, labels, codes, links copied **exactly** from the Figma node.
- **Settings:** layout, sizes, spacing, visibility, your design option (§4) and the matching colors (§6). Where a setting can't reproduce Figma, say so in the report.
- **Blocks:** one per Figma item, in Figma order. Demo blocks Figma doesn't show → `"disabled": true`, never deleted. New section and block IDs are prefixed `<session>_` and unique, and go into `order` / `block_order`.
- **Placement:** if missing, add to `sections` and `order` at its Figma position. Report where it landed and what shifted.
- **Editor name (developer decision):** set the instance's `"name"` to the Figma section name in **English**, without its number (`05 Collections` → `"Collections"`, `06 Featured Collection · 2` → `"Featured Collection 2"`), so the Theme Editor shows what the section is, never a generic `t:names.*` label ("Carousel", "Section", "Product list"). Change only `name`; never the instance ID or `type`.
- Don't invent content. Missing images/products/collections/text stay blank and go in the report under "Manual Theme Editor steps". Image settings are filled only with existing `shopify://shop_images/...` files. Never a `figma.com` / `api/mcp/asset` URL.
- **Every `range` value must be on a step:** `min <= value <= max` and `(value - min) / step` whole, read from the schema — never assume step 1 (step 2 from 50 → even numbers only; Figma 153 becomes 152 or 154). Note any rounding. Otherwise Shopify rejects the whole file.
- Keep the file's encoding and line endings (check for CRLF first).
- Validate: parse the JSON (strip the leading `/* … */` banner) with a read-only check; if the developer's preview is running, fetch `http://127.0.0.1:9292/` and confirm the new content renders.
- Tell the developer to commit the JSON promptly — any Theme Editor save overwrites it.
