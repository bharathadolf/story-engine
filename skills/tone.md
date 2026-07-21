# Tone Skill — generic scaffold

This file defines HOW tone is checked, not WHAT the tone is.
Each project should set its own tonal contract in the Bible node's `toneContract`
field, or override this file entirely under data/projects/{id}/skills/tone.md.

When running a tone check, evaluate the draft against:
- Pacing: does scene rhythm match the project's stated pacing intent?
- Emotional register: does the darkness/lightness match the project's stated contract?
- Consistency: are there tone-deaf shifts (e.g. broad comedy immediately undercutting
  a scene that should land as serious, or vice versa)?
- Voice: does the prose style match the project's genre conventions?

WHAT TO AVOID (generic, applies to most projects):
- Explaining a tonal effect instead of achieving it on the page
- Sudden unmotivated tone shifts between adjacent scenes
- A tone that contradicts what the Bible node's toneContract states
