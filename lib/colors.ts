// Brand color palette — primary blue scale centered on #2cb8f8.
// Tailwind's `blue-*` classes are remapped to this scale via globals.css.
// Use these constants for inline styles, SVG fills, and chart colors.

export const brand = {
  blue50:  "#e8f7fe",
  blue100: "#c5ecfd",
  blue200: "#8fd9fb",
  blue300: "#5cc5f9",
  blue400: "#43bef9",
  blue500: "#5ac6f9",
  blue600: "#2cb8f8", // primary — main buttons, links, accents
  blue700: "#10a6e8", // hover state
  blue800: "#0d8bc0", // active / pressed state
  blue900: "#085479",
  blue950: "#053d58",
} as const

export const PRIMARY_BLUE = brand.blue600
