export function calculatePageRange(page: number, size: number): { start: number, end: number } {
  const start = (page - 1) * size;
  const end = start + size;

  return { start, end };
}
