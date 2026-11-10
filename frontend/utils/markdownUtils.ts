export interface Selection {
  start: number;
  end: number;
}

export function toggleLinePrefix(
  content: string,
  selection: Selection,
  prefix: string
): { newContent: string; newSelection: Selection } {
  const { start } = selection;

  const lineStart = content.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = content.indexOf('\n', start);
  if (lineEnd === -1) lineEnd = content.length;

  const currentLine = content.substring(lineStart, lineEnd);

  let updatedLine: string;
  let lengthDiff: number;

  if (currentLine.startsWith(prefix)) {
    updatedLine = currentLine.substring(prefix.length);
    lengthDiff = -prefix.length;
  } else {
    const cleanLine = currentLine.replace(/^#( )?|^##( )?|^###( )?|^-( )?/, '');
    updatedLine = `${prefix}${cleanLine}`;
    lengthDiff = updatedLine.length - currentLine.length;
  }

  const newContent =
    content.substring(0, lineStart) + updatedLine + content.substring(lineEnd);

  const newCursor = Math.max(lineStart, start + lengthDiff);

  return {
    newContent,
    newSelection: { start: newCursor, end: newCursor },
  };
}

/**
 * Aplica formatação inline (Bold, Italic, Code):
 * 1. Se houver seleção -> Envolve o texto selecionado (Wrap).
 * 2. Se for apenas cursor -> Expande para pegar a palavra sob o cursor e envolve.
 */
export function toggleInlineFormatting(
  content: string,
  selection: Selection,
  prefix: string,
  suffix: string
): { newContent: string; newSelection: Selection } {
  let { start, end } = selection;

  if (start === end) {
    let wordStart = start;
    let wordEnd = start;

    while (wordStart > 0 && !/\s/.test(content[wordStart - 1])) {
      wordStart--;
    }
    while (wordEnd < content.length && !/\s/.test(content[wordEnd])) {
      wordEnd++;
    }

    start = wordStart;
    end = wordEnd;
  }

  const selectedText = content.substring(start, end);

  const isWrapped =
    selectedText.startsWith(prefix) && selectedText.endsWith(suffix);

  let replacement: string;
  let newCursorPos: number;

  if (isWrapped) {
    replacement = selectedText.slice(prefix.length, -suffix.length);
    newCursorPos = start + replacement.length;
  } else {
    replacement = `${prefix}${selectedText}${suffix}`;
    newCursorPos = start + replacement.length;
  }

  const newContent =
    content.substring(0, start) + replacement + content.substring(end);

  return {
    newContent,
    newSelection: { start: newCursorPos, end: newCursorPos },
  };
}

