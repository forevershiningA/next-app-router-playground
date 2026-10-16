export const normalizeThreeColorValue = (color: string) => {
  const trimmed = color.trim();
  return /^0x[0-9a-f]{6}$/i.test(trimmed) ? `#${trimmed.slice(2)}` : trimmed;
};
