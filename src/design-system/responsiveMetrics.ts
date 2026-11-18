import type { TextStyle } from 'react-native';

/** Scale the 382 px content area inside the source's 430 px frame. */
export function contentScale(width: number) {
  return Math.min(1, Math.max(0, width - 48) / 382);
}
export function scaledTypography(style: TextStyle | undefined, scale: number): TextStyle {
  if (!style?.fontSize) return {};
  // Preserve small text; primary reading text never drops below 16 px.
  const fontSize = Math.max(Math.min(style.fontSize, 16), style.fontSize * scale);
  const ratio = fontSize / style.fontSize;
  return { fontSize, ...(style.lineHeight ? { lineHeight: style.lineHeight * ratio } : {}) };
}

