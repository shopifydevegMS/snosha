# 02 — Task workflow

Run these steps in order for every section task. Follow-ups and bugfixes use §8. **Work autonomously** (developer decision): no step waits for approval except the stops in 01 §3 (steps 9–10) and 05 §2.

## 1. Inspect Figma

Inspect the **exact** desktop and mobile nodes with Figma MCP before any code: `get_metadata` (structure), `get_design_context` (properties), `get_variable_defs` (tokens), `get_screenshot` (confirmation only, after reading values). Page frames are often too large for `get_metadata` — query the section node instead.

Read: Auto Layout direction, gap, padding · fixed/hug/fill sizing, min/max · constraints, alignment · components and variants · variables/tokens · typography (size, weight, line height, letter spacing, alignment) · colors, opacity, fills, gradients · borders, radii, shadows, effects · image crop/fit/position · desktop/mobile differences · hidden layers · decorative and exportable assets.

- **Figma asset URLs are short-lived** — never put a `figma.com` or `api/mcp/asset` URL in Liquid, CSS, JS or JSON. Icons go into an SVG-code setting (04 §6.1); other graphics are downloaded once and stored in the repo (naming: 05 §1). Never store a large raw SVG in `templates/*.json` — small optimized icon SVGs in icon settings are the only exception.
- Hidden layers are not built unless the developer asks (see `03-project.md` → design notes).

### 1.1 Frames without Auto Layout

Frames listed in `03-project.md` as having no Auto Layout give absolute x/y and fixed sizes for **one viewport only**:

- **Exact from node data:** typography, colors, radii, borders, shadows, icon sizes, image aspect ratios.
- **Infer intent:** rows, columns, grids, alignment, repeating items. Gaps = distance between sibling edges; inconsistent spacing → dominant value, flagged.
- **Layout with flex/grid + `gap`**; `position: absolute` only for true overlays (badges, icons on images).
- **Never copy fixed px widths/heights onto containers, cards or images** — use `width: 100%`, `max-width`, `fr`/`minmax()`, `flex: 1 1 …`, `aspect-ratio`. Heights come from content.
- Column counts from the theme's column settings (theme file → T3), not a card width.
- Between designs: `clamp()` or switch at the theme's breakpoints. Never a breakpoint for one frame width.
- Fixed px only for icons, borders, radii, control heights, hairlines.
- Check every width in 04 §2: no overflow, overlap, or big empty gaps.

## 2. Inspect the repository

Required every task: target template and its JSON, the section currently used, the closest existing section, relevant blocks/snippets/CSS/JS/custom elements/assets, schema settings, naming/utility/responsive/RTL conventions, the slider implementation, editor behavior, merchant data, manual changes, and **other sessions' work in the files you'll touch** (05 §5).

**Confirm the active code path** — grep `templates/` and `sections/*-group.json` for the exact `"type"` / render call before editing; themes ship legacy and near-duplicate files (theme file → T17).

## 3. Plan (no stop)

Decide the ladder step, files, schema changes, CSS scope and risks, and write them down as the **pre-implementation report at the top of the final report** (§7). Then implement right away: **never end a plan with "should I start?"** or wait for a go-ahead the rules don't require. Before your first shared-file edit, state in one line which shared files you'll touch and why, then continue (05 §1).

**When to ask** (05 §2 has the full list):
- **Ask** when Figma is genuinely unclear in a way that changes the result — e.g. what a button or icon does, where a link goes, how an element behaves on click/hover/scroll, which content is dynamic — or when a rule requires approval.
- **Don't ask** what the repo, Figma node data, schema or templates can answer, or about low-risk choices: take the safest assumption and list it in the final report.
- Ask all open questions in one message, and keep working on the parts they don't affect.

## 4. Implement

Follow `01-core-rules.md`, `04-area-rules.md` and `05-shared-workspace.md`. Smallest safe change, fewest files. Create in dependency order (05 §6).

## 5. Fill the template

Per 01 §8.

## 6. Validate

No build or tests exist — run targeted checks and report exactly what ran. Mark each **Passed / Failed / Not run / Not available / Requires manual verification**.

- JSON parse of every edited `{% schema %}` and template JSON (read-only check).
- `{% style %}` / `{% schema %}` / `{% content_for %}` balance; JS has no obvious syntax errors.
- Every `range` value in edited JSON is in range **and on a step** (against the schema).
- `git diff --stat` — your intended files changed (other sessions' changes appear too; don't treat them as yours or as errors).
- Gating grep (01 §4).
- `assets/<session>.css`: every rule anchored on a `<session>-` class; no CSS added elsewhere except `--<session>-` variables in inline `{% style %}`.
- Grep new CSS for physical `left`/`right`, for color variables used in the wrong format (theme file → T6), for `@media` values other than the theme's breakpoints (theme file → T3).
- No `figma.com` / `api/mcp/asset` URL in any production file.
- Theme stylesheets, minified JS and `settings_data.json` unchanged (except an additive color entry).
- Computed values of overrides checked in the browser.
- Target instance filled; nothing else in that JSON changed; other sessions' entries intact.
- `shopify theme check`: **don't run it** unless the developer explicitly asks for it in the current task — report it as "Not run". When asked: read-only, never `-a`, report its real output.

