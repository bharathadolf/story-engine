import fs from 'fs/promises';
import path from 'path';

const GLOBAL_SKILLS_DIR = path.join(process.cwd(), 'skills');
const PROJECTS_DIR = path.join(process.cwd(), 'data', 'projects');

/**
 * Loads a skill file, preferring a project-specific override if one exists.
 * data/projects/{projectId}/skills/{skillName}.md  (checked first)
 * skills/{skillName}.md                            (global default fallback)
 */
export async function loadSkill(skillName: string, projectId?: string): Promise<string> {
  if (projectId) {
    const overridePath = path.join(PROJECTS_DIR, projectId, 'skills', `${skillName}.md`);
    try {
      const content = await fs.readFile(overridePath, 'utf-8');
      return `### SKILL: ${skillName.toUpperCase()} (project override)\n${content}`;
    } catch (_) {
      // no override — fall through to global default
    }
  }

  try {
    const filePath = path.join(GLOBAL_SKILLS_DIR, `${skillName}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    return `### SKILL: ${skillName.toUpperCase()}\n${content}`;
  } catch (err) {
    console.warn(`Skill not found: ${skillName}`);
    return '';
  }
}
