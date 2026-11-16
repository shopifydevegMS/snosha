# CLAUDE.md

Guidance for Claude Code in this repository. This file and every file in `.claude/rules/` load automatically in every session — **follow them on every prompt, including follow-ups and bugfixes, without being reminded.**

| File | What it holds |
| --- | --- |
| `.claude/rules/01-core-rules.md` | Non-negotiable rules: scope, source of truth, existing-first ladder, design options, CSS, colors, merchant data, filling the template |
| `.claude/rules/02-workflow.md` | Task workflow, validation, report formats, follow-ups, prompt template, checklist |
| `.claude/rules/03-project.md` | This project's facts: identity, Figma, language, colors, theme-file deviations |
| `.claude/rules/04-area-rules.md` | Rules per area: schema, breakpoints, RTL, images, sliders, cards, video, JS, a11y, performance |
| `.claude/rules/05-shared-workspace.md` | Working safely alongside other sessions: session name, file ownership, safe edits, commands |
| `.claude/rules/theme-*.md` (one file) | Verified facts of the base theme, under fixed headings T1–T17. Swappable per theme |

**Precedence:** the developer's latest explicit instruction → `03-project.md` → the other rule files → the theme file → verified repo code. If two rules contradict each other, stop and tell the developer; never pick one silently. "Theme file → Tn" means heading Tn of the `theme-*.md` file.

## What this is

A Shopify Online Store 2.0 theme for **Snosha** (store theme name not verified, repo `shopifydevegMS/snosha`), built on **Horizon 4.4.0 by Shopify**. No Shopify GitHub-sync commits found; the repo was pushed manually (see `03-project.md` §1). No build step, package.json or test suite: files are served as-is. Content is authored in **Arabic** (RTL).

## Commands

- `shopify theme dev` — the **developer** runs the preview (http://127.0.0.1:9292/). Never run `dev`, `pull`, `push`, `publish` or `share`.
- `shopify theme check` — allowed, read-only; never with `--auto-correct` / `-a`.
- Git — read-only only (`status`, `diff`, `log`, `show`, `blame`).

## Hard rules (one line each — details in `.claude/rules/`)

1. Get your **session name** from the developer before creating or editing any file. Everything new carries it as the prefix: `<session>-` classes and files, `--<session>-` variables, `<session>_` JSON and locale IDs.
2. One section per task. Never start the next section.
3. Figma section nodes (desktop + mobile) are the source of truth; read node data, not screenshots.
4. Work autonomously: plan, then implement — never "should I start?". Ask only when Figma is genuinely unclear (e.g. what a button does), before duplicating or creating a section, or for the critical cases in 05 §2. Never duplicate a section to edit it.
5. Project styling is switched on by a design option, never a custom-class text setting. Every addition to an original theme file is gated, so a fresh instance renders exactly like the base theme.
6. All CSS in `assets/<session>.css` only: prefixed, anchored on a `<session>-` class, out-ranking the native selector.
7. Colors only from the theme's color system, in the order of choice in theme file → T7; never hardcoded.
8. Never rename or delete setting IDs, block types or presets; never reset merchant data.
9. A task isn't done until the live instance in the template JSON is filled with the Figma content.
10. Shared workspace: re-read a file right before every edit, exact-match edits only, never edit through shell commands, never touch another session's work.
11. Breakpoints come from the theme file only. Frames without Auto Layout are rebuilt with flex/grid.
12. Never claim something was tested when it was only read.
13. Never edit `CLAUDE.md` or any `.claude/rules/` file unless the developer explicitly asks.
