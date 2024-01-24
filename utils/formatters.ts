export function formatToPhone(input: string) {
  return `+1 (${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
}