Runtime, visual, responsive, RTL, slider, cart and editor-lifecycle behavior → **Requires storefront QA (Not run)** unless actually checked in the live preview. Remember the preview also shows other sessions' changes.

## 7. Final report

In this order:

1. **Session** — your name.
2. **Implemented** — what you completed, in two or three lines.
3. **Pre-implementation report** — files inspected and why · existing architecture (render path, blocks, styles, scripts, schema, data sources) · ladder step chosen and why earlier steps don't work · schema changes · CSS scope class · JS changes and why HTML/CSS couldn't do it · data at risk · risks (regression, saved data, lifecycle, responsive, RTL, localization, a11y, performance, apps) · out of scope.
4. **Assumptions made** — every open point you resolved yourself.
5. **Figma nodes inspected.**
6. **Files created/modified** — exact paths, one per line.
7. **Shared files touched** — each file and exactly what changed (e.g. "added `dev1_hero` to `templates/index.json` after `featured_collection`").
8. **Files intentionally untouched.**
9. **Changes** — Liquid/HTML · schema settings added · blocks/options added · CSS scope class and CSS changes · JS changes.
10. **Theme Editor behavior.**
11. **Responsive and RTL/LTR verification.**
12. **Accessibility and performance notes.**
13. **Merchant-data preservation.**
14. **Validation** — each check with its status; say whether you actually checked the preview.
15. **Manual Theme Editor steps.**
16. **Pending** — approvals needed, conflicts, unfinished dependencies, known limitations.
17. **Suggested rule updates** — new verified facts worth adding to `03-project.md` (not written unless the developer asks).

Distinguish clearly: **inspected** (read and reasoned) · **validated** (a check ran, result stated) · **manually testable** (exact steps for a human) · **not testable here**.

Then stop. **Do not start the next section.** Never commit unless the developer asks.

## 8. Follow-up and bugfix

Every rule in `01`, `04` and `05` applies to follow-ups exactly as to new sections.

- Re-read the current active file from disk; **find the root cause** — don't patch symptoms.
- Smallest safe fix, fewest files and lines, inside your existing scope class, in your session CSS file.
- Don't rewrite the section, don't refactor broadly, don't add breakpoints, hardcoded values or event systems.
- If the cause is in another session's work, don't fix it: report it and stop that part.
- Preserve settings, IDs, blocks, merchant data. Verify desktop + mobile, that one breakpoint fix doesn't regress another, RTL, related states, editor reload.
- Report: **session · root cause · exact fix · files changed · shared files touched · behavior preserved · responsive checks · editor checks · remaining limitations.**

## 9. Section task prompt template

```
Session: <session name>
Implement ONE section of the design.

Target page:      <Homepage | Product | Collection | …>
Target template:  <templates/index.json | product.json | collection.json | <suffix>.json>
Section name:     <name>
Figma desktop node: <exact node id or link>
Figma mobile node:  <exact node id or link>
Screenshots:        <visual confirmation only>
Dynamic content source: <settings / blocks / product / collection / metafield / menu / app>
Grid or carousel behavior: <desktop / tablet / mobile>
Product-card requirements: <card style, badges, price, add-to-cart placement>
Existing section/base to inspect: <file path(s)>
Out of scope: <explicit list>

Do not start the next section.
```

Bugfix: same header plus the reported issue and where it appears. End with: `Do not rebuild the section. Do not start the next section.`

## 10. Checklist

**Before implementing**
- [ ] Session name known; target files checked for other sessions' work.
- [ ] Outcome, acceptance criteria and what must not change are clear.
- [ ] Exact desktop + mobile nodes inspected; values from node data.
- [ ] Active code path confirmed; full relevant files read (schema, CSS, JS).
- [ ] Ladder step chosen and justified; approval obtained if step 9/10 or a 05 §2 case.

**Before calling it done**
- [ ] Every shared edit: re-read before, exact-match, re-read after, other sessions' work intact.
- [ ] No edits to minified JS, theme stylesheets, other sessions' files, instruction files.
- [ ] Identifiers, presets, merchant data, native behavior, app boundaries, license code preserved.
- [ ] Design option added; every project class in original files gated; a fresh instance renders like the base theme.
- [ ] All CSS in `assets/<session>.css`, prefixed, anchored, out-ranking native rules, computed values checked.
- [ ] Colors from the theme's color system; tokens, logical properties, the theme's event bus and shared snippets used; no Figma URLs.
- [ ] Blank states, mobile media fallback, preset handled.
- [ ] Instance filled from Figma; editor `name` = English Figma section name (01 §8); demo blocks disabled; range values on step; line endings kept; developer told to commit.
- [ ] Final report complete and honest about inspected vs validated.
- [ ] **Did not start the next section.**
