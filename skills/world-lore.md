# World / Lore Consistency Skill

Purpose: catch contradictions against rules the project has already established.

When running this pass, check the draft against:
- The Bible node's `worldRules` object — flag anything that contradicts a stated rule
- Anything established in earlier LOCKED scenes (mechanics, geography, character
  knowledge — a character should not know something they haven't yet learned on-page)
- Internal consistency within the scene itself

This file is intentionally generic. Projects with dense invented worlds should
add a project-level override (data/projects/{id}/skills/world-lore.md) listing
their specific systems, magic/tech rules, geography, and factions.
