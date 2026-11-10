import { ThemedText } from '@/components/themed-text';
import { StyleSheet } from 'react-native';

export const renderFormattedText = (rawText: string) => {
  if (!rawText) return null;

  const lines = rawText.split('\n');

  return lines.map((line, lineIndex) => {
    const isLastLine = lineIndex === lines.length - 1;
    const lineEnding = isLastLine ? '' : '\n';

    if (line.startsWith('# ')) {
      return (
        <ThemedText key={lineIndex} style={editorStyles.h1}>
          {line}{lineEnding}
        </ThemedText>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <ThemedText key={lineIndex} style={editorStyles.h2}>
          {line}{lineEnding}
        </ThemedText>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <ThemedText key={lineIndex} style={editorStyles.h3}>
          {line}{lineEnding}
        </ThemedText>
      );
    }

    return (
      <ThemedText key={lineIndex} style={editorStyles.bodyLine}>
        {parseInlineStyles(line)}
        {lineEnding}
      </ThemedText>
    );
  });
};

const parseInlineStyles = (text: string) => {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <ThemedText key={index} style={editorStyles.bold}>
          {part}
        </ThemedText>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <ThemedText key={index} style={editorStyles.italic}>
          {part}
        </ThemedText>
      );
    }
    return <ThemedText key={index}>{part}</ThemedText>;
  });
};

const editorStyles = StyleSheet.create({
  bodyLine: {
    fontSize: 16,
    lineHeight: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});