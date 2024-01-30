export function formatToPhone(input: string) {
  return `(${input.slice(1, 4)}) ${input.slice(4, 7)} - ${input.slice(7)}`;
}
