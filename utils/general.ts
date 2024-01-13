export function isSystemInDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
