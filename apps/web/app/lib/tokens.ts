/**
 * Design tokens — JS mirror of app.css @theme.
 * Keep these values in sync with app.css. Used anywhere a token is needed
 * outside of CSS (e.g. inline canvas drawing, PDF generation, JS animations).
 *
 * For styling, prefer Tailwind utilities (text-brand, bg-card, font-display)
 * or `var(--token-name)` in CSS — those read straight from the source of truth.
 */

export const COLORS = {
  brand: "#FAC800",
  brandForeground: "#000000",
  brandDark: "#C99F00",

  ink: "#0A0A0A",
  inkStrong: "#000000",
  inkBody: "rgba(0, 0, 0, 0.85)",
  inkMuted: "rgba(0, 0, 0, 0.55)",
  inkSoft: "rgba(0, 0, 0, 0.45)",
  inkFaint: "rgba(0, 0, 0, 0.30)",

  line: "#e7e5e4",
  lineStrong: "#d6d3d1",

  background: "hsl(0 0% 99%)",
  foreground: "hsl(222 47% 6%)",
  card: "hsl(0 0% 100%)",
  destructive: "hsl(0 72% 51%)",
} as const;

export const FONTS = {
  sans:
    '"Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  display:
    '"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif',
  mono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const;

export const RADIUS = {
  base: "0.75rem",
} as const;

export type ColorToken = keyof typeof COLORS;
export type FontToken = keyof typeof FONTS;
