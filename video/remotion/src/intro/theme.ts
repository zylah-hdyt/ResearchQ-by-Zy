import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// ResearchQ dark palette. The orange dot is the brand mark and is reused across scenes.
export const C = {
  bg: "#0E0D0C",
  surface: "#1A1816",
  line: "#2C2925",
  ink: "#F4EFE7",
  mut: "#8E877C",
  orange: "#EE6A1F",
  clay: "#D97757",
  red: "#E5484D",
  amber: "#E8A13A",
};

export const SANS = "PlusJakarta";
export const MONO = "JetBrainsMono";

loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
