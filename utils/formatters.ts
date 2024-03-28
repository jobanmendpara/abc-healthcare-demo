export function formatToPhone(input: string) {
  return `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
}
