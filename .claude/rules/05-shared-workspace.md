# 05 — Shared workspace (multi-session)

**You may be one of several AI sessions working at the same time in the same theme folder, Git branch, working tree and Shopify preview.** There are no worktrees, branches, file locks or orchestration. Any file can change after you read it, and changes you didn't make probably belong to another session. Sessions start and stop at any time — never assume a file is free because you don't know of a session using it. The developer coordinates and makes all final decisions. **When finishing your task conflicts with preserving existing work, preserve the work.** Never sacrifice another session's work to complete yours.

## 1. Session name, prefix and ownership

- The developer names each session (e.g. "you are `dev1`"), in the task prompt or a message. Use exactly that name. **Until you have a name, create or edit no file — ask for it.** Never derive it from the git branch: all sessions share one branch.
- The name becomes part of CSS classes and JSON IDs, so it must be lowercase letters and digits, start with a letter, and not equal the theme namespace (theme file → T2). If the given name breaks this (e.g. `Dev 1`, `1dev`), tell the developer and propose a valid form (`dev1`); don't rename silently.
- The name is your **prefix** for everything new that another session could collide with (except section/block/snippet file names — next rule): your CSS/JS files (`assets/<session>.css`), CSS classes (`.<session>-hero`), custom properties (`--<session>-gap`), JSON section/block IDs (`"<session>_hero"`), locale keys (`"<session>_hero": {…}`), JS identifiers and element names (`<session>Slider`, `<session>-slider`), global color IDs where the format allows them (e.g. `scheme-<session>-…`), design-option values (01 §4). Check a name doesn't exist before creating it.
- **File names of new sections, blocks and snippets carry NO prefix (developer decision — important).** Name them by what they are: `sections/trust-strip.liquid`, `blocks/_trust-strip.liquid`, `snippets/trust-strip-card.liquid` — never `_dev3-trust-strip.liquid` or `snosha-hero.liquid`. Before creating one, check the name doesn't exist in `sections/`, `blocks/`, `snippets/` (theme or another session); if it does, pick another descriptive name. Your CSS/JS files (`assets/<session>.css`, `assets/<session>.js`), classes, variables, IDs and keys keep the prefix.
- **Exception — images exported from Figma** carry no prefix: they are shared, non-critical assets any session may reuse. (Icons normally go into SVG-code settings instead of files — 04 §6.1; an icon file is only for a native control that needs one.) Name them after the Figma layer (`icon-arrow-left.svg`), or give a short descriptive name when the layer name is generic (`Vector 12` → `icon-truck.svg`). Before saving, check the name: if a file with that name exists and is the same asset, reuse it; if it's a different asset, choose another name. Never overwrite an existing asset.
- **You own** (edit freely): the section, block and snippet files you created, `assets/<session>.css`, `assets/<session>.js`.
- **Shared files you may edit without asking** — targeted changes only (§4–§5):
  - the JSON template or section group of the page your task targets, to add or configure your section or the existing instance your task configures;
  - locale files, to add your own `<session>_` keys;
  - native theme `sections/`, `blocks/`, `snippets/`, with **gated, opt-in changes only** (01 §4);
  - protected files, with **purely additive** changes only (§7): your CSS/JS loading line (§3) and a new global color entry (01 §6).
- Before your first shared edit, state in one line which shared files you'll touch and why, then continue. List every one under "Shared files touched" in the final report.
- Never touch files another session created, never change another session's work to "improve" it, never claim ownership of unrelated components.

## 2. When to ask (and stop that part only)

Work autonomously otherwise (02 §3): no "should I start?" after planning, no questions the repo or Figma can answer. Ask when Figma is genuinely unclear in a way that changes the result (what a button does, where a link goes, how an element behaves), and — pausing only the affected part while you continue independent work — before:

- deleting or renaming any existing file;
- renaming or removing setting IDs, block types, presets or a section's `type`;
- changing or removing another session's work, or any file another session created, or a gated block with another session's prefix;
- touching a template of a page outside your task;
- duplicating or creating a section (01 §3 steps 9–10);
- a non-additive change to a protected file (§7);
- anything destructive or irreversible (git writes, deploys, live store data);
- a conflict that can't be resolved without risking someone's work.

If the task itself can't be identified (no target section or Figma node), ask before starting. Any other gap → safest assumption, listed in the final report.

## 3. Your CSS and JS files

