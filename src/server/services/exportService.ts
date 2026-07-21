import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import fs from 'fs/promises';
import path from 'path';

interface GraphNode {
  id: string;
  type: string;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Assembles all locked Draft nodes from ONE project's graph into a complete screenplay .docx
 */
export async function exportScreenplay(graph: Graph, projectPaths: { root: string }): Promise<string> {
  const { nodes, edges } = graph;

  // Find and sort scenes according to story hierarchy
  const orderedScenes = getOrderedScenes(nodes, edges);
  
  const paragraphs: Paragraph[] = [];

  // Add Title Page
  const bibleNode = nodes.find(n => n.type === 'bible');
  const title = bibleNode?.data?.title || 'Untitled screenplay';
  const premise = bibleNode?.data?.premise || '';
  const theme = bibleNode?.data?.theme || '';

  // Title Page Spacer
  paragraphs.push(new Paragraph({ spacing: { before: 2400 } }));
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: title.toUpperCase(), font: 'Courier New', size: 36, bold: true })]
  }));
  
  if (premise) {
    paragraphs.push(new Paragraph({ spacing: { before: 480 } }));
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Premise: ${premise}`, font: 'Courier New', size: 24, italics: true })]
    }));
  }

  if (theme) {
    paragraphs.push(new Paragraph({ spacing: { before: 240 } }));
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Theme: ${theme}`, font: 'Courier New', size: 24, italics: true })]
    }));
  }

  // End Title Page
  paragraphs.push(new Paragraph({ pageBreakBefore: true }));

  // Process scenes in order
  let addedAnyContent = false;
  for (const scene of orderedScenes) {
    // Find associated draft node
    const draftNode = nodes.find(n => n.type === 'draft' && n.data.sceneRef === scene.id);
    if (!draftNode || !draftNode.data.locked) {
      // Skip scenes that are not locked or have no drafts yet
      continue;
    }

    const currentVersionNum = draftNode.data.currentVersion || 1;
    const version = draftNode.data.versions?.find((v: any) => v.versionNumber === currentVersionNum);
    const text = version?.text || '';

    if (text.trim()) {
      if (addedAnyContent) {
        // Separate scenes by a clear page break or whitespace (industry standard: scene flow is continuous but page breaks between scenes are common for editing)
        // Let's do standard screenplay continuous flow unless requested
        paragraphs.push(new Paragraph({ spacing: { before: 480 } }));
      }
      paragraphs.push(...parseScreenplayText(text));
      addedAnyContent = true;
    }
  }

  if (!addedAnyContent) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'This screenplay has no locked scene drafts yet. Please lock at least one scene draft in the sidebar to export.', font: 'Courier New', size: 24 })]
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // Letter size
          margin: { top: 1440, bottom: 1440, left: 2160, right: 1440 } // Screenplay margins: 1.5" Left, 1" Top/Bottom/Right
        }
      },
      children: paragraphs
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(projectPaths.root, 'export_screenplay.docx');
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

/**
 * Returns scenes sorted in hierarchical story order
 */
function getOrderedScenes(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const bible = nodes.find(n => n.type === 'bible');
  if (!bible) return [];

  // Sort acts by actNumber
  const acts = nodes.filter(n => n.type === 'act')
    .sort((a, b) => (a.data.actNumber || 0) - (b.data.actNumber || 0));

  const orderedScenes: GraphNode[] = [];

  for (const act of acts) {
    // Find sequences for this act
    const sequences = nodes.filter(n => n.type === 'sequence' && n.data.actRef === act.id)
      .sort((a, b) => a.id.localeCompare(b.id)); // Default order fallback

    for (const sequence of sequences) {
      // Find scenes for this sequence
      const scenes = nodes.filter(n => n.type === 'scene' && n.data.sequenceRef === sequence.id)
        .sort((a, b) => a.id.localeCompare(b.id));

      orderedScenes.push(...scenes);
    }
  }

  // Any orphaned scenes (scenes without sequenceRef)
  const orphanedScenes = nodes.filter(n => n.type === 'scene' && !orderedScenes.some(os => os.id === n.id));
  orderedScenes.push(...orphanedScenes);

  return orderedScenes;
}

/**
 * Parses screenplay plain text into styled Docx paragraphs with proper margins
 */
function parseScreenplayText(text: string): Paragraph[] {
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];

  let inDialogue = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      inDialogue = false;
      continue;
    }

    const isSlugline = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line);
    const isParenthetical = line.startsWith('(') && line.endsWith(')');
    const isCharacterCue = !isSlugline && !isParenthetical && line === line.toUpperCase() && line.length < 40 && !line.includes(':') && isNaN(Number(line));

    if (isSlugline) {
      paragraphs.push(new Paragraph({
        spacing: { before: 480, after: 120 },
        children: [new TextRun({
          text: line.toUpperCase(),
          font: 'Courier New',
          size: 24,
          bold: true
        })]
      }));
      inDialogue = false;
    } else if (isCharacterCue) {
      // Character Cue: indented 2.5 inches (approx 3600 dxa)
      paragraphs.push(new Paragraph({
        spacing: { before: 240, after: 0 },
        indent: { left: 3600 },
        children: [new TextRun({
          text: line,
          font: 'Courier New',
          size: 24,
          bold: true
        })]
      }));
      inDialogue = true;
    } else if (isParenthetical) {
      // Parenthetical: indented 2.0 inches (approx 2880 dxa)
      paragraphs.push(new Paragraph({
        spacing: { before: 0, after: 0 },
        indent: { left: 2880, right: 2880 },
        children: [new TextRun({
          text: line,
          font: 'Courier New',
          size: 24,
          italics: true
        })]
      }));
    } else {
      // Standard Action or Dialogue block
      if (inDialogue) {
        // Dialogue: indented 1.5 inches (approx 2160 dxa) and right-indented
        paragraphs.push(new Paragraph({
          spacing: { before: 0, after: 120 },
          indent: { left: 2160, right: 2160 },
          children: [new TextRun({
            text: line,
            font: 'Courier New',
            size: 24
          })]
        }));
      } else {
        // Action line: full width, double spaced before, single spaced after
        paragraphs.push(new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [new TextRun({
            text: line,
            font: 'Courier New',
            size: 24
          })]
        }));
      }
    }
  }

  return paragraphs;
}
