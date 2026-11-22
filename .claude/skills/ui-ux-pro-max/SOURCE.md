# Source
Installed from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT, see LICENSE)
Commit: 6ec2bb5 (shallow clone, 2026-11-22)
Copied from `.claude/skills/ui-ux-pro-max/` of that repo.

Local changes (nothing else was modified):
- `SKILL.md`: `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max` → `.claude/skills/ui-ux-pro-max` so the scripts run from the project root when installed as a project skill (the upstream CLI writes the same path).
- `scripts/tests/` and Python caches were left out to keep the install small.

Reviewed before install: no network calls, no subprocess/eval/exec, no binary files; scripts only read the bundled CSV data and write design-system files when asked (`--persist`).
Update: re-copy from upstream, or run `npx ui-ux-pro-max-cli update`.