- All your CSS goes in `assets/<session>.css`, all your JS in `assets/<session>.js`. Don't edit, move styles out of, or merge other sessions' files.
- **CSS loading:** load `assets/<session>.css` **once, globally**, with one additive line placed after the last stylesheet line in the theme's global CSS loader (theme file → T4), after any other session's line: `{{ '<session>.css' | asset_url | stylesheet_tag }}`. Don't load it in sections. (One global load gives one predictable cascade position; per-section loading would repeat the tag and change the cascade order per page.)
- **JS loading:** load `assets/<session>.js` in the section or snippet that needs it, inside the same design-option condition (01 §4), as `<script src="{{ '<session>.js' | asset_url }}" type="module"></script>` — a module runs once per page even when several sections include it, and never blocks parsing.
- Separate files don't prevent cascade or runtime conflicts: keep every rule and listener scoped to your `<session>-` classes.

## 4. Editing files safely

- **Re-read a shared file from disk immediately before every edit.** A previous read is never proof it is unchanged.
- On existing files, use the Edit tool with exact-match edits only, the smallest possible change. Never rewrite or regenerate a whole existing file; writing a whole file is only for creating a new file of your own.
- **Never edit files through shell commands** (`sed`, `awk`, `perl -i`, `Set-Content`, `Out-File`, `echo >`, `node -e`, scripts): they can corrupt backslashes, line endings and encoding, and break the live preview. No broad search-and-replace on shared files. Read-only shell checks (grep, JSON parse) are fine.
- If an edit fails or the file changed unexpectedly, re-read it and redo **only your change**. Never force a write.
- After each shared edit, re-read the result: unrelated sections, settings, blocks and other sessions' changes must be intact. Validate it and report anything unexpected.
- Before editing a shared file, check it is really needed; prefer a scoped, independent solution.
- Never restore a file to an older version, never treat uncommitted changes as disposable, and never resolve a suspected conflict by discarding changes. If you can't make a safe targeted change, stop and ask.

## 5. JSON templates, section groups, locale files

- Keep existing section IDs, block IDs, settings and app blocks. Never replace the whole `sections` object or `order` array with an earlier copy.
- Change only your own entry (or the existing instance your task configures) and its one position in `order`; keep the other sections' order. IDs must stay unique.
- Each change is **one complete edit that leaves the file valid**. Keep the leading comment banner, existing formatting and line endings.
- Verify your section appears in the right template and isn't disabled.
- If another session changed the file since you read it, keep its changes.
- Don't duplicate a template just to avoid a shared-file change.

## 6. The preview is live: never break it

The developer's `shopify theme dev` uploads every save, and a broken file breaks the preview for every session.

- Create in dependency order: snippet, then section, then template entry; asset file before the line that loads it. Never reference a file that doesn't exist yet.
- Never save invalid JSON or Liquid to a file the preview uses.
- When removing something (with approval), remove the reference first.
- If the preview breaks and it wasn't your change, don't fix it: report it and continue with unaffected work.
- Other sessions' changes appear in the preview too; not every visual difference is yours.

## 7. Protected files

`config/settings_data.json`, `config/settings_schema.json`, `layout/*.liquid`, the theme's global CSS loader (theme file → T4), and any other global config the developer names.

- A **purely additive** change your task needs — your CSS loading line (§3), a new global color entry (01 §6) — goes ahead without approval: keep it minimal and report it.
- Any other change: name the file, explain why, describe the minimal change, and wait for approval. Never rewrite unrelated settings or remove others' work.

## 8. Commands

- **Git:** read-only only (`status`, `diff`, `log`, `show`, `blame`). Without approval never run `add`, `commit`, `reset`, `restore`, `checkout`, `switch`, `clean`, `stash`, `rebase`, `merge`, `cherry-pick`, `pull`, `fetch`, `push`, or anything that stages, discards or rewrites changes. `git status` / `git diff` show every session's changes.
- **Shopify CLI:** never run `shopify theme pull` (it overwrites local files), `dev`, `push`, `publish`, `share` or any deployment. Don't change ports, theme targets or environments, or touch live theme/store data. **Don't run `shopify theme check`** unless the developer explicitly asks for it in the current task (then never with `--auto-correct` / `-a`).
- **Other tools:** no project-wide formatting, `--fix` / `--write` / auto-correct modes, global search-and-replace, cross-file refactoring, builds or scripts that overwrite shared files or regenerate config, dependency installs or upgrades, or cleanup of untracked/modified files. Before any command that writes files, check whether it could affect other sessions; if so, limit it to your files or ask. Prefer read-only inspection and targeted validation.

## 9. Unexpected changes

Don't revert, overwrite, or call them errors: assume they belong to another session. Continue when safe; ask when ownership or compatibility is unclear. You cannot talk to other sessions, so never claim you did.
