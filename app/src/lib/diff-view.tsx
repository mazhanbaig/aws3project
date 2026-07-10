import { diffLines } from 'diff';

export interface DiffViewLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export function computeDiffView(oldText: string, newText: string): DiffViewLine[] {
  const changes = diffLines(oldText, newText);
  const lines: DiffViewLine[] = [];

  for (const part of changes) {
    if (part.added) {
      lines.push({ type: 'added', text: part.value });
    } else if (part.removed) {
      lines.push({ type: 'removed', text: part.value });
    } else {
      lines.push({ type: 'unchanged', text: part.value });
    }
  }

  return lines;
}
