export const normalizeEof = (text: string): string => {
  // Normalize newlines to LF
  const lf = text.replace(/\r\n/g, '\n');
  const lines = lf.split('\n');
  let end = lines.length - 1;
  // Drop trailing blank (whitespace-only) lines
  while (end >= 0 && /^\s*$/.test(lines[end] ?? '')) {
    end -= 1;
  }
  const trimmed = lines.slice(0, end + 1).join('\n');
  // Ensure exactly one final newline
  return `${trimmed}\n`;
};
